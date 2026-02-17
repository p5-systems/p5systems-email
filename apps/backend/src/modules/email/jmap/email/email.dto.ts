import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { EmailKeyword, EmailProperty } from "./email.type";

export class EmailQueryDto {
  @ApiPropertyOptional({ description: "ID de la mailbox à filtrer" })
  @IsOptional()
  @IsString()
  inMailbox?: string;

  @ApiPropertyOptional({ description: "Recherche plein texte" })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: "Filtre sur expéditeur" })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: "Filtre sur destinataire" })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: "Filtre sur sujet" })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({
    description: "Filtre sur keyword JMAP (ex: $seen, $flagged)",
  })
  @IsOptional()
  @IsString()
  hasKeyword?: EmailKeyword;

  @ApiPropertyOptional({ description: "Emails avec pièces jointes uniquement" })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  hasAttachment?: boolean;

  @ApiPropertyOptional({
    description: "Position de départ pour la pagination",
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional({ description: "Nombre max de résultats", default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: "Inclure le total dans la réponse" })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  calculateTotal?: boolean;

  @ApiPropertyOptional({ description: "Grouper par thread" })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  collapseThreads?: boolean;
}

export class EmailGetDto {
  @ApiPropertyOptional({
    description: "Propriétés à retourner",
    type: [String],
    example: ["id", "subject", "from", "receivedAt"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  properties?: EmailProperty[];

  @ApiPropertyOptional({ description: "Inclure le corps texte" })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  fetchTextBody?: boolean;

  @ApiPropertyOptional({ description: "Inclure le corps HTML" })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  fetchHtmlBody?: boolean;

  @ApiPropertyOptional({ description: "Taille max du corps en bytes" })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxBodyBytes?: number;
}

export class EmailSetFlagsDto {
  @ApiProperty({ description: "IDs des emails à modifier" })
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @ApiPropertyOptional({
    description: "Keywords à ajouter",
    example: ["$seen", "$flagged"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addKeywords?: EmailKeyword[];

  @ApiPropertyOptional({
    description: "Keywords à retirer",
    example: ["$seen"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removeKeywords?: EmailKeyword[];
}

export class EmailMoveDto {
  @ApiProperty({ description: "IDs des emails à déplacer" })
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ description: "ID de la mailbox destination" })
  @IsString()
  targetMailboxId: string;

  @ApiPropertyOptional({
    description: "ID de la mailbox source (pour retirer explicitement)",
  })
  @IsOptional()
  @IsString()
  fromMailboxId?: string;
}

export class EmailDeleteDto {
  @ApiProperty({ description: "IDs des emails à supprimer" })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

export class EmailAddressDto {
  @ApiPropertyOptional()
  @IsString()
  name: string | null;

  @ApiProperty()
  @IsString()
  email: string;
}

export class EmailSendDto {
  @ApiProperty({ type: [EmailAddressDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAddressDto)
  to: EmailAddressDto[];

  @ApiPropertyOptional({ type: [EmailAddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAddressDto)
  cc?: EmailAddressDto[];

  @ApiPropertyOptional({ type: [EmailAddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAddressDto)
  bcc?: EmailAddressDto[];

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiPropertyOptional({ description: "Corps texte brut" })
  @IsOptional()
  @IsString()
  textBody?: string;

  @ApiPropertyOptional({ description: "Corps HTML" })
  @IsOptional()
  @IsString()
  htmlBody?: string;

  @ApiPropertyOptional({
    description: "ID de la mailbox Drafts (pour stocker avant envoi)",
  })
  @IsOptional()
  @IsString()
  draftMailboxId?: string;

  @ApiPropertyOptional({
    description: "ID de la mailbox Sent (pour archiver après envoi)",
  })
  @IsOptional()
  @IsString()
  sentMailboxId?: string;

  @ApiPropertyOptional({ description: "ID de l'identité expéditeur" })
  @IsOptional()
  @IsString()
  identityId?: string;
}

export class EmailParseDto {
  @ApiProperty({ description: "IDs de blobs à parser comme emails" })
  @IsArray()
  @IsString({ each: true })
  blobIds: string[];

  @ApiPropertyOptional({
    description: "Propriétés à retourner sur les emails parsés",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  properties?: EmailProperty[];
}
