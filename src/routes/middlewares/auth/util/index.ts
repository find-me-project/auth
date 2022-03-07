import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import type { Response } from 'express';
import type { Request } from 'express-validator/src/base';
import ValidationError from 'src/util/error/validation-error';

/**
 * Clear cookie
 *
 * @param {string} key Secret cookie key name
 * @param {Response} response Response object
 */
export function cookieClear (key: string, response: Response): void {
  response.cookie(key, undefined);
  response.clearCookie(key);
}

/**
 * Forbidden
 *
 * @param {Response} response Response object
 * @returns Response object with status code 401 and forbidden message
 */
export function forbidden (response: Response): Response {
  const {
    SECRET_HEADER_NAME,
  } = process.env;

  cookieClear(SECRET_HEADER_NAME!, response);

  return response.forbidden(undefined, 'SIGN_IN_REQUIRED');
}

/**
 * Get header by key name
 *
 * @param key - Header name
 * @param request - Request object
 * @returns the string header or undefined if not found
 */
export function getHeader (key: string, request: Request): string | boolean | undefined {
  const header = request.headers && request.headers[key];

  return header;
}

/**
 * Generate a new token id
 *
 * @param {string} accountId - User account id
 * @returns a bcrypt hash string
 */
export function generateTokenId (accountId: string): string {
  const {
    SECRET_TOKEN_HASH,
  } = process.env;

  if (!SECRET_TOKEN_HASH) {
    throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
  }

  const token = hashSync(`${accountId.substring(1, 4)}${SECRET_TOKEN_HASH}`, genSaltSync(10));

  return token;
}

/**
 * Validate token (hash) id
 *
 * @param {string} id - Token Id (Hash)
 * @param {string} accountId - User account id
 * @returns boolean true if is a valid token id
 */
export function tokenIdIsValid (id: string, accountId: string): boolean {
  const {
    SECRET_TOKEN_HASH,
  } = process.env;

  if (!SECRET_TOKEN_HASH) {
    throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
  }

  const isValid = compareSync(`${accountId.substring(1, 4)}${SECRET_TOKEN_HASH}`, id as string);

  return isValid;
}
