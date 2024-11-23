package com.tomshley.www.web.viewmodels

import com.tomshley.hexagonal.lib.marshalling.models.MarshallModel
import com.tomshley.hexagonal.lib.reqreply.models.IdempotentView
import com.tomshley.www.web.models.IdempotentContact

final case class ContactFormView(formSubmission: Option[IdempotentContact] = Option.empty,
                                 messages: List[String] = List.empty,
                                 errors: List[String] = List.empty,
                                 fieldErrors: Map[String, List[String]] = Map.empty)
  extends MarshallModel[ContactFormView] with IdempotentView
