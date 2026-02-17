import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ClientService } from "./client.service";
import { SessionModule } from "../session/session.module";
import { JmapResponseParser } from "./client.parser";
import { JmapRequestBuilder } from "./client.builder";

@Module({
  imports: [SessionModule, HttpModule],
  providers: [
    ClientService,
    JmapResponseParser,
    { provide: "JmapRequestBuilder", useValue: JmapRequestBuilder },
  ],
  exports: [ClientService, JmapResponseParser],
})
export class ClientModule {}
