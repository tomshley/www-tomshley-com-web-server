package com.tomshley.www.web

import com.tomshley.hexagonal.lib.reqreply.exceptions.ReqReplyRejection
import com.tomshley.hexagonal.lib.staticassets.exceptions.StaticAssetRoutingRejection
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.{complete, extractUnmatchedPath, optionalHeaderValueByName}
import org.apache.pekko.http.scaladsl.server.{RejectionHandler, ValidationRejection}

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
          complete {
            contactFormErrorResponse(
              StatusCodes.BadRequest,
              errors = validationRejections.map(_.message).toList,
              headerValOption = headerValOption
            )
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
