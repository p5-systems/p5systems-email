import {
  JMAP_CAPABILITIES,
  JmapCapability,
  JmapInvocation,
  JmapMethod,
  JmapMethodArgs,
  JmapRawArgs,
  JmapRequest,
  JmapResultReference,
} from "./client.type";

export class JmapRequestBuilder {
  private readonly invocations: JmapInvocation[] = [];

  private readonly capabilities = new Set<JmapCapability>([
    JMAP_CAPABILITIES.CORE,
    JMAP_CAPABILITIES.MAIL,
  ]);

  private readonly argsIndex = new Map<string, JmapRawArgs>();

  constructor(private readonly accountId?: string) {}

  call<M extends keyof JmapMethodArgs>(
    method: M,
    args: Omit<JmapMethodArgs[M], "accountId">,
    callId: string,
  ): this {
    if (this.argsIndex.has(callId)) {
      throw new Error(
        `callId "${callId}" déjà utilisé dans ce batch. Les callIds doivent être uniques.`,
      );
    }

    const fullArgs: JmapRawArgs = {
      ...(this.accountId ? { accountId: this.accountId } : {}),
      ...args,
    };

    this.invocations.push([
      method,
      fullArgs as unknown as JmapMethodArgs[M],
      callId,
    ]);
    this.argsIndex.set(callId, fullArgs);

    return this;
  }

  ref(
    callId: string,
    argKey: string,
    resultOf: string,
    resultName: JmapMethod,
    path: string,
  ): this {
    const args = this.argsIndex.get(callId);

    if (resultName === "error") {
      throw new Error(
        `Back-reference invalide : resultName="error" n'est pas une méthode valide pour une référence. ` +
          `Les références ne peuvent pointer que vers des résultats de méthodes valides, pas vers des erreurs.`,
      );
    }

    if (!args) {
      throw new Error(
        `Impossible d'ajouter une back-reference : callId "${callId}" introuvable. ` +
          `Appelez .call("${callId}", ...) avant .ref().`,
      );
    }

    if (!this.argsIndex.has(resultOf)) {
      throw new Error(
        `Back-reference invalide : resultOf="${resultOf}" n'existe pas dans ce batch.`,
      );
    }

    const reference: JmapResultReference = {
      resultOf,
      name: resultName,
      path,
    };

    args[`#${argKey}`] = reference;
    delete args[argKey];

    return this;
  }

  withCapability(capability: JmapCapability): this {
    this.capabilities.add(capability);
    return this;
  }

  build(): JmapRequest {
    if (this.invocations.length === 0) {
      throw new Error(
        "Le batch est vide. Ajoutez au moins une invocation avec .call().",
      );
    }

    return {
      using: Array.from(this.capabilities),
      methodCalls: this.invocations.map(([method, args, callId]) => [
        method,
        { ...args },
        callId,
      ]),
    };
  }

  static single<M extends keyof JmapMethodArgs>(
    accountId: string,
    method: M,
    args: Omit<JmapMethodArgs[M], "accountId">,
    callId = "r1",
  ): JmapRequest {
    return new JmapRequestBuilder(accountId).call(method, args, callId).build();
  }

  static queryThenGet<
    QM extends keyof JmapMethodArgs & `${string}/query`,
    GM extends keyof JmapMethodArgs & `${string}/get`,
  >(
    accountId: string,
    queryMethod: QM,
    getMethod: GM,
    queryArgs: Omit<JmapMethodArgs[QM], "accountId">,
    getArgs: Omit<JmapMethodArgs[GM], "accountId">,
  ): JmapRequest {
    return new JmapRequestBuilder(accountId)
      .call(queryMethod, queryArgs, "query")
      .call(getMethod, getArgs, "get")
      .ref("get", "ids", "query", queryMethod as JmapMethod, "/ids")
      .build();
  }
}
