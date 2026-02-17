import { JmapResultReference, JmapSetError } from "../client/client.type";

export type EmailProperty =
  | "id"
  | "blobId"
  | "threadId"
  | "mailboxIds"
  | "keywords"
  | "size"
  | "receivedAt"
  | "messageId"
  | "inReplyTo"
  | "references"
  | "sender"
  | "from"
  | "to"
  | "cc"
  | "bcc"
  | "replyTo"
  | "subject"
  | "sentAt"
  | "bodyStructure"
  | "bodyValues"
  | "textBody"
  | "htmlBody"
  | "attachments"
  | "hasAttachment"
  | "preview"
  | `header:${string}`;

export interface EmailAddress {
  name: string | null;
  email: string;
}

export type EmailKeyword =
  | "$seen"
  | "$answered"
  | "$flagged"
  | "$draft"
  | "$forwarded"
  | "$phishing"
  | "$junk"
  | "$notjunk"
  | (string & {});

export interface EmailFilterCondition {
  inMailbox?: string;
  inMailboxOtherThan?: string[];
  before?: string;
  after?: string;
  minSize?: number;
  maxSize?: number;
  allInThreadHaveKeyword?: EmailKeyword;
  someInThreadHaveKeyword?: EmailKeyword;
  noneInThreadHaveKeyword?: EmailKeyword;
  hasKeyword?: EmailKeyword;
  notKeyword?: EmailKeyword;
  hasAttachment?: boolean;
  text?: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body?: string;
  header?: [string, string?];
}

export interface EmailFilterOperator {
  operator: "AND" | "OR" | "NOT";
  conditions: EmailFilter[];
}

export type EmailFilter = EmailFilterCondition | EmailFilterOperator;

export type EmailSortProperty =
  | "receivedAt"
  | "sentAt"
  | "size"
  | "from"
  | "to"
  | "subject"
  | "hasKeyword"
  | "allInThreadHaveKeyword"
  | "someInThreadHaveKeyword";

export interface EmailSortComparator {
  property: EmailSortProperty;
  isAscending?: boolean;
  collation?: string;
  keyword?: EmailKeyword;
}

export type EmailBodyPartProperty =
  | "partId"
  | "blobId"
  | "size"
  | "name"
  | "type"
  | "charset"
  | "disposition"
  | "cid"
  | "language"
  | "location"
  | "subParts"
  | "headers";

export interface EmailBodyValue {
  value: string;
  isEncodingProblem?: boolean;
  isTruncated?: boolean;
}

export interface EmailGetArgs {
  accountId: string;
  ids?: string[] | null;
  "#ids"?: JmapResultReference;
  properties?: EmailProperty[] | null;
  bodyProperties?: EmailBodyPartProperty[];
  fetchTextBodyValues?: boolean;
  fetchHTMLBodyValues?: boolean;
  fetchAllBodyValues?: boolean;
  maxBodyValueBytes?: number;
}

export interface EmailQueryArgs {
  accountId: string;
  filter?: EmailFilter;
  sort?: EmailSortComparator[];
  position?: number;
  anchor?: string;
  anchorOffset?: number;
  limit?: number;
  calculateTotal?: boolean;
  collapseThreads?: boolean;
}

export interface EmailQueryChangesArgs {
  accountId: string;
  filter?: EmailFilter;
  sort?: EmailSortComparator[];
  sinceQueryState: string;
  maxChanges?: number;
  upToId?: string;
  calculateTotal?: boolean;
  collapseThreads?: boolean;
}

export interface EmailChangesArgs {
  accountId: string;
  sinceState: string;
  maxChanges?: number;
}

export interface EmailSetObject {
  mailboxIds?: Record<string, boolean>;
  keywords?: Partial<Record<EmailKeyword, boolean>>;
  receivedAt?: string;
  messageId?: string[];
  inReplyTo?: string[];
  references?: string[];
  sender?: EmailAddress[];
  from?: EmailAddress[];
  to?: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress[];
  subject?: string;
  sentAt?: string;
  bodyStructure?: EmailBodyPart;
  bodyValues?: Record<string, EmailBodyValue>;
  textBody?: EmailBodyPart[];
  htmlBody?: EmailBodyPart[];
  attachments?: EmailBodyPart[];
}

export interface EmailBodyPart {
  partId?: string;
  blobId?: string;
  size?: number;
  name?: string;
  type?: string;
  charset?: string;
  disposition?: "inline" | "attachment";
  cid?: string;
  language?: string[];
  location?: string;
  subParts?: EmailBodyPart[];
  headers?: Array<{ name: string; value: string }>;
}

export interface EmailSetArgs {
  accountId: string;
  ifInState?: string;
  create?: Record<string, EmailSetObject>;
  update?: Record<string, Partial<EmailSetObject>>;
  destroy?: string[];
  "#destroy"?: JmapResultReference;
}

export interface EmailCopyArgs {
  fromAccountId: string;
  ifFromInState?: string;
  accountId: string;
  ifInState?: string;
  create?: Record<string, { id: string } & Partial<EmailSetObject>>;
  onSuccessDestroyOriginal?: boolean;
  destroyFromIfInState?: string;
}

export interface EmailImportObject {
  blobId: string;
  mailboxIds: Record<string, boolean>;
  keywords?: Partial<Record<EmailKeyword, boolean>>;
  receivedAt?: string;
}

export interface EmailImportArgs {
  accountId: string;
  ifInState?: string;
  emails: Record<string, EmailImportObject>;
}

