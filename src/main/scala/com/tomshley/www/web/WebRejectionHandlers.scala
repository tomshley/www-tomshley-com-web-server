package com.tomshley.www.web

import com.tomshley.hexagonal.lib.reqreply.exceptions.ReqReplyRejection
import com.tomshley.hexagonal.lib.staticassets.exceptions.StaticAssetRoutingRejection
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.{complete, extractUnmatchedPath}
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
        complete {
          contactFormResponse(
            StatusCodes.BadRequest,
            errors = validationRejections.map(_.message).toList
          )
        }

      }
      .handleAll[ReqReplyRejection] { reqReplyRejections =>
        complete {
          contactFormResponse(
            StatusCodes.BadRequest,
            errors = reqReplyRejections.map(_.message).toList
          )
        }
      }
      .result()
  }
}
