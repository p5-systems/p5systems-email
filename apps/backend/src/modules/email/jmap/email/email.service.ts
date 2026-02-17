import { BadRequestException, Injectable, Logger } from "@nestjs/common";

import { ClientService } from "../client/client.service";
import { JMAP_CAPABILITIES } from "../client/client.type";
import {
  EmailChangesResponse,
  EmailObject,
  EmailParseResponse,
  EmailSetResponse,
} from "./email.type";
import {
  EmailDeleteDto,
  EmailGetDto,
  EmailMoveDto,
  EmailParseDto,
  EmailQueryDto,
  EmailSendDto,
  EmailSetFlagsDto,
} from "./email.dto";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly client: ClientService) {}

  async list(
    userId: string,
    query: EmailQueryDto,
    get: EmailGetDto = {},
  ): Promise<{ ids: string[]; emails: EmailObject[]; total?: number }> {
    const response = await this.client.execute(userId, (builder) =>
      builder
        .call(
          "Email/query",
          {
            filter: this.buildFilter(query),
            limit: query.limit ?? 20,
            position: query.position ?? 0,
            calculateTotal: query.calculateTotal ?? false,
            collapseThreads: query.collapseThreads ?? false,
          },
          "query",
        )
        .call(
          "Email/get",
          {
            properties: get.properties ?? [
              "id",
              "subject",
              "from",
              "to",
              "receivedAt",
              "preview",
              "hasAttachment",
              "keywords",
            ],
            fetchTextBodyValues: get.fetchTextBody ?? false,
            fetchHTMLBodyValues: get.fetchHtmlBody ?? false,
            maxBodyValueBytes: get.maxBodyBytes,
          },
          "get",
        )
        .ref("get", "ids", "query", "Email/query", "/ids"),
    );

    const queryResult = response.unwrap("query", "Email/query");
    const getResult = response.unwrap("get", "Email/get");

    return {
      ids: queryResult.ids,
      emails: getResult.list,
      total: queryResult.total,
    };
  }

  async getById(
    userId: string,
    emailId: string,
    get: EmailGetDto = {},
  ): Promise<EmailObject | null> {
    const response = await this.client.call(
      userId,
      "Email/get",
      {
        ids: [emailId],
        properties: get.properties ?? null,
        fetchTextBodyValues: get.fetchTextBody ?? true,
        fetchHTMLBodyValues: get.fetchHtmlBody ?? true,
        maxBodyValueBytes: get.maxBodyBytes,
      },
      "get",
    );

    const result = response.unwrap("get", "Email/get");
    return result.list[0] ?? null;
  }

  async getChanges(
    userId: string,
    sinceState: string,
    maxChanges = 50,
  ): Promise<EmailChangesResponse> {
    const response = await this.client.call(
      userId,
      "Email/changes",
      { sinceState, maxChanges },
      "changes",
    );

    return response.unwrap("changes", "Email/changes");
  }

  async setFlags(
    userId: string,
    dto: EmailSetFlagsDto,
  ): Promise<EmailSetResponse> {
    if (!dto.addKeywords?.length && !dto.removeKeywords?.length) {
      throw new BadRequestException(
        "Au moins un keyword à ajouter ou retirer est requis",
      );
    }

    const update: Record<string, Record<string, boolean | null>> = {};

    for (const id of dto.ids) {
      const patch: Record<string, boolean | null> = {};

      for (const kw of dto.addKeywords ?? []) {
        patch[`keywords/${kw}`] = true;
      }
      for (const kw of dto.removeKeywords ?? []) {
        patch[`keywords/${kw}`] = null;
      }

      update[id] = patch;
    }

    const response = await this.client.call(
      userId,
      "Email/set",
      { update },
      "set",
    );

    return response.unwrap("set", "Email/set");
  }

  async markAsRead(userId: string, ids: string[]): Promise<EmailSetResponse> {
    return this.setFlags(userId, { ids, addKeywords: ["$seen"] });
  }

  async markAsUnread(userId: string, ids: string[]): Promise<EmailSetResponse> {
    return this.setFlags(userId, { ids, removeKeywords: ["$seen"] });
  }

  async toggleFlagged(
    userId: string,
    ids: string[],
    flagged: boolean,
  ): Promise<EmailSetResponse> {
    return this.setFlags(userId, {
      ids,
      addKeywords: flagged ? ["$flagged"] : [],
      removeKeywords: flagged ? [] : ["$flagged"],
    });
  }

  async move(userId: string, dto: EmailMoveDto): Promise<EmailSetResponse> {
    const update: Record<string, Record<string, boolean | null>> = {};

    for (const id of dto.ids) {
      const patch: Record<string, boolean | null> = {
        [`mailboxIds/${dto.targetMailboxId}`]: true,
      };

      if (dto.fromMailboxId) {
        patch[`mailboxIds/${dto.fromMailboxId}`] = null;
      }

      update[id] = patch;
    }

    const response = await this.client.call(
      userId,
      "Email/set",
      { update },
      "set",
    );

    return response.unwrap("set", "Email/set");
  }

  async destroy(
    userId: string,
    dto: EmailDeleteDto,
  ): Promise<EmailSetResponse> {
    const response = await this.client.call(
      userId,
      "Email/set",
      { destroy: dto.ids },
      "set",
    );

    return response.unwrap("set", "Email/set");
  }

  async trash(
    userId: string,
    ids: string[],
    trashMailboxId: string,
  ): Promise<EmailSetResponse> {
    return this.move(userId, { ids, targetMailboxId: trashMailboxId });
  }

  async send(userId: string, dto: EmailSendDto): Promise<{ emailId: string }> {
    if (!dto.textBody && !dto.htmlBody) {
      throw new BadRequestException(
        "Au moins un corps (textBody ou htmlBody) est requis",
      );
    }

    const bodyValues: Record<string, { value: string }> = {};
    const textBody: { partId: string; type: string; charset: string }[] = [];
    const htmlBody: { partId: string; type: string; charset: string }[] = [];

    if (dto.textBody) {
      bodyValues["text"] = { value: dto.textBody };
      textBody.push({ partId: "text", type: "text/plain", charset: "utf-8" });
    }

    if (dto.htmlBody) {
      bodyValues["html"] = { value: dto.htmlBody };
      htmlBody.push({ partId: "html", type: "text/html", charset: "utf-8" });
    }

    const mailboxIds: Record<string, boolean> = {};
    if (dto.sentMailboxId) {
      mailboxIds[dto.sentMailboxId] = true;
    }

    const response = await this.client.execute(userId, (builder) => {
      builder.withCapability(JMAP_CAPABILITIES.SUBMISSION);

      return builder
        .call(
          "Email/set",
          {
            create: {
              draft: {
                from: dto.identityId ? undefined : [{ email: "", name: "" }],
                to: dto.to,
                cc: dto.cc,
                bcc: dto.bcc,
                subject: dto.subject,
                keywords: { $draft: true },
                mailboxIds,
                bodyValues,
                ...(textBody.length ? { textBody } : {}),
                ...(htmlBody.length ? { htmlBody } : {}),
              },
            },
          },
          "emailCreate",
        )
        .call(
          "EmailSubmission/set",
          {
            create: {
              submission: {
                identityId: dto.identityId ?? "",
                envelope: {
                  mailFrom: { email: "" },
                  rcptTo: [
                    ...dto.to,
                    ...(dto.cc ?? []),
                    ...(dto.bcc ?? []),
                  ].map((a) => ({ email: a.email })),
                },
              },
            },
          },
          "submission",
        )
        .ref(
          "submission",
          "emailId",
          "emailCreate",
          "Email/set",
          "/created/draft/id",
        );
    });

    const created = response.unwrap("emailCreate", "Email/set");
    const emailId = created.created?.["draft"]?.id;

    if (!emailId) {
      this.logger.error("Email créé mais ID absent de la réponse Email/set");
      throw new BadRequestException(
        `Échec de la création : ${JSON.stringify(created.notCreated)}`,
      );
    }

    return { emailId };
  }

  async parse(userId: string, dto: EmailParseDto): Promise<EmailParseResponse> {
    const response = await this.client.call(
      userId,
      "Email/parse",
      {
        blobIds: dto.blobIds,
        properties: dto.properties ?? [
          "id",
          "subject",
          "from",
          "to",
          "textBody",
          "htmlBody",
        ],
        fetchTextBodyValues: true,
        fetchHTMLBodyValues: true,
      },
      "parse",
    );

    return response.unwrap("parse", "Email/parse");
  }

  private buildFilter(query: EmailQueryDto) {
    const filter: Record<string, unknown> = {};

    if (query.inMailbox) filter["inMailbox"] = query.inMailbox;
    if (query.text) filter["text"] = query.text;
    if (query.from) filter["from"] = query.from;
    if (query.to) filter["to"] = query.to;
    if (query.subject) filter["subject"] = query.subject;
    if (query.hasKeyword) filter["hasKeyword"] = query.hasKeyword;
    if (query.hasAttachment !== undefined) {
      filter["hasAttachment"] = query.hasAttachment;
    }

    return Object.keys(filter).length ? filter : undefined;
  }
}
