package com.tomshley.www.web

import com.tomshley.hexagonal.lib.reqreply.exceptions.{ExpiredExpiringValueRejection, ReqReplyRejection}
import com.tomshley.hexagonal.lib.reqreply.forms.ErrorEnvelope
import com.tomshley.hexagonal.lib.staticassets.exceptions.StaticAssetRoutingRejection
import com.tomshley.www.web.models.{ContactSubmission, IdempotentContact}
import org.apache.pekko.http.scaladsl.model.*
import org.apache.pekko.http.scaladsl.model.StatusCodes.*
import org.apache.pekko.http.scaladsl.server.*
import org.apache.pekko.http.scaladsl.server.Directives.*

object WebRejectionHandlers {

  import com.tomshley.www.web.WebPresenters.*

  given globalRejectionHandler: RejectionHandler =
    RejectionHandler
      .newBuilder()
      .handleNotFound {
        extractUnmatchedPath { p =>
          complete(notFoundResponse())
        }
      }
      .result()

  def staticAssetRejectionHandler: RejectionHandler = {
    RejectionHandler
      .newBuilder()
      .handleAll[StaticAssetRoutingRejection] { _ =>
        complete {
          notFoundResponse()
        }

      }
      .result()
  }

  def contactPostValidationRejectionHandler: RejectionHandler = {
    RejectionHandler
      .newBuilder()
      .handleAll[ValidationRejection] { validationRejections =>
        optionalHeaderValueByName("X-Request-With") { (headerValOption: Option[String]) =>
          formFieldMap { (formFields: Map[String, String]) =>
            val contactSubmission = ContactSubmission(formFields)
            val errorEnvelope = ErrorEnvelope[IdempotentContact](contactSubmission, validationRejections)

            complete {
              contactFormErrorResponse(
                StatusCodes.BadRequest,
                formSubmission = Some(contactSubmission),
                errors = errorEnvelope.nonFieldErrors,
                fieldErrors = errorEnvelope.fieldErrors,
                headerValOption = headerValOption
              )
            }
          }
        }
      }
      .handleAll[ExpiredExpiringValueRejection] { _ =>
          formFieldMap { (formFields: Map[String, String]) =>
            val contactSubmission = ContactSubmission(formFields)
            contactSubmission.expiringFormFieldRedirectPathMaybe match
              case Some(expiringFormFieldRedirectPathMaybe) =>
                expiringFormFieldRedirectPathMaybe.value match
                  case Some(redirectPath) =>
                    redirect(redirectPath, StatusCodes.SeeOther)
                  case None =>
                    complete(notFoundResponse())
              case None =>
                complete(notFoundResponse())
          }
      }
      .handleAll[ReqReplyRejection] { reqReplyRejections =>
        optionalHeaderValueByName("X-Request-With") { (headerValOption: Option[String]) =>
          formFieldMap { (formFields: Map[String, String]) =>
            val contactSubmission = ContactSubmission(formFields)
            complete {
              contactFormErrorResponse(
                StatusCodes.BadRequest,
                formSubmission = Some(contactSubmission),
                errors = reqReplyRejections.map(_.message).toList,
                headerValOption = headerValOption
              )
            }
          }
        }
      }
  }
      .handleAll[Rejection] { reqReplyRejections =>
        optionalHeaderValueByName("X-Request-With") { (headerValOption: Option[String]) =>
          formFieldMap { (formFields: Map[String, String]) =>
            val contactSubmission = ContactSubmission(formFields)
            complete {
              contactFormErrorResponse(
                StatusCodes.BadRequest,
                formSubmission = Some(contactSubmission),
                errors = reqReplyRejections.map(_.toString).toList,
                headerValOption = headerValOption
              )
            }
          }
        }
      }
      .result()
  }
