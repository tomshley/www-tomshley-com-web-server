package com.tomshley.www.web.viewmodels

import com.tomshley.hexagonal.lib.marshalling.models.MarshallModel
import com.tomshley.hexagonal.lib.reqreply.models.{ExpiringSuccessPathView, ExpiringValue, IdempotentView, RedirectPathView}
import com.tomshley.www.web.models.IdempotentContact

final case class ContactFormView(getRenderPath:String = "/",
                                 successPathPrefix:String = "/contact/",
                                 postPathPrefix:String = "/contact/",
                                 formSubmission: Option[IdempotentContact] = Option.empty,
                                 messages: List[String] = List.empty,
                                 errors: List[String] = List.empty,
                                 fieldErrors: Map[String, List[String]] = Map.empty)
  extends MarshallModel[ContactFormView] with IdempotentView with ExpiringSuccessPathView with RedirectPathView{

  override def successValue: Option[String] =
    Some(s"$successPathPrefix$requestIdHmac")

  override def redirectPath: Option[String] =
    Some(getRenderPath)
}

