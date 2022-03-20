import { compareSync } from 'bcrypt';
import { differenceInMinutes } from 'date-fns';
import { sign } from 'jsonwebtoken';
import { ClientSession } from 'mongoose';
import { AccountType, RoleEnum, StatusEnum } from 'src/models/Account';
import makeAccount, { getEncryptedPassword, validatePassword } from 'src/models/Account/model';
import { AccountDetailsType } from 'src/models/AccountDetails';
import { PersonType } from 'src/models/Person';
import { AccountRepository } from 'src/repositories';
import IAccountRepository from 'src/repositories/Account';
import { generateTokenId } from 'src/routes/middlewares/auth/util';
import randomCode from 'src/util/code/random-code';
import ValidationError from 'src/util/error/validation-error';
import { SNSService } from 'src/util/aws';

export class AccountService {
  private repository: IAccountRepository;

  private notification?: SNSService;

  constructor (session?: ClientSession, notificationService?: boolean) {
    this.repository = new AccountRepository(session);

    if (notificationService) {
      this.notification = new SNSService();
    }
  }

  private static async validateNewAccount (data: AccountType): Promise<boolean> {
    const emailAlreadyExists = await AccountRepository.existsByEmail(data.email);

    if (emailAlreadyExists) {
      throw new ValidationError('EMAIL_ALREADY_EXISTS');
    }

    const nicknameAlreadyExists = await AccountRepository.existsByNickName(data.nickname);
    if (nicknameAlreadyExists) {
      throw new ValidationError('NICKNAME_ALREADY_EXISTS');
    }

    return true;
  }

  async create (data: AccountType): Promise<AccountType> {
    const account = makeAccount(data);
    await AccountService.validateNewAccount(account);

    const result = await this.repository.create(account);

    if (this.notification) {
      const { nickname, email } = result;
      const { activationCode } = account.details as AccountDetailsType;

      await this.notification.sendVerificationEmail(nickname, email, activationCode!);
    }

    return result;
  }

  private async canChangeActivationCode (id: string): Promise<boolean> {
    const account = await this.repository.getById(id);
    if (!account) {
      throw new ValidationError('ACCOUNT_NOT_FOUND');
    }

    if (account.status !== StatusEnum.UNVERIFIED) {
      throw new ValidationError('CANT_CHANGE_ACTIVATION_CODE', { value: account.status! });
    }

    const activationRequestDelay = differenceInMinutes(new Date(), (account.details as AccountDetailsType).activationCodeDate!);
    if (activationRequestDelay <= 4) {
      throw new ValidationError('ACTIVATION_CODE_MANY_REQUESTS', { value: (4 - activationRequestDelay) || 1 });
    }

    return true;
  }

  async changeActivationCode (id: string): Promise<void> {
    await this.canChangeActivationCode(id);

    await this.repository.changeActivationCode(id, randomCode(8));

    if (this.notification) {
      const account = await this.repository.getById(id);
      const { nickname, email } = account!;
      const { activationCode } = account!.details as AccountDetailsType;

      await this.notification.sendVerificationEmail(nickname, email, activationCode!);
    }
  }

  private async canActivate (id: string, code: string): Promise<boolean> {
    const account = await this.repository.getById(id);
    if (!account) {
      throw new ValidationError('ACCOUNT_NOT_FOUND');
    }

    if (account.status !== StatusEnum.UNVERIFIED) {
      throw new ValidationError('CANT_ACTIVATE_ACCOUNT', { value: account.status! });
    }

    const details = account.details as AccountDetailsType;
    if (details.countFailedActivationAttempts && details.countFailedActivationAttempts >= 3) {
      throw new ValidationError('ACTIVATION_CODE_MANY_INVALID_ATTEMPTS');
    }

    if (differenceInMinutes(new Date(), details.activationCodeDate!) >= 30) {
      throw new ValidationError('ACTIVATION_CODE_EXPIRED');
    }

    if (details.activationCode !== code) {
      await this.repository.increaseFailActivation(id);

      throw new ValidationError('ACTIVATION_CODE_INVALID');
    }

    return true;
  }

  async activate (id: string, code: string): Promise<void> {
    await this.canActivate(id, code);

    await this.repository.activate(id);
  }

  private async canUpdatePassword (id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const account = await this.repository.getById(id);
    if (!account) {
      throw new ValidationError('ACCOUNT_NOT_FOUND');
    }

    if (account.status === StatusEnum.DISABLED) {
      throw new ValidationError('ACCOUNT_DISABLED');
    }

    // Check if the password is the same as current the account password
    if (!compareSync(currentPassword, account.password!)) {
      throw new ValidationError('PASSWORD_DOESNT_MATCH');
    }

    // Compare the new password with the old password
    if (compareSync(newPassword, account.password!)) {
      throw new ValidationError('CURRENT_PASSWORD_SAME_NEW_PASSWORD');
    }

    validatePassword(newPassword);

    return true;
  }

  async updatePassword (id: string, currentPassword: string, newPassword: string): Promise<void> {
    await this.canUpdatePassword(id, currentPassword, newPassword);

    const encryptedPassword = getEncryptedPassword(newPassword);
    await this.repository.updatePassword(id, encryptedPassword);
  }

