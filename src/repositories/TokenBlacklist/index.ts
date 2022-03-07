import { TokenBlacklistType } from 'src/models/TokenBlacklist';

interface ITokenBlacklistRepository {
  create (token: TokenBlacklistType): Promise<TokenBlacklistType>,
  existsById (id: string): Promise<boolean>,
}

export default ITokenBlacklistRepository;
