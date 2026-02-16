import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { KeycloakModule } from "../../integration/keycloak/keycloak.module";
import { StalwartModule } from "../../integration/stalwart/stalwart.module";
import { MailProvisioningService } from "./provisioning.service";
import { CommonsModule } from "src/commons/commons.module";

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    KeycloakModule,
    StalwartModule,
    CommonsModule,
  ],
  providers: [MailProvisioningService],
  exports: [MailProvisioningService],
})
export class MailProvisioningModule {}
