package com.tomshley.www.web.models

import com.tomshley.hexagonal.lib.marshalling.models.MarshallModel

case class ContactSubmission(
                                    requestId: String,
                                    name: String,
                                    phone: String,
                                    email: String,
                                    message: String
                                  ) extends MarshallModel[ContactSubmission] with IdempotentContact {

  override val validFields: Seq[String] = IdempotentContactFieldNames.validFields
}

object ContactSubmission {
  def apply(formFields: Map[String, String]): IdempotentContact = {
    new ContactSubmission(
      formFields.getOrElse(IdempotentContactFieldNames.requestId, ""),
      formFields.getOrElse(IdempotentContactFieldNames.name, ""),
      formFields.getOrElse(IdempotentContactFieldNames.phone, ""),
      formFields.getOrElse(IdempotentContactFieldNames.email, ""),
      formFields.getOrElse(IdempotentContactFieldNames.message, "")
    )
  }
}