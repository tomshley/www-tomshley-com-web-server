package com.tomshley.www.web

import com.tomshley.hexagonal.lib.ManagedPekkoClusterMain
import com.tomshley.hexagonal.lib.http2.WebServerBoilerplate
import com.tomshley.hexagonal.lib.reqreply.Idempotent
import com.tomshley.www.inboundcontact.proto.{InboundContactService, InboundContactServiceClient}
import org.apache.pekko.actor
import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.grpc.GrpcClientSettings


@main def main(): Unit =
  ManagedPekkoClusterMain("www-tomshley-com-web-server", (system: ActorSystem[?]) => {
    Idempotent.init(system)

    WebServerBoilerplate.start(
      system.settings.config
        .getString("www-tomshley-com-web-server.http.hostname"),
      system.settings.config.getInt("www-tomshley-com-web-server.http.port"),
      system,
      WebRouting(system, wwwContactServiceClient(system))
    )
  })

  def wwwContactServiceClient(
                               system: ActorSystem[?]
                             ): InboundContactService = {
    val contactServiceClientSettings =
      GrpcClientSettings
        .connectToServiceAt(
          system.settings.config
            .getString("www-tomshley-com-web-server.www-tomshley-com-inboundcontact-service-client.grpc.interface"),
          system.settings.config.getInt("www-tomshley-com-web-server.www-tomshley-com-inboundcontact-service-client.grpc.port")
        )(system)
        .withTls(false)
    InboundContactServiceClient(contactServiceClientSettings)(system)
  }
