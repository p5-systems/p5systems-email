import cookieParser from "cookie-parser";
import session from "express-session";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>("app.port");
  const origins = configService
    .getOrThrow<string>("app.corsOrigins")
    .split(",");

  app.enableCors({
    origins,
    credentials: true,
  });

  app.use(helmet());

  app.use(cookieParser());
  app.use(
    session({
      secret: configService.getOrThrow<string>("auth.jwt.secret"),
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("p5systems emails API")
    .setDescription("The p5systems emails API description")
    .setVersion("1.0")
    .addTag("emails")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(port);
}

bootstrap().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
