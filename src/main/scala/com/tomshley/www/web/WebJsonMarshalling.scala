package com.tomshley.www.web

import com.tomshley.hexagonal.lib.marshalling.JsonMarshaller
import com.tomshley.hexagonal.lib.marshalling.serializers.json.{AbsPathFileSerializer, AbsPathSerializer, DateTimeSerializer}
import org.json4s.{DefaultFormats, Formats}

import scala.languageFeature.postfixOps

sealed trait WebJsonMarshalling extends JsonMarshaller {
  override val marshallerFormats: Formats = DefaultFormats.preservingEmptyValues +
    new DateTimeSerializer +
    new AbsPathFileSerializer +
    new AbsPathSerializer

  //  override def serializeWithDefaults[T <: MarshallModel[T] : Manifest](model: T)(
  //    implicit formats: Formats = webFormat
  //  ): String = {
  //    super.serializeWithDefaults(model)
  //  }
  //
  //  override def deserializeWithDefaults[T <: MarshallModel[T] : Manifest](json: String)(
  //    implicit formats: Formats = webFormat
  //  ): T = super.deserializeWithDefaults(json)
  //
  //  override def serializeWithDefaultsAsync[T <: MarshallModel[T] : Manifest](model: T, ec: ExecutionContext)(
  //    implicit formats: Formats = webFormat
  //  ): Future[String] = super.serializeWithDefaultsAsync(model, ec)
  //
  //  override def deserializeWithDefaultsAsync[T <: MarshallModel[T] : Manifest](json: String, ec: ExecutionContext)(
  //    implicit formats: Formats = webFormat
  //  ): Future[T] = super.deserializeWithDefaultsAsync(json, ec)

  //  private def webFormat =
  //    new serializers.JavaEnumNameSerializer[PastePartType] +
  //    new serializers.JavaEnumNameSerializer[PasteAssetType] +
  //    new serializers.JavaEnumNameSerializer[PastedocExpression]
}

object WebJsonMarshalling extends WebJsonMarshalling
