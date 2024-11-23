package com.tomshley.www.web.models

import com.tomshley.hexagonal.lib.http2.extraction.formfield.models.FormFieldNames

trait IdempotentContactFieldNames extends FormFieldNames {
  final val requestId = "request-id"
  final val name = "name"
  final val phone = "phone"
  final val email = "email"
  final val message = "message"

  final val validFields = Seq(
    requestId,
    name,
    phone,
    email,
    message
  )
}

object IdempotentContactFieldNames extends IdempotentContactFieldNames
