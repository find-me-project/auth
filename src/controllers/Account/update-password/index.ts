import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { AccountService } from 'src/services';
import parameterValidation from './parameter-validation';

async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const {
    accountId,
  } = request.accessData!;

  const {
    currentPassword,
    newPassword,
  } = request.body;

  const service = new AccountService(session);
  await service.updatePassword(accountId!, currentPassword, newPassword);

  return response.success(undefined, 'SAVED');
}

export default {
  validation: parameterValidation,
  method: method,
};
