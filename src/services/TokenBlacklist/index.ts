import { TokenBlacklistType } from 'src/models/TokenBlacklist';
import makeTokenBlacklist from 'src/models/TokenBlacklist/model';
import ITokenBlacklistRepository from 'src/repositories/TokenBlacklist';
import { TokenBlacklistRepository } from 'src/repositories/TokenBlacklist/repository';

export class TokenBlacklistService {
  private repository: ITokenBlacklistRepository;

  constructor () {
    this.repository = new TokenBlacklistRepository();
  }

  async create (data: TokenBlacklistType): Promise<TokenBlacklistType> {
    const token = makeTokenBlacklist(data);
    const result = await this.repository.create(token);

    return result;
  }

  async existsById (id: string): Promise<boolean> {
    const result = await this.repository.existsById(id);

    return result;
  }
}
