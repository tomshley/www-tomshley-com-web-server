package com.tomshley.www.web.viewmodels

sealed trait FormFieldView {
  val typeAttr: Option[String] = None
  val checked: Boolean = false
  val required: Boolean = false
  val display_hidden_input: Boolean = false
  val disabled: Boolean = false
  val name: Option[String] = None
  val errors: List[String] = List.empty[String]
  val error_data: Map[String, String] = Map.empty[String, String]
  val data_attrs: Map[String, String] = Map.empty[String, String]
  val value: Option[String] = None
  val label: Option[String] = None
  val placeholder: Option[String] = None
  val id: Option[String] = None
  val description: Option[String] = None
  val size: Option[Int] = None
  val minlength: Option[Int] = None
  val maxlength: Option[Int] = None
  val help_link: Option[String] = None
  val help_tooltip: Option[HelpToolTipView] = None
  val prefix_label: Option[String] = None
  val pattern: Option[String] = None
  val title: Option[String] = None
  val min: Option[Int] = None
  val max: Option[Int] = None
  val cssClass: Option[String] = None
  val passthrough_dict: Map[String, String] = Map.empty[String, String]
  val passthrough_dict_except: Option[String] = None
  val hideInnerContent: Boolean = false
  val formmethod: Option[String] = None
}


case class FormFieldInputView(inputName: String,
                              inputType: String = "text",
                              override val hideInnerContent: Boolean = false,
                              override val value: Option[String] = None,
                              override val size: Option[Int] = None,
                              override val label: Option[String] = None,
                              override val placeholder: Option[String] = None,
                              override val id: Option[String] = None,
                              override val required: Boolean = false,
                              override val minlength: Option[Int] = None,
                              override val maxlength: Option[Int] = None,
                              override val checked: Boolean = false,
                              override val help_link: Option[String] = None,
                              override val help_tooltip: Option[HelpToolTipView] = None,
                              override val prefix_label: Option[String] = None,
                              override val pattern: Option[String] = None,
                              override val title: Option[String] = None,
                              override val description: Option[String] = None,
                              override val errors: List[String] = List.empty[String],
                              override val min: Option[Int] = None,
                              override val max: Option[Int] = None,
                              override val disabled: Boolean = false,
                              override val display_hidden_input: Boolean = false,
                              override val error_data: Map[String, String] = Map.empty[String, String],
                              override val data_attrs: Map[String, String] = Map.empty[String, String]
                             ) extends FormFieldView {
  override val name: Option[String] = Some(inputName)
  override val typeAttr: Option[String] = Some(inputType)
}

case class FormFieldButtonView(
                                isSubmit: Boolean = false,

                                override val hideInnerContent: Boolean = false,
                                override val name: Option[String] = None,
                                override val value: Option[String] = None,
                                override val formmethod: Option[String] = None,
                                override val size: Option[Int] = None,
                                override val id: Option[String] = None,
                                override val cssClass: Option[String] = None) extends FormFieldView {
  override val typeAttr: Option[String] = if isSubmit then Some("submit") else None
}

case class FormFieldTextareaView(
                                  textareaName: String,
                                  override val hideInnerContent: Boolean = false,
                                  override val label: Option[String] = None,
                                  override val placeholder: Option[String] = None,
                                  override val id: Option[String] = None,
                                  override val required: Boolean = false,
                                  override val minlength: Option[Int] = None,
                                  override val maxlength: Option[Int] = None,
                                  override val title: Option[String] = None,
                                  override val description: Option[String] = None,
                                  override val errors: List[String] = List.empty[String],
                                  override val error_data: Map[String, String] = Map.empty[String, String],
                                  override val data_attrs: Map[String, String] = Map.empty[String, String]
                                ) extends FormFieldView {
  override val name: Option[String] = Some(textareaName)
}

case class FormFieldHiddenPassthroughsView(
                                            hiddenPassthrough_dict: Map[String, String],
                                            override val passthrough_dict_except: Option[String] = None) extends FormFieldView {
  override val passthrough_dict: Map[String, String] = hiddenPassthrough_dict
}