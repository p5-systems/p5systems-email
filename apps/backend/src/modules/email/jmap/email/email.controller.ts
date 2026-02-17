import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { JmapSessionGuard } from "../session/session.guard";
import { GetJmapSession } from "../session/session.decorator";
import { EmailService } from "./email.service";
import {
  EmailDeleteDto,
  EmailGetDto,
  EmailMoveDto,
  EmailParseDto,
  EmailQueryDto,
  EmailSendDto,
  EmailSetFlagsDto,
} from "./email.dto";
import type { JmapSession } from "../session/session.type";

@ApiTags("Email")
@UseGuards(JmapSessionGuard)
@Controller("jmap/email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  @ApiOperation({ summary: "Lister les emails avec filtres et pagination" })
  @ApiResponse({ status: 200, description: "Liste des emails" })
  async list(
    @GetJmapSession() session: JmapSession,
    @Query() query: EmailQueryDto,
    @Query() get: EmailGetDto,
  ) {
    return this.emailService.list(session.userId, query, get);
  }

  @Get(":id")
  @ApiOperation({ summary: "Récupérer un email par ID" })
  @ApiParam({ name: "id", description: "ID JMAP de l'email" })
  async getById(
    @GetJmapSession() session: JmapSession,
    @Param("id") id: string,
    @Query() get: EmailGetDto,
  ) {
    return this.emailService.getById(session.userId, id, get);
  }

  @Get("changes/:sinceState")
  @ApiOperation({ summary: "Récupérer les changements depuis un état de sync" })
  @ApiParam({
    name: "sinceState",
    description: "État JMAP depuis lequel récupérer les changements",
  })
  async getChanges(
    @GetJmapSession() session: JmapSession,
    @Param("sinceState") sinceState: string,
    @Query("maxChanges") maxChanges?: number,
  ) {
    return this.emailService.getChanges(session.userId, sinceState, maxChanges);
  }

  @Patch("flags")
  @ApiOperation({ summary: "Modifier les flags (keywords) d'emails" })
  async setFlags(
    @GetJmapSession() session: JmapSession,
    @Body() dto: EmailSetFlagsDto,
  ) {
    return this.emailService.setFlags(session.userId, dto);
  }

  @Patch("read")
  @ApiOperation({ summary: "Marquer des emails comme lus" })
  async markAsRead(
    @GetJmapSession() session: JmapSession,
    @Body("ids") ids: string[],
  ) {
    return this.emailService.markAsRead(session.userId, ids);
  }

  @Patch("unread")
  @ApiOperation({ summary: "Marquer des emails comme non lus" })
  async markAsUnread(
    @GetJmapSession() session: JmapSession,
    @Body("ids") ids: string[],
  ) {
    return this.emailService.markAsUnread(session.userId, ids);
  }

  @Patch(":id/flagged")
  @ApiOperation({ summary: "Étoiler ou dés-étoiler un email" })
  @ApiParam({ name: "id", description: "ID JMAP de l'email" })
  async toggleFlagged(
    @GetJmapSession() session: JmapSession,
    @Param("id") id: string,
    @Body("flagged") flagged: boolean,
  ) {
    return this.emailService.toggleFlagged(session.userId, [id], flagged);
  }

  @Patch("move")
  @ApiOperation({ summary: "Déplacer des emails vers une mailbox" })
  async move(
    @GetJmapSession() session: JmapSession,
    @Body() dto: EmailMoveDto,
  ) {
    return this.emailService.move(session.userId, dto);
  }

  @Delete("trash")
  @ApiOperation({ summary: "Mettre des emails à la corbeille" })
  async trash(
    @GetJmapSession() session: JmapSession,
    @Body("ids") ids: string[],
    @Body("trashMailboxId") trashMailboxId: string,
  ) {
    return this.emailService.trash(session.userId, ids, trashMailboxId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Supprimer définitivement des emails" })
  async destroy(
    @GetJmapSession() session: JmapSession,
    @Body() dto: EmailDeleteDto,
  ) {
    return this.emailService.destroy(session.userId, dto);
  }

  @Post("send")
  @ApiOperation({ summary: "Envoyer un email" })
  @ApiResponse({ status: 201, description: "Email envoyé, retourne l'emailId" })
  async send(
    @GetJmapSession() session: JmapSession,
    @Body() dto: EmailSendDto,
  ) {
    return this.emailService.send(session.userId, dto);
  }

  @Post("parse")
  @ApiOperation({
    summary: "Parser des blobs comme emails (ex: pièces jointes .eml)",
  })
  async parse(
    @GetJmapSession() session: JmapSession,
    @Body() dto: EmailParseDto,
  ) {
    return this.emailService.parse(session.userId, dto);
  }
}
