import type {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import { validationResult } from 'express-validator';
import type { ClientSession } from 'mongoose';
import { db } from 'src/database';
import ValidationError from 'src/util/error/validation-error';
import type { ParamsType } from 'src/util/i18n/methods/get-message';

const DEFAULT_INTERNAL_ERROR = {
  messages: {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred',
    },
  },
};

export type CallBackType = (request: Request, response: Response, session?: ClientSession) => Promise<Response>;
export type CallBackOptionsType = {
  session: boolean,
};
type validationResultErrorType = {
  msg: {
    code: string,
    message: string,
    params: ParamsType
  }
};

export default (callback: CallBackType, options: CallBackOptionsType = { session: true }): RequestHandler => async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  let session;

  let logError;
  try {
    // Request parameter validation
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      logError = {
        messages: {
          errors: errors.array({ onlyFirstError: true }).map((error: validationResultErrorType) => ({
            code: error.msg.code,
            message: error.msg.message,
            params: error.msg.params,
          })),
        },
      };

      return response.status(400).json(logError);
    }

    if (options.session) {
      session = await db.startSession();
      session.startTransaction();
    }

    const result = await callback(request, response, session);

    if (session) {
      await session.commitTransaction();
    }

    return result;
  } catch (e) {
    if (session) {
      await session.abortTransaction();
    }

    if (e instanceof ValidationError) {
      logError = {
        messages: {
          error: {
            code: e.getCode(),
            message: e.getMessage(),
            params: e.getParams(),
          },
        },
      };

      return response.status(400).json(logError);
    }

    logError = DEFAULT_INTERNAL_ERROR;

    next(e);

    return response.status(500).json(logError);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
