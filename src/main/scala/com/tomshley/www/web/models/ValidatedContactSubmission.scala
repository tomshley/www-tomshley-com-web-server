package com.tomshley.www.web.models

import  com.tomshley.hexagonal.lib.reqreply.forms.models.{GroupedRequireEnvelope, NamedValidation}
import  com.tomshley.hexagonal.lib.reqreply.forms.{GroupedRequirements, Validations}
import com.tomshley.hexagonal.lib.marshalling.models.MarshallModel


final case class ValidatedContactSubmission(
                                             override val requestIdHmacString: String,
                                             override val successPathHmacString: String,
                                             override val redirectPathFormFieldHmacString: String,
                                             name: String,
                                             phone: String,
                                             email: String,
                                             message: String
                                           ) extends MarshallModel[ValidatedContactSubmission] with IdempotentContact with Validations with GroupedRequirements {

  override val validFields: Seq[String] = IdempotentContactFieldNames.validFields

  require(
    List(
      GroupedRequireEnvelope(
        requestIdFieldName.nonEmpty && requestIdExpiringValueMaybe.nonEmpty,
        NamedValidation("request-id", "Request id must be present. Please reload the page.")
      ),
      GroupedRequireEnvelope(name.nonEmpty, NamedValidation("name", "Name is required")),
      GroupedRequireEnvelope(name.length >= 3, NamedValidation("name", "Name has to be longer")),
      GroupedRequireEnvelope(phone.nonEmpty, NamedValidation("phone", "Phone number is required")),
      GroupedRequireEnvelope(isValidPhoneFormat(phone), NamedValidation("phone", "A valid phone number is required")),
      GroupedRequireEnvelope(email.nonEmpty, NamedValidation("email", "Email address is required")),
      GroupedRequireEnvelope(isValidEmailFormat(email), NamedValidation("email", "A valid email is required")),
      GroupedRequireEnvelope(message.nonEmpty, NamedValidation("message", "Message is required")),
      GroupedRequireEnvelope(isShortEnough(message, 500), NamedValidation("message", "Message is too long"))
    )
  )

}

object ValidatedContactSubmission {
  def apply(contactSubmission: IdempotentContact): IdempotentContact = {
    new ValidatedContactSubmission(
      contactSubmission.requestIdHmacString,
      contactSubmission.successPathHmacString,
      contactSubmission.redirectPathFormFieldHmacString,
      contactSubmission.name,
      contactSubmission.phone,
      contactSubmission.email,
      contactSubmission.message
    )
  }
}
