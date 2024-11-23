package com.tomshley.www.web

import com.tomshley.hexagonal.lib.http2.extraction.formfield.exceptions.FormFieldException
import com.tomshley.hexagonal.lib.http2.extraction.formfield.exceptions.models.FormFieldExceptionSerializableEnvelope
import com.tomshley.hexagonal.lib.http2.extraction.formfield.models.NamedValidation
import com.tomshley.hexagonal.lib.marshalling.JsonMarshaller
import com.tomshley.hexagonal.lib.reqreply.exceptions.ReqReplyRejection
import com.tomshley.hexagonal.lib.staticassets.exceptions.StaticAssetRoutingRejection
import com.tomshley.www.web.models.{ContactSubmission, IdempotentContact}
import org.apache.pekko.http.scaladsl.model.*
import org.apache.pekko.http.scaladsl.model.StatusCodes.*
import org.apache.pekko.http.scaladsl.server.*
import org.apache.pekko.http.scaladsl.server.Directives.*

object WebRejectionHandlers {

  import com.tomshley.www.web.WebPresenters.*

  implicit def globalRejectionHandler: RejectionHandler =
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
      .handleAll[StaticAssetRoutingRejection] { validationRejections =>
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
            val fieldNamesMessages: Map[String, List[String]] = validationRejections
              .filter(
                _.cause match
                  case Some(FormFieldException(_, _)) =>
                    true
                  case _ =>
                    false
              )
              .map((rejection) =>
                try {
                  Some(JsonMarshaller.deserializeWithDefaults[FormFieldExceptionSerializableEnvelope](rejection.message))
                } catch {
                  case _ => {
                    Option.empty[FormFieldExceptionSerializableEnvelope]
                  }
                }
              )
              .filter(errorValidationMaybe => {
                errorValidationMaybe.isDefined
              }).flatMap(errorValidationMaybe => {
                errorValidationMaybe.get.errors
              })
              .filter(formFieldErrorValidation => {
                contactSubmission.validFields.contains(formFieldErrorValidation.fieldName)
              })
              .foldLeft(Map.empty[String, List[String]]) { case (errorMap: Map[String, List[String]], formFieldErrorValidation: NamedValidation) =>
                errorMap + (formFieldErrorValidation.fieldName -> (errorMap.getOrElse(formFieldErrorValidation.fieldName, List.empty[String]) :+ formFieldErrorValidation.message))
              }

            val nonFieldErrors = validationRejections
              .filter(
                _.cause match
                    case Some(FormFieldException(_, _)) => false
                    case _ => true
                )
              .map(rejection => rejection.message).toList

            complete {
              contactFormErrorResponse(
                StatusCodes.BadRequest,
                formSubmission = Some(contactSubmission),
                errors = nonFieldErrors,
                fieldErrors = fieldNamesMessages,
                headerValOption = headerValOption
              )
            }
          }
        }
      }
      .handleAll[ReqReplyRejection] { reqReplyRejections =>
        optionalHeaderValueByName("X-Request-With") { (headerValOption: Option[String]) =>
          complete {
            contactFormErrorResponse(
              StatusCodes.BadRequest,
              errors = reqReplyRejections.map(_.message).toList,
              headerValOption = headerValOption
            )
          }
        }
      }
      .result()
  }
}
