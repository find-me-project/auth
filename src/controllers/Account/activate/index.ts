import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { AccountService } from 'src/services';
import parameterValidation from './parameter-validation';

async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const {
    accountId,
  } = request.accessData!;

  const {
    code,
  } = request.body;

  const service = new AccountService(session);
  await service.activate(accountId!, code);

  return response.success(undefined, 'ACCOUNT_ACTIVATED');
}

export default {
  validation: parameterValidation,
  method: method,
};
