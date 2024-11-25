package com.tomshley.www.web.models

import com.tomshley.hexagonal.lib.reqreply.forms.models.ValidFormFieldNames
import com.tomshley.hexagonal.lib.reqreply.models.{IdempotentFormField, RedirectPathFormField, ExpiringSuccessPathFormField}

trait IdempotentContact extends IdempotentContactFieldNames with IdempotentFormField with ExpiringSuccessPathFormField with RedirectPathFormField{
  val name: String
  val phone: String
  val email: String
  val message: String

  def toMap: Map[String, String] = Map(
    IdempotentContactFieldNames.requestIdFieldName -> requestIdHmacString,
    IdempotentContactFieldNames.successPathFieldName -> successPathHmacString,
    IdempotentContactFieldNames.redirectPathFieldName -> redirectPathFormFieldHmacString,
    IdempotentContactFieldNames.nameFieldName -> name,
    IdempotentContactFieldNames.phoneFieldName -> phone,
    IdempotentContactFieldNames.emailFieldName -> email,
    IdempotentContactFieldNames.messageFieldName -> message
  )

}
