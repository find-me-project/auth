import { isValid } from 'date-fns';
import { NextFunction, Request, Response } from 'express';
import ValidationError from 'src/util/error/validation-error';
import { forbidden, getHeader } from './util';

export default function isAuthenticated (request: Request, response: Response, next: NextFunction): void {
  const {
    HEADER_KONG_AUTH_PERSON_ID,
    HEADER_KONG_AUTH_ACCOUNT_ID,
    HEADER_KONG_AUTH_TOKEN_ID,
    HEADER_KONG_AUTH_STATUS,
    HEADER_KONG_AUTH_ROLE,
    HEADER_KONG_AUTH_CREATED_AT,
  } = process.env;

  if (
    !HEADER_KONG_AUTH_PERSON_ID
      || !HEADER_KONG_AUTH_ACCOUNT_ID
      || !HEADER_KONG_AUTH_TOKEN_ID
      || !HEADER_KONG_AUTH_STATUS
      || !HEADER_KONG_AUTH_ROLE
      || !HEADER_KONG_AUTH_CREATED_AT
  ) {
    throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
  }

  const personId = getHeader(HEADER_KONG_AUTH_PERSON_ID, request);
  const accountId = getHeader(HEADER_KONG_AUTH_ACCOUNT_ID, request);
  const tokenId = getHeader(HEADER_KONG_AUTH_TOKEN_ID, request);
  const status = getHeader(HEADER_KONG_AUTH_STATUS, request);
  const role = getHeader(HEADER_KONG_AUTH_ROLE, request);
  const createdAt = getHeader(HEADER_KONG_AUTH_CREATED_AT, request);

  if (!personId || !accountId || !tokenId || !status || !role || !createdAt) {
    forbidden(response);
  } else {
    const tokenCreatedAt = new Date(createdAt as string);
    if (!isValid(tokenCreatedAt)) {
      throw new ValidationError('TOKEN_CREATED_AT_INVALID');
    }

    request.accessData = {
      tokenId: tokenId as string,
      accountId: accountId as string,
      personId: personId as string,
      status: status as string,
      role: role as string,
      createdAt: tokenCreatedAt,
    };

    next();
  }
}
