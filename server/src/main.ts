import { LogLevel, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AppConfigService } from "./config/app/configuration.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const appConfig: AppConfigService = app.get(AppConfigService);

  app.enableCors({
    origin: appConfig.corsOrigin,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Accept, Authorization"
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix("/api/v1");
  app.useLogger([
    ...(appConfig.debug ? ["debug" as LogLevel] : []),
    "log",
    "warn",
    "error",
  ]);

  const config = new DocumentBuilder()
    .setTitle(appConfig.name)
    .setDescription("MANY Protocol Explorer API")
    .setVersion("0.1")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(appConfig.port);
}

bootstrap().catch((err) => console.error(err));