export interface EmailParseArgs {
  accountId: string;
  blobIds: string[];
  "#blobIds"?: JmapResultReference;
  properties?: EmailProperty[];
  bodyProperties?: EmailBodyPartProperty[];
  fetchTextBodyValues?: boolean;
  fetchHTMLBodyValues?: boolean;
  fetchAllBodyValues?: boolean;
  maxBodyValueBytes?: number;
}

export interface EmailMethodArgs {
  "Email/get": EmailGetArgs;
  "Email/query": EmailQueryArgs;
  "Email/queryChanges": EmailQueryChangesArgs;
  "Email/changes": EmailChangesArgs;
  "Email/set": EmailSetArgs;
  "Email/copy": EmailCopyArgs;
  "Email/import": EmailImportArgs;
  "Email/parse": EmailParseArgs;
}

export interface EmailGetResponse {
  accountId: string;
  state: string;
  list: EmailObject[];
  notFound: string[];
}

export interface EmailObject {
  id: string;
  blobId: string;
  threadId: string;
  mailboxIds: Record<string, boolean>;
  keywords: Record<string, boolean>;
  size: number;
  receivedAt: string;
  subject?: string;
  from?: Array<{ name: string | null; email: string }>;
  to?: Array<{ name: string | null; email: string }>;
  cc?: Array<{ name: string | null; email: string }>;
  bcc?: Array<{ name: string | null; email: string }>;
  replyTo?: Array<{ name: string | null; email: string }>;
  sentAt?: string;
  preview?: string;
  hasAttachment?: boolean;
  bodyValues?: Record<string, { value: string; isTruncated: boolean }>;
  textBody?: EmailBodyPartResponse[];
  htmlBody?: EmailBodyPartResponse[];
  attachments?: EmailBodyPartResponse[];
}

export interface EmailBodyPartResponse {
  partId?: string;
  blobId?: string;
  size: number;
  name?: string;
  type: string;
  charset?: string;
  disposition?: string;
  cid?: string;
}

export interface EmailQueryResponse {
  accountId: string;
  queryState: string;
  canCalculateChanges: boolean;
  position: number;
  ids: string[];
  total?: number;
}

export interface EmailSetResponse {
  accountId: string;
  oldState: string;
  newState: string;
  created: Record<string, EmailObject> | null;
  updated: Record<string, EmailObject | null> | null;
  destroyed: string[] | null;
  notCreated: Record<string, JmapSetError> | null;
  notUpdated: Record<string, JmapSetError> | null;
  notDestroyed: Record<string, JmapSetError> | null;
}

export interface EmailChangesResponse {
  accountId: string;
  oldState: string;
  newState: string;
  hasMoreChanges: boolean;
  created: string[];
  updated: string[];
  destroyed: string[];
}

export interface EmailQueryChangesResponse {
  accountId: string;
  oldQueryState: string;
  newQueryState: string;
  total?: number;
  removed: string[];
  added: Array<{ id: string; index: number }>;
}

export interface EmailImportResponse {
  accountId: string;
  oldState: string;
  newState: string;
  created: Record<string, EmailObject> | null;
  notCreated: Record<string, JmapSetError> | null;
}

export interface EmailParseResponse {
  accountId: string;
  parsed: Record<string, EmailObject> | null;
  notParsable: string[] | null;
  notFound: string[] | null;
}

export interface EmailCopyResponse {
  fromAccountId: string;
  accountId: string;
  oldState: string | null;
  newState: string;
  created: Record<string, EmailObject> | null;
  notCreated: Record<string, JmapSetError> | null;
}

export interface EmailSubmissionEnvelope {
  mailFrom: { email: string; parameters?: Record<string, string | null> };
  rcptTo: Array<{ email: string; parameters?: Record<string, string | null> }>;
}

export interface EmailSubmissionSetObject {
  identityId: string;
  emailId?: string; // fourni directement ou via back-reference
  envelope?: EmailSubmissionEnvelope;
  sendAt?: string;
}

export interface EmailSubmissionSetArgs {
  accountId: string;
  ifInState?: string;
  create?: Record<string, EmailSubmissionSetObject>;
  update?: Record<string, Partial<EmailSubmissionSetObject>>;
  destroy?: string[];
}

export interface EmailSubmissionGetArgs {
  accountId: string;
  ids: string[] | null;
  properties?: EmailSubmissionProperty[] | null;
}

export type EmailSubmissionProperty =
  | "id"
  | "identityId"
  | "emailId"
  | "threadId"
  | "envelope"
  | "sendAt"
  | "undoStatus"
  | "deliveryStatus"
  | "dsnBlobIds"
  | "mdnBlobIds";

export interface EmailSubmissionQueryArgs {
  accountId: string;
  filter?: { identityIds?: string[]; emailIds?: string[] };
  sort?: Array<{
    property: "emailId" | "identityId" | "sendAt";
    isAscending?: boolean;
  }>;
  position?: number;
  limit?: number;
}

export interface EmailSubmissionQueryChangesArgs {
  accountId: string;
  sinceQueryState: string;
  maxChanges?: number;
}

export interface EmailSubmissionMethodArgs {
  "EmailSubmission/get": EmailSubmissionGetArgs;
  "EmailSubmission/set": EmailSubmissionSetArgs;
  "EmailSubmission/query": EmailSubmissionQueryArgs;
  "EmailSubmission/queryChanges": EmailSubmissionQueryChangesArgs;
}
