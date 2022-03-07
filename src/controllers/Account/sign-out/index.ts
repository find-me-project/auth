import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { TokenBlacklistService } from 'src/services';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const tokenId = request.accessData?.tokenId;
  const createdAt = request.accessData?.createdAt;

  const service = new TokenBlacklistService();
  if (tokenId && createdAt) {
    await service.create({ _id: tokenId, revocationDate: createdAt! });
  }

  return response.success(undefined, 'USER_DISCONNECTED');
}

export default {
  method: method,
};
