package com.tomshley.www.web.viewmodels

import com.tomshley.hexagonal.lib.reqreply.models.IdempotentView
import com.tomshley.www.web.models.ContactSubmission

final case class ContactFormView(formSubmission: Option[ContactSubmission] =
                                   Option.empty,
                                 messages: List[String] = List.empty,
                                 errors: List[String] = List.empty)
    extends IdempotentView
