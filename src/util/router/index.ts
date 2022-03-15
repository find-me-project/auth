/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  NextFunction, Request, Router,
} from 'express';
import { isEmpty } from 'lodash';
import getMessage, { MessageType } from '../i18n/methods/get-message';

const MESSAGES = {
  INFORMATION: 'information',
  WARNING: 'warning',
  ERROR: 'error',
};

function getJsonResult (resultObject?: any, message?: MessageType | string, messageResultkey?: string): Record<string, any> {
  const result: Record<string, any> = {};

  if (!isEmpty(message) && !isEmpty(messageResultkey)) {
    result.messages = {
      [messageResultkey!]: typeof message === 'string' ? getMessage(message) : getMessage(message!.code, message!.params),
    };
  }

  return {
    ...resultObject,
    ...result,
  };
}

export default function init (router: Router): void {
  router.use((request: Request, response: any, next: NextFunction): void => {
    response.success = function success (resultObject?: any, message?: MessageType | string) {
      const result = getJsonResult(resultObject, message, MESSAGES.INFORMATION);

      return response.status(200).json(result);
    };

    response.successfulCreated = function successfulCreated (resultObject?: any, message?: MessageType | string) {
      const result = getJsonResult(resultObject, message, MESSAGES.INFORMATION);

      return response.status(201).json(result);
    };

    response.warning = function warning (resultObject?: any, message?: MessageType | string) {
      const result = getJsonResult(resultObject, message, MESSAGES.WARNING);

      return response.status(200).json(result);
    };

    response.error = function error (resultObject?: any, message?: MessageType | string) {
      const result = getJsonResult(resultObject, message, MESSAGES.ERROR);

      return response.status(400).json(result);
    };

    response.notFound = function notFound (resultObject?: any, message?: MessageType | string) {
      const result = getJsonResult(resultObject, message, MESSAGES.WARNING);

      return response.status(404).json(result);
    };

    response.forbidden = function forbidden (resultObject?: any, message?: MessageType | string) {
      const result = getJsonResult(resultObject, message, MESSAGES.ERROR);

      return response.status(403).json(result);
    };

    next();
  });
}
