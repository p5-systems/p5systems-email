import { Module } from "@nestjs/common";
import { JmapService } from "./jmap.service";
import { JmapController } from "./jmap.controller";

@Module({
  imports: [],
  providers: [JmapService],
  controllers: [JmapController],
})
export class JmapModule {}
