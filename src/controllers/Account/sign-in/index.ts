import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { AccountService } from 'src/services';
import parameterValidation from './parameter-validation';

async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const {
    accessData,
    password,
    isNickname,
  } = request.body;

  const service = new AccountService(session);
  const { token, account } = await service.signIn(accessData, password, isNickname);

  return response.success({
    token: token,
    account: account,
  }, 'SIGN_IN_SUCCESS');
}

export default {
  validation: parameterValidation,
  method: method,
};
