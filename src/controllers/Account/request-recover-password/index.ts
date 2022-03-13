import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { AccountService } from 'src/services';
import parameterValidation from './parameter-validation';

async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const {
    email,
  } = request.body;

  const service = new AccountService(session, true);
  await service.requestRecoverPassword(email);

  return response.success(undefined, 'CHANGE_PASSWORD_REQUESTED');
}

export default {
  validation: parameterValidation,
  method: method,
};
