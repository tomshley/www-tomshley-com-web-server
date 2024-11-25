package com.tomshley.www.web.models

import com.tomshley.hexagonal.lib.marshalling.models.MarshallModel

case class ContactSubmission(
                              override val requestIdHmacString: String,
                              override val successPathHmacString: String,
                              override val redirectPathFormFieldHmacString: String,
                              name: String,
                              phone: String,
                              email: String,
                              message: String
                                  ) extends MarshallModel[ContactSubmission] with IdempotentContact
object ContactSubmission {
  def apply(formFields: Map[String, String]): IdempotentContact = {
    new ContactSubmission(
      formFields.getOrElse(IdempotentContactFieldNames.requestIdFieldName, ""),
      formFields.getOrElse(IdempotentContactFieldNames.successPathFieldName, ""),
      formFields.getOrElse(IdempotentContactFieldNames.redirectPathFieldName, ""),
      formFields.getOrElse(IdempotentContactFieldNames.nameFieldName, ""),
      formFields.getOrElse(IdempotentContactFieldNames.phoneFieldName, ""),
      formFields.getOrElse(IdempotentContactFieldNames.emailFieldName, ""),
      formFields.getOrElse(IdempotentContactFieldNames.messageFieldName, "")
    )
  }
}