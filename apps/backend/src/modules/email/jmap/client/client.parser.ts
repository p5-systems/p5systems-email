import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import {
  JmapError,
  JmapErrorType,
  JmapResponse,
  JmapInvocationResult,
  JmapMethodResponses,
  JmapParsedResponse,
} from "./client.type";

@Injectable()
export class JmapResponseParser {
  private readonly logger = new Logger(JmapResponseParser.name);

  parse(response: JmapResponse): JmapParsedResponse {
    const resultMap = new Map<string, JmapInvocationResult>();

    console.log(response);

    for (const [method, data, callId] of response.methodResponses) {
      if (method === "error") {
        const error = data as JmapError;

        this.logger.warn(
          `Erreur JMAP sur callId="${callId}" : type=${error.type} — ${error.description ?? "sans description"}`,
        );

        resultMap.set(callId, { ok: false, error });
      } else {
        resultMap.set(callId, { ok: true, data });
      }
    }

    return this.buildParsedResponse(
      resultMap,
      response.sessionState,
      response.createdIds ?? {},
    );
  }

  private buildParsedResponse(
    resultMap: Map<string, JmapInvocationResult>,
    sessionState: string,
    createdIds: Record<string, string>,
  ): JmapParsedResponse {
    return {
      sessionState,
      createdIds,
      get: <M extends keyof JmapMethodResponses>(
        callId: string,
      ): JmapInvocationResult<JmapMethodResponses[M]> | null => {
        const result = resultMap.get(callId);

        if (!result) {
          this.logger.warn(
            `callId="${callId}" introuvable dans la réponse JMAP`,
          );
          return null;
        }

        return result as JmapInvocationResult<JmapMethodResponses[M]>;
      },

      unwrap: <M extends keyof JmapMethodResponses>(
        callId: string,
      ): JmapMethodResponses[M] => {
        const result = resultMap.get(callId);

        if (!result) {
          throw new InternalServerErrorException(
            `callId="${callId}" absent de la réponse JMAP — le serveur n'a pas répondu à cette invocation`,
          );
        }

        if (!result.ok) {
          throw this.toNestException(result.error, callId);
        }

        return result.data as JmapMethodResponses[M];
      },
    };
  }

  private toNestException(error: JmapError, callId: string): Error {
    const message =
      `Erreur JMAP [${error.type}] sur callId="${callId}"` +
      (error.description ? ` : ${error.description}` : "");

    const map: Partial<Record<JmapErrorType, () => Error>> = {
      forbidden: () => new ForbiddenException(message),
      accountNotFound: () => new NotFoundException(message),
      accountReadOnly: () => new ForbiddenException(message),
      invalidArguments: () => new InternalServerErrorException(message),
      invalidResultReference: () => new InternalServerErrorException(message),
      unknownMethod: () => new InternalServerErrorException(message),
      serverUnavailable: () => new InternalServerErrorException(message),
      serverFail: () => new InternalServerErrorException(message),
    };

    const factory = map[error.type];

    return factory ? factory() : new InternalServerErrorException(message);
  }
}
