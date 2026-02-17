import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { EmailController } from "./email.controller";
import { ClientModule } from "../client/client.module";
import { KeycloakModule } from "src/modules/integration/keycloak/keycloak.module";
import { CommonsModule } from "src/commons/commons.module";
import { SessionModule } from "../session/session.module";

@Module({
  imports: [ClientModule, KeycloakModule, CommonsModule, SessionModule],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
