val sourceMode = setSourceMode(false)

lazy val protoPackageRegistrySettings = Seq(
  resolvers += "Tomshley Proto Registry" at
    "https://gitlab.com/api/v4/projects/60384332/packages/maven",
  credentials += Credentials(file("./.secure_files/.credentials.gitlab"))
)

val web =
  publishableProject("www-tomshley-com-web-server", Some(file(".")))
    .enablePlugins(EdgeProjectPlugin, SrirachaPlugin, ForkJVMRunConfigPlugin)
    .sourceDependency(
      ProjectRef(file("../www-tomshley-com-proto"), "www-tomshley-com-proto"),
      "com.tomshley.www" % "www-tomshley-com-proto_3" % "0.0.1"
    )
    .settings(
      resolvers += "Tomshley Hexagonal Registry" at
        "https://gitlab.com/api/v4/projects/61841284/packages/maven",
      Compile / run / mainClass := Some("com.tomshley.www.web.main"),
//      dockerBaseImage := "docker.io/library/eclipse-temurin:21.0.1_12-jre-jammy",
      /*
       * web server
       * contact form service
       */
      dockerExposedPorts := Seq(8080, 9900, 80, 443),
      dockerBaseImage := "eclipse-temurin:21-jre-jammy",
      dockerUsername := Some("www-tomshley-com-web-server"),
      dockerRepository := Some(
        "registry.gitlab.com/tomshley/brands/usa/tomshleyllc/tech"
      ),
      resolvers += "GitLab" at
        "https://gitlab.com/api/v4/projects/61841284/packages/maven",
      Test / unmanagedResourceDirectories += baseDirectory.value / "src" / "main" / "public",
      Compile / unmanagedResourceDirectories += baseDirectory.value / "src" / "main" / "public"
    )
    .sourceDependency(
      ProjectRef(
        file(
          "../../../../global/tware/tech/products/hexagonal/hexagonal-lib-jvm"
        ),
        "hexagonal-lib"
      ),
      "com.tomshley.hexagonal" % "hexagonal-lib_3" % "0.0.13"
    )
    .settings(protoPackageRegistrySettings *)
