package com.tomshley.www.web

import com.tomshley.www.web.viewmodels.ContactFormView
import org.apache.pekko.http.scaladsl.model.*
object WebPresenters {
  
  def contactFormErrorResponse(statusCode: StatusCode,
                               errors: List[String] = List.empty, headerValOption: Option[String] = None): HttpResponse = {
    contactFormResponse(ContactFormView(errors = errors), statusCode, headerValOption)

  }
  
  def contactFormResponse(contactFormView: ContactFormView, statusCode: StatusCode, headerValOption: Option[String] = None): HttpResponse = {
    HttpResponse(
      status = statusCode,
      entity = headerValOption match
        case Some(_) => HttpEntity(
          ContentTypes.`application/json`,
          WebJsonMarshalling.serializeWithDefaults[ContactFormView](contactFormView)
        )
        case _ => HttpEntity(
          ContentTypes.`text/html(UTF-8)`,
          html.contactthanks.render(contactFormView).body
        )
    )
  }

  def notFoundResponse(): HttpResponse = {
    HttpResponse(
      status = StatusCodes.NotFound,
      entity = HttpEntity(
        ContentTypes.`text/html(UTF-8)`,
        html.notfound
          .render()
          .body
      )
    )
  }
}
