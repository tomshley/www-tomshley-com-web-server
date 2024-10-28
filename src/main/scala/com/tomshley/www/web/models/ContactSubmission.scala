package com.tomshley.www.web.models

import com.tomshley.hexagonal.lib.reqreply.models.IdempotentRequestId

final case class ContactSubmission(requestId: String,
                                   name: String,
                                   phone: String,
                                   email: String,
                                   message: String) {

  lazy val idempotentRequestId: Option[IdempotentRequestId] = {
    IdempotentRequestId.fromBase64Hmac(requestId)
  }

  require(
    requestId.nonEmpty && idempotentRequestId.nonEmpty,
    "Request id must be present. Please reload the page."
  )
  require(name.nonEmpty, "Name is required")
  require(phone.nonEmpty, "Phone number is required")
  require(email.nonEmpty, "Email address is required")
  require(message.nonEmpty, "Message is required")

}
