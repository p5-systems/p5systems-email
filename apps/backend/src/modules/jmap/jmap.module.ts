import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { JmapService } from "./jmap.service";
import { JmapController } from "./jmap.controller";
import { MailProvisioningModule } from "../mail-provisioning/mail-provisioning.module";

@Module({
    imports: [HttpModule, ConfigModule, MailProvisioningModule],
    providers: [JmapService],
    controllers: [JmapController],
})
export class JmapModule { }
