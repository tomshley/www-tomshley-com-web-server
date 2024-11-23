package com.tomshley.www.web

import com.tomshley.hexagonal.lib.http2.WebServerRoutingBoilerplate
import com.tomshley.hexagonal.lib.reqreply.Idempotency
import com.tomshley.hexagonal.lib.reqreply.exceptions.{IdempotentRejection, UnknownRejection}
import com.tomshley.hexagonal.lib.reqreply.models.IdempotentRequestId.IdempotentRequestExpired
import com.tomshley.hexagonal.lib.staticassets.StaticAssetRouting
import com.tomshley.www.contact.proto.{ContactService, InboundContactResponse, InitiateInboundContactRequest}
import com.tomshley.www.web.models.{ContactSubmission, IdempotentContact, IdempotentContactFieldNames, ValidatedContactSubmission}
import com.tomshley.www.web.viewmodels.ContactFormView
import org.apache.pekko.actor
import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.http.scaladsl.model.*
import org.apache.pekko.http.scaladsl.model.StatusCodes.*
import org.apache.pekko.http.scaladsl.server.*
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.directives.BasicDirectives.extract
import org.apache.pekko.util.Timeout
import org.slf4j.{Logger, LoggerFactory}

import scala.concurrent.Future
import scala.jdk.CollectionConverters.*
import scala.util.{Failure, Success}

object WebRouting extends WebServerRoutingBoilerplate with StaticAssetRouting {

  import WebPresenters.*
  import WebRejectionHandlers.*

  def apply(system: ActorSystem[?],
            wwwContactService: ContactService): Seq[Route] = {
    val logger: Logger = LoggerFactory.getLogger(getClass)
    routes[(Idempotency, ContactService)](
      system,
      Some((Idempotency(system), wwwContactService))
    )
  }

  override def routes[A](system: ActorSystem[?], arg: Option[A]): Seq[Route] = {
    def tuple1 = arg.get.asInstanceOf[(Idempotency, ContactService)]

    Seq(
      contactRouteGet,
      handleRejections(staticAssetRejectionHandler) {
        getStaticAssetRoute(system)
      },
      contactRoutePostIdempotent(system, tuple1._1, tuple1._2)
    )
  }

  private val contactRouteGet = {
    path("") {
      get {
        complete(contactFormErrorResponse(StatusCodes.OK))
      }
    }
  }

  private def contactRoutePostIdempotent(system: ActorSystem[?],
                                         idempotency: Idempotency,
                                         wwwContactService: ContactService) =
    path("") {
      handleRejections(contactPostValidationRejectionHandler) {
        post {
          formFields(
            IdempotentContactFieldNames.requestId,
            IdempotentContactFieldNames.name,
            IdempotentContactFieldNames.phone,
            IdempotentContactFieldNames.email,
            IdempotentContactFieldNames.message,
          ).as(fields =>
            ValidatedContactSubmission(
              ContactSubmission(
                fields._1,
                fields._2,
                fields._3,
                fields._4,
                fields._5
              )
            )
          ) { (contactSubmission: IdempotentContact) =>
            extractExecutionContext { implicit executor =>
              onComplete {
                implicit val timeout: Timeout = {
                  Timeout.create(
                    system.settings.config
                      .getDuration(
                        "tomshley-hexagonal-reqreply-idempotency.ask-timeout"
                      )
                  )
                }

                idempotency.reqReply(
                  requestId = contactSubmission.idempotentRequestId.get,
                  responseBodyCallback = {
                    wwwContactService
                      .inboundContact(
                        InitiateInboundContactRequest(
                          name = contactSubmission.name,
                          phone = contactSubmission.phone,
                          email = contactSubmission.email,
                          message = contactSubmission.message
                        )
                      )
                      .map((inboundContactResponse: InboundContactResponse) => {
                        Idempotency
                          .RequestReply(
                            Option.empty,
                            Some(inboundContactResponse.toProtoString)
                          )
                      })
                  }
                )
              } {
                case scala.util.Failure(exception: IdempotentRequestExpired) =>
                  reject(IdempotentRejection(exception.getMessage))
                case scala.util.Failure(exception: Exception) =>
                  reject(UnknownRejection(exception.getMessage))
                case scala.util.Failure(_) =>
                  reject(UnknownRejection("Unknown error occurred"))
                case scala.util.Success(responseValue) =>
                  optionalHeaderValueByName("X-Request-With") { (headerValOption: Option[String]) =>
                    complete(contactFormResponse(
                      ContactFormView(
                        messages = List(
                          InboundContactResponse
                            .fromAscii(responseValue.body.get)
                            .replyMessage
                        )
                      ),
                      StatusCodes.Created,
                      headerValOption
                    ))
                }
              }
            }
          }
        }
      }
    }
}
