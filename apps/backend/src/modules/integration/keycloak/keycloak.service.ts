import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import KcAdminClient from "@keycloak/keycloak-admin-client";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";

@Injectable()
export class KeycloakService implements OnModuleInit {
  private readonly logger = new Logger(KeycloakService.name);
  private kcAdminClient: KcAdminClient;

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly realm: string;

  constructor(private readonly configService: ConfigService) {
    this.realm = this.configService.getOrThrow<string>("mail.keycloak.realm");

    this.kcAdminClient = new KcAdminClient({
      baseUrl: this.configService.getOrThrow<string>("mail.keycloak.url"),
      realmName: this.realm,
    });

    this.clientId = this.configService.getOrThrow<string>(
      "mail.keycloak.clientId",
    );
    this.clientSecret = this.configService.getOrThrow<string>(
      "mail.keycloak.clientSecret",
    );
  }

  async onModuleInit() {
    await this.authenticate();

    setInterval(() => {
      void this.authenticate();
    }, 120 * 1000);
  }

  private async authenticate(): Promise<void> {
    try {
      await this.kcAdminClient.auth({
        grantType: "client_credentials",
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      });
    } catch (error) {
      this.logger.error("Failed to authenticate with Keycloak", error);
    }
  }

  async getUser(userId: string): Promise<UserRepresentation | undefined> {
    return this.kcAdminClient.users.findOne({
      id: userId,
    });
  }

  getAttributeAsString(
    attrs: Record<string, unknown> | undefined,
    key: string,
  ): string | null {
    if (!attrs) return null;

    const value = attrs[key];

    if (value == null) return null;

    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      return typeof value[0] === "string" ? value[0] : String(value[0]);
    }

    if (
      typeof value == "string" ||
      typeof value == "number" ||
      typeof value == "boolean"
    ) {
      return String(value);
    }

    return null;
  }

  async updateUserAttribute(userId: string, key: string, value: string) {
    const user: UserRepresentation | undefined = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);

    const attributes = user.attributes || {};
    attributes[key] = [value];

    await this.kcAdminClient.users.update(
      { id: userId },
      {
        ...user,
        attributes: attributes,
      },
    );
  }
}
