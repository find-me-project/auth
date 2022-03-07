import { AccountType } from 'src/models/Account';

interface IAccountRepository {
  create (account: AccountType): Promise<AccountType>,
  // static existsByEmail (email: string): Promise<boolean>
  // static existsByNickName (nickname: string): Promise<boolean>
  // static existsById (id: string): Promise<boolean>
  getById (id: string): Promise<AccountType | null>,
  getByEmail (email: string): Promise<AccountType | null>,
  getByNickname (nickname: string): Promise<AccountType | null>,
  changeActivationCode (id: string, code: string): Promise<void>,
  activate (id: string): Promise<void>,
  increaseFailActivation (id: string): Promise<void>,
  updatePassword (id: string, password: string): Promise<void>,
  requestRecoverPassword (id: string, code: string): Promise<void>,
  recoverPassword (id: string, password: string): Promise<void>,
  increaseFailedRecoverPassword (id: string): Promise<void>,
  increaseFailedSignIn (id: string): Promise<void>,
  saveLastSignIn (id: string): Promise<void>,
}

export default IAccountRepository;
