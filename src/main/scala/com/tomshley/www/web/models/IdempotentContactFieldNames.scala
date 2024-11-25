package com.tomshley.www.web.models

import com.tomshley.hexagonal.lib.reqreply.forms.models.ValidFormFieldNames
import com.tomshley.hexagonal.lib.reqreply.models.{IdempotentFormFieldNames, RedirectPathFormFieldNames, ExpiringSuccessPathFormFieldNames}

trait IdempotentContactFieldNames extends ValidFormFieldNames with IdempotentFormFieldNames with ExpiringSuccessPathFormFieldNames with RedirectPathFormFieldNames {
  final val nameFieldName = "name"
  final val phoneFieldName = "phone"
  final val emailFieldName = "email"
  final val messageFieldName = "message"

  override def validFields: Seq[String] = super.validFields ++ Seq(
    requestIdFieldName,
    successPathFieldName,
    redirectPathFieldName,
    nameFieldName,
    phoneFieldName,
    emailFieldName,
    messageFieldName
  )
}

object IdempotentContactFieldNames extends IdempotentContactFieldNames
