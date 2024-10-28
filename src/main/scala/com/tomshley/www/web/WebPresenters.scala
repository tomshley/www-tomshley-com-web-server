package com.tomshley.www.web

import com.tomshley.www.web.viewmodels.ContactFormView
import org.apache.pekko.http.scaladsl.model.{
  ContentTypes,
  HttpEntity,
  HttpResponse,
  StatusCode,
  StatusCodes
}
object WebPresenters {
  def homePageResponse: HttpResponse = HttpResponse(
    entity = HttpEntity(
      ContentTypes.`text/html(UTF-8)`,
      html.home.render(ContactFormView()).body
    )
  )
  def contactFormResponse(statusCode: StatusCode,
                          errors: List[String] = List.empty): HttpResponse = {
    HttpResponse(
      status = statusCode,
      entity = HttpEntity(
        ContentTypes.`text/html(UTF-8)`,
        html.contact
          .render(ContactFormView(errors = errors))
          .body
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
