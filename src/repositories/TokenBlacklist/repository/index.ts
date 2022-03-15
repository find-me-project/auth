import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { TokenBlacklistType } from 'src/models/TokenBlacklist';
import ValidationError from 'src/util/error/validation-error';
import ITokenBlacklistRepository from '..';

export class TokenBlacklistRepository implements ITokenBlacklistRepository {
  private client: RedisClientType;

  constructor () {
    const {
      REDIS_URL,
    } = process.env;

    if (!REDIS_URL) {
      throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
    }

    this.client = createClient({
      url: REDIS_URL,
    });
  }

  async create (token: TokenBlacklistType): Promise<TokenBlacklistType> {
    await this.client.connect();

    await this.client.set(token._id, token.revocationDate.toString(), {
      PX: token.revocationDate.getTime(),
    });

    await this.client.disconnect();

    return token;
  }

  async existsById (id: string): Promise<boolean> {
    await this.client.connect();
    const result = await this.client.get(id);
    await this.client.disconnect();

    return !!result;
  }
}
