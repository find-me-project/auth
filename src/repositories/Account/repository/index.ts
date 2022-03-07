import { ClientSession } from 'mongoose';
import { AccountType, StatusEnum } from 'src/models/Account';
import { AccountModel } from 'src/models/Account/schema';
import { AccountDetailsModel } from 'src/models/AccountDetails/schema';
import { AccountDetailsType } from 'src/models/AccountDetails';
import IAccountRepository from '..';

export class AccountRepository implements IAccountRepository {
  private session?: ClientSession;

  constructor (session?: ClientSession) {
    this.session = session;
  }

  async create (account: AccountType): Promise<AccountType> {
    const details = new AccountDetailsModel(account.details as AccountDetailsType);
    await details.save({ session: this.session });

    const result = new AccountModel(account);
    await result.save({ session: this.session });
    await result.populate('person');
    const item = result.toJSON();

    return {
      ...item,
      password: undefined,
      details: undefined,
    };
  }

  static async existsByEmail (email: string): Promise<boolean> {
    const result = await AccountModel.exists({
      email: email,
    });

    return result;
  }

  static async existsByNickName (nickname: string): Promise<boolean> {
    const result = await AccountModel.exists({
      nickname: nickname,
    });

    return result;
  }

  static async existsById (id: string): Promise<boolean> {
    const result = await AccountModel.exists({
      _id: id,
    });

    return result;
  }

  async getById (id: string): Promise<AccountType | null> {
    const result = await AccountModel.findOne(
      { _id: id },
      null,
      {
        session: this.session,
      },
    )
      .populate('details')
      .populate('person')
      .exec();

    return result;
  }

  async getByEmail (email: string): Promise<AccountType | null> {
    const result = await AccountModel.findOne(
      { email: email },
      null,
      {
        session: this.session,
      },
    )
      .populate('details')
      .populate('person')
      .exec();

    return result;
  }

  async getByNickname (nickname: string): Promise<AccountType | null> {
    const result = await AccountModel.findOne(
      { nickname: nickname },
      null,
      {
        session: this.session,
      },
    )
      .populate('details')
      .populate('person')
      .exec();

    return result;
  }

  async changeActivationCode (id: string, code: string): Promise<void> {
    const account = await this.getById(id);

    await AccountDetailsModel.updateOne(
      { _id: (account!.details as AccountDetailsType)._id },
      {
        $set: {
          activationCode: code,
          activationCodeDate: new Date(),
        },
        $unset: {
          countFailedActivationAttempts: null,
        },
      },
      {
        session: this.session,
      },
    ).exec();
  }

  async activate (id: string): Promise<void> {
    const account = await this.getById(id);

    await AccountModel.updateOne(
      { _id: account!._id },
      {
        $set: {
          status: StatusEnum.VERIFIED,
        },
      },
      {
        session: this.session,
      },
    ).exec();

    await AccountDetailsModel.updateOne(
      { _id: (account!.details as AccountDetailsType)._id },
      {
        $set: {
          activationDate: new Date(),
        },
        $unset: {
          activationCode: null,
          activationCodeDate: null,
          countFailedActivationAttempts: null,
        },
      },
      {
        session: this.session,
      },
    ).exec();
  }

  async increaseFailActivation (id: string): Promise<void> {
    const account = await this.getById(id);

    await AccountDetailsModel.updateOne(
      { _id: (account!.details as AccountDetailsType)._id },
      {
        $inc: {
          countFailedActivationAttempts: 1,
        },
      },
    ).exec();
  }

  async updatePassword (id: string, password: string): Promise<void> {
    await AccountModel.updateOne(
      { _id: id },
      {
        $set: {
          password: password,
        },
      },
      {
        session: this.session,
      },
    ).exec();
  }

  async requestRecoverPassword (id: string, code: string): Promise<void> {
    const account = await this.getById(id);

    await AccountDetailsModel.updateOne(
      { _id: (account!.details as AccountDetailsType)._id },
      {
        $set: {
          recoverCode: code,
          recoverCodeDate: new Date(),
        },
        $unset: {
          countFailedRecoveryAttempts: 0,
        },
      },
      {
        session: this.session,
      },
    ).exec();
  }

  async increaseFailedRecoverPassword (id: string): Promise<void> {
    const account = await this.getById(id);

    await AccountDetailsModel.updateOne(
      { _id: (account!.details as AccountDetailsType)._id },
      {
        $inc: {
          countFailedRecoveryAttempts: 1,
        },
      },
    ).exec();
  }

  async recoverPassword (id: string, password: string): Promise<void> {
    const account = await AccountModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          password: password,
        },
      },
      {
        new: true,
        session: this.session,
      },
    ).exec();

    await AccountDetailsModel.updateOne(
      { _id: account!.details as string },
      {
        $unset: {
          countFailedRecoveryAttempts: 0,
          recoverCode: null,
          recoverCodeDate: null,
        },
      },
      {
        session: this.session,
      },
    ).exec();
  }

  async increaseFailedSignIn (id: string): Promise<void> {
    const account = await this.getById(id);

    await AccountDetailsModel.updateOne(
      { _id: (account!.details as AccountDetailsType)._id },
      {
        $inc: {
          countFailedSignInAttempts: 1,
        },
        $set: {
          lastFailedSignInAttemptDate: new Date(),
        },
      },
      {
        session: this.session,
      },
    ).exec();
  }

  async saveLastSignIn (id: string): Promise<void> {
    const account = await this.getById(id);

    await AccountDetailsModel.updateOne(
      { _id: (account!.details as AccountDetailsType)._id },
      {
        $set: {
          lastSignIn: new Date(),
        },
        $unset: {
          countFailedSignInAttempts: 0,
          lastFailedSignInAttemptDate: null,
        },
      },
      {
        session: this.session,
      },
    ).exec();
  }
}
