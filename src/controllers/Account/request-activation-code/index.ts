import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { AccountService } from 'src/services';

async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const {
    accountId,
  } = request.accessData!;

  const service = new AccountService(session);
  await service.changeActivationCode(accountId!);

  return response.success(undefined, 'CHANGE_ACTIVATION_CODE_REQUESTED');
}

export default {
  method: method,
};
