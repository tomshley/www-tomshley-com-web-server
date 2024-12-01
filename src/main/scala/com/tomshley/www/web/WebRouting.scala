package com.tomshley.www.web

import com.tomshley.hexagonal.lib.http2.WebServerRoutingBoilerplate
import com.tomshley.hexagonal.lib.reqreply.{ExpiringValueDirectives, Idempotency, IdempotencyDirectives, Idempotent}
import com.tomshley.hexagonal.lib.staticassets.StaticAssetRouting
import com.tomshley.www.inboundcontact.proto.{InboundContactService, InboundContactResponse, InitiateInboundContactRequest}
import com.tomshley.www.web.WebRejectionHandlers.globalRejectionHandler
import com.tomshley.www.web.models.{ContactSubmission, IdempotentContact, IdempotentContactFieldNames, ValidatedContactSubmission}
import com.tomshley.www.web.viewmodels.ContactFormView
import org.apache.pekko.actor
import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.http.scaladsl.model.*
import org.apache.pekko.http.scaladsl.model.StatusCodes.*
import org.apache.pekko.http.scaladsl.server.*
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.util.Timeout

import scala.concurrent.Future

object WebRouting extends WebServerRoutingBoilerplate with StaticAssetRouting with IdempotencyDirectives {

  import WebPresenters.*
  import WebRejectionHandlers.*

  private val contactRouteGet = {
    path("") {
      get {
        complete(contactFormErrorResponse(StatusCodes.OK))
      }
    }
  }

  private def contactRoutePostIdempotent(system: ActorSystem[?], idempotency: Idempotency, wwwContactService: InboundContactService) = path("contact" / ExpiringValueDirectives.pathMatcher) { matched =>
    get {
      ExpiringValueDirectives.expiringValue(matched) { validatedExpiringRequestId =>
        optionalHeaderValueByName("X-Request-With") { (headerValOption: Option[String]) =>
          getRequestId(idempotency, validatedExpiringRequestId) { (summary: Idempotent.Summary) =>
            complete(WebPresenters.contactFormResponse(ContactFormView(messages = List(InboundContactResponse.fromAscii(summary.replyBody.get).replyMessage)), StatusCodes.OK, headerValOption))
          }
        }
      }
    } ~ post {
      ExpiringValueDirectives.expiringValue(matched) { validatedExpiringRequestId =>
        formFields(IdempotentContactFieldNames.requestIdFieldName, IdempotentContactFieldNames.successPathFieldName, IdempotentContactFieldNames.redirectPathFieldName, IdempotentContactFieldNames.nameFieldName, IdempotentContactFieldNames.phoneFieldName, IdempotentContactFieldNames.emailFieldName, IdempotentContactFieldNames.messageFieldName).as(fields => ValidatedContactSubmission(ContactSubmission(fields._1, fields._2, fields._3, fields._4, fields._5, fields._6, fields._7))) { (contactSubmission: IdempotentContact) =>
          extractExecutionContext { implicit executor =>
            implicit val timeout: Timeout = {
              Timeout.create(system.settings.config.getDuration("tomshley-hexagonal-reqreply-idempotency.ask-timeout"))
            }
            idempotentRequestReply(idempotency, validatedExpiringRequestId, {
              wwwContactService.inboundContact(InitiateInboundContactRequest(name = contactSubmission.name, phone = contactSubmission.phone, email = contactSubmission.email, message = contactSubmission.message)).map((inboundContactResponse: InboundContactResponse) => {
                Idempotency.RequestReply(Option.empty, Some(inboundContactResponse.toProtoString))
              })
            }) { (_: Idempotency.RequestReply) =>
              optionalHeaderValueByName("X-Request-With") { (_: Option[String]) =>
                ExpiringValueDirectives.expiringValue(contactSubmission.successPathHmacString) { expiringSuccessPath =>
                  redirect(expiringSuccessPath.value.getOrElse(""), StatusCodes.SeeOther)
                }
              }
            }
          }
        }
      }
    }
  }

  def apply(system: ActorSystem[?], wwwContactService: InboundContactService): Seq[Route] = {
    routes[(Idempotency, InboundContactService)](system, Some((Idempotency(system), wwwContactService)))
  }


  override def routes[A](system: ActorSystem[?], arg: Option[A]): Seq[Route] = {
    val typedArgs = arg.get.asInstanceOf[(Idempotency, InboundContactService)]

    Seq(
      handleRejections(staticAssetRejectionHandler) {
        getStaticAssetRoute(system)
      },
      handleRejections(contactPostValidationRejectionHandler) {
        contactRoutePostIdempotent(
          system,
          typedArgs._1,
          typedArgs._2
        )
      },
      handleRejections(globalRejectionHandler) {
        contactRouteGet
      }
    )
  }
}