  private static canRequestRecoverPassword (account: AccountType): boolean {
    const {
      status,
    } = account;

    if (status === StatusEnum.DISABLED) {
      throw new ValidationError('ACCOUNT_DISABLED');
    }

    const details = account.details as AccountDetailsType;
    if (details && details.recoverCodeDate) {
      const recoverCodeRequestDelay = differenceInMinutes(new Date(), details.recoverCodeDate);
      if (recoverCodeRequestDelay <= 2) {
        throw new ValidationError('ACCOUNT_RECOVER_MANY_REQUESTS', { value: (2 - recoverCodeRequestDelay) || 1 });
      }
    }

    return true;
  }

  async requestRecoverPassword (email: string): Promise<void> {
    const account = await this.repository.getByEmail(email);
    if (!account) {
      throw new ValidationError('ACCOUNT_NOT_FOUND');
    }

    AccountService.canRequestRecoverPassword(account);

    const code = randomCode(8);
    await this.repository.requestRecoverPassword(account._id!, code);

    if (this.notification) {
      const { email } = account;

      await this.notification.sendRecoverPasswordEmail(email, code);
    }
  }

  private async canRecoverPassword (account: AccountType, code: string, password: string): Promise<boolean> {
    const {
      status,
    } = account;

    if (status === StatusEnum.DISABLED) {
      throw new ValidationError('ACCOUNT_DISABLED');
    }

    const details = account.details as AccountDetailsType;
    // Check if the user requested a recover code
    if (!details.recoverCode || !details.recoverCodeDate) {
      throw new ValidationError('ACCOUNT_NOT_REQUESTED_RECOVER');
    }

    // Check the max failed attempts to recover password
    if (details.countFailedRecoveryAttempts && details.countFailedRecoveryAttempts > 2) {
      throw new ValidationError('ACCOUNT_MANY_FAILED_RECOVERY_ATTEMPTS');
    }

    // Check if the recover code is expired
    if (differenceInMinutes(new Date(), details.recoverCodeDate) >= 30) {
      throw new ValidationError('ACCOUNT_RECOVER_CODE_EXPIRED');
    }

    // Check recover code
    if (details.recoverCode !== code) {
      await this.repository.increaseFailedRecoverPassword(account._id!);

      throw new ValidationError('ACCOUNT_RECOVER_CODE_INVALID');
    }

    // Compare the new password with the old password
    if (compareSync(password, account.password!)) {
      throw new ValidationError('CURRENT_PASSWORD_SAME_NEW_PASSWORD');
    }

    validatePassword(password);

    return true;
  }

  async recoverPassword (email: string, code: string, password: string): Promise<void> {
    const account = await this.repository.getByEmail(email);
    if (!account) {
      throw new ValidationError('ACCOUNT_NOT_FOUND');
    }

    await this.canRecoverPassword(account, code, password);

    const encryptedPassword = getEncryptedPassword(password);
    await this.repository.recoverPassword(account._id!, encryptedPassword);
  }

  private async canSignIn (account: AccountType, password: string): Promise<boolean> {
    const {
      status,
    } = account;

    if (status === StatusEnum.DISABLED) {
      throw new ValidationError('ACCOUNT_DISABLED');
    }

    const details = account.details as AccountDetailsType;
    // Check if many sign in attempts are made
    if (details && details.lastFailedSignInAttemptDate && details.countFailedSignInAttempts && details.countFailedSignInAttempts > 3) {
      const lastFailedSignInTimeDiff = differenceInMinutes(new Date(), details.lastFailedSignInAttemptDate);
      const signInDelay = details.countFailedSignInAttempts * 0.5;
      if (lastFailedSignInTimeDiff <= signInDelay) {
        const delay = signInDelay - lastFailedSignInTimeDiff || 1;
        throw new ValidationError('SIGN_IN_MANY_FAILED_ATTEMPTS', { value: delay });
      }
    }

    if (!compareSync(password, account.password!)) {
      await this.repository.increaseFailedSignIn(account._id!);

      throw new ValidationError('PASSWORD_INVALID');
    }

    return true;
  }

  private static getToken (accountId: string, personId: string, status: StatusEnum, role: RoleEnum): string {
    const {
      SECRET_TOKEN_HASH,
      SECRET_TOKEN_TIMEOUT,
    } = process.env;

    if (!SECRET_TOKEN_HASH || !SECRET_TOKEN_TIMEOUT) {
      throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
    }

    const tokenId = generateTokenId(accountId);

    const token = sign(
      {
        accountId: accountId,
        personId: personId,
        tokenId: tokenId,
        status: status,
        role: role,
        createdAt: new Date(),
      },
      SECRET_TOKEN_HASH,
      {
        algorithm: 'HS256',
        expiresIn: SECRET_TOKEN_TIMEOUT,
      },
    );

    return token;
  }

  async signIn (data: string, password: string, isNickname: boolean): Promise<{
    token: string,
    account: AccountType,
  }> {
    let account;
    if (isNickname) {
      account = await this.repository.getByNickname(data);
    } else {
      account = await this.repository.getByEmail(data);
    }

    if (!account) {
      throw new ValidationError('ACCOUNT_NOT_FOUND');
    }

    await this.canSignIn(account, password);

    const person = account.person as PersonType;
    const token = AccountService.getToken(account._id!, person._id!, account.status!, account.role!);

    await this.repository.saveLastSignIn(account._id!);

    return {
      token: token,
      account: {
        ...account,
        password: undefined,
        details: undefined,
      },
    };
  }
}
