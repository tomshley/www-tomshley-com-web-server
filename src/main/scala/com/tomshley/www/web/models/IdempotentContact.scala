package com.tomshley.www.web.models

import com.tomshley.hexagonal.lib.http2.extraction.formfield.models.FormFieldNames
import com.tomshley.hexagonal.lib.reqreply.models.IdempotentRequestId

trait IdempotentContact extends FormFieldNames {
  val requestId: String
  val name: String
  val phone: String
  val email: String
  val message: String

  def toMap: Map[String, String] = Map(
    IdempotentContactFieldNames.requestId -> requestId,
    IdempotentContactFieldNames.name -> name,
    IdempotentContactFieldNames.phone -> phone,
    IdempotentContactFieldNames.email -> email,
    IdempotentContactFieldNames.message -> message
  )

  lazy val idempotentRequestId: Option[IdempotentRequestId] = {
    IdempotentRequestId.fromBase64Hmac(requestId)
  }
}
