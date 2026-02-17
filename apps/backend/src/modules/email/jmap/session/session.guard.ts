import { ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { KeycloakService } from "src/modules/integration/keycloak/keycloak.service";
import { CryptoService } from "src/commons/crypto/crypto.service";
import { SessionService } from "./session.service";

@Injectable()
export class JmapSessionGuard {
  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly cryptoService: CryptoService,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) return false;

    const authUser = await this.keycloakService.getUser(user.id);
    if (!authUser) return false;

    const { id, email, username, attributes } = authUser;

    const encryptedPassword = this.keycloakService.getAttributeAsString(
      attributes,
      "mail_password",
    );

    if (!id || !email || !username || !encryptedPassword) return false;

    const jmapSession = this.sessionService.createSession(id, {
      token: this.createToken(username, encryptedPassword),
    });

    request.jmap = jmapSession;

    return true;
  }

  createToken(username: string, encryptedPassword: string): string {
    const password = this.cryptoService.decrypt(encryptedPassword);
    return Buffer.from(`${username}:${password}`).toString("base64");
  }
}
