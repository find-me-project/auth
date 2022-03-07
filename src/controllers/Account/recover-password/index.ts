import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { AccountService } from 'src/services';
import parameterValidation from './parameter-validation';

async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const {
    email,
    code,
    password,
  } = request.body;

  const service = new AccountService(session);
  await service.recoverPassword(email, code, password);

  return response.success(undefined, 'SAVED');
}

export default {
  validation: parameterValidation,
  method: method,
};
