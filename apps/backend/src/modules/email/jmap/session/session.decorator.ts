import {
  createParamDecorator,
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from "@nestjs/common";
import type { Request } from "express";

export const GetJmapSession = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.user)
      throw new UnauthorizedException("User not authenticated");
    if (!request.jmap)
      throw new ForbiddenException("User does not have a JMAP session");
    return request.jmap;
  },
);
