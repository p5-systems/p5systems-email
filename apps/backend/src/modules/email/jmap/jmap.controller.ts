import { Controller, UseGuards } from "@nestjs/common";
import { JmapService } from "./jmap.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

@Controller("jmap")
@UseGuards(JwtAuthGuard)
export class JmapController {
  constructor(private readonly jmapService: JmapService) {}
}
