import { faker } from '@faker-js/faker';
import {
  describe, it, expect, jest,
} from '@jest/globals';
import { subMinutes } from 'date-fns';
import { AccountService } from '../..';
import { StatusEnum } from '../../../models/Account';
import { getEncryptedPassword } from '../../../models/Account/model';
import { AccountRepository } from '../../../repositories';
import ValidationError from '../../../util/error/validation-error';
import { SNSService } from '../../../util/aws';

describe('account service', () => {
  describe('create', () => {
    it('should create a new account', async () => {
      expect.assertions(5);

      const service = new AccountService();
      const account = {
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      };

      const accountCreateSpy = jest.spyOn(AccountRepository.prototype, 'create').mockResolvedValueOnce(account);
      const accountExistsByEmailSpy = jest.spyOn(AccountRepository, 'existsByEmail').mockResolvedValueOnce(false);
      const accountExistsByNickNameSpy = jest.spyOn(AccountRepository, 'existsByNickName').mockResolvedValueOnce(false);
      const sendVerificationEmailSpy = jest.spyOn(SNSService.prototype, 'sendVerificationEmail');

      const result = await service.create(account);

      expect(result).toBe(account);
      expect(accountCreateSpy).toHaveBeenCalledTimes(1);
      expect(accountExistsByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountExistsByNickNameSpy).toHaveBeenCalledTimes(1);
      expect(sendVerificationEmailSpy).toHaveBeenCalledTimes(0);

      accountCreateSpy.mockReset();
      accountExistsByEmailSpy.mockReset();
      accountExistsByNickNameSpy.mockReset();
      sendVerificationEmailSpy.mockReset();
    });

    it('should create a new account and send verification email', async () => {
      expect.assertions(5);

      const service = new AccountService(undefined, true);
      const account = {
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      };

      const accountCreateSpy = jest.spyOn(AccountRepository.prototype, 'create').mockResolvedValueOnce({
        ...account,
        details: {
          activationCode: '01234567',
        },
      });
      const accountExistsByEmailSpy = jest.spyOn(AccountRepository, 'existsByEmail').mockResolvedValueOnce(false);
      const accountExistsByNickNameSpy = jest.spyOn(AccountRepository, 'existsByNickName').mockResolvedValueOnce(false);
      const sendVerificationEmailSpy = jest.spyOn(SNSService.prototype, 'sendVerificationEmail').mockResolvedValueOnce();

      const result = await service.create(account);

      expect(result).toStrictEqual({
        ...account,
        details: {
          activationCode: '01234567',
        },
      });
      expect(accountCreateSpy).toHaveBeenCalledTimes(1);
      expect(accountExistsByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountExistsByNickNameSpy).toHaveBeenCalledTimes(1);
      expect(sendVerificationEmailSpy).toHaveBeenCalledTimes(1);

      accountCreateSpy.mockReset();
      accountExistsByEmailSpy.mockReset();
      accountExistsByNickNameSpy.mockReset();
      sendVerificationEmailSpy.mockReset();
    });

    it('should throw an exception if email already exists', async () => {
      expect.assertions(4);

      const service = new AccountService();
      const account = {
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      };

      const accountCreateSpy = jest.spyOn(AccountRepository.prototype, 'create').mockResolvedValueOnce(account);
      const accountExistsByEmailSpy = jest.spyOn(AccountRepository, 'existsByEmail').mockResolvedValueOnce(true);
      const sendVerificationEmailSpy = jest.spyOn(SNSService.prototype, 'sendVerificationEmail');

      const result = service.create(account);

      await expect(result).rejects.toThrow(new ValidationError('EMAIL_ALREADY_EXISTS'));
      expect(accountCreateSpy).toHaveBeenCalledTimes(0);
      expect(accountExistsByEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendVerificationEmailSpy).toHaveBeenCalledTimes(0);

      accountCreateSpy.mockReset();
      accountExistsByEmailSpy.mockReset();
      sendVerificationEmailSpy.mockReset();
    });

    it('should throw an exception if nickname already exists', async () => {
      expect.assertions(5);

      const service = new AccountService();
      const account = {
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      };

      const accountCreateSpy = jest.spyOn(AccountRepository.prototype, 'create').mockResolvedValueOnce(account);
      const accountExistsByEmailSpy = jest.spyOn(AccountRepository, 'existsByEmail').mockResolvedValueOnce(false);
      const accountExistsByNickNameSpy = jest.spyOn(AccountRepository, 'existsByNickName').mockResolvedValueOnce(true);
      const sendVerificationEmailSpy = jest.spyOn(SNSService.prototype, 'sendVerificationEmail');

      const result = service.create(account);

      await expect(result).rejects.toThrow(new ValidationError('NICKNAME_ALREADY_EXISTS'));
      expect(accountCreateSpy).toHaveBeenCalledTimes(0);
      expect(accountExistsByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountExistsByNickNameSpy).toHaveBeenCalledTimes(1);
      expect(sendVerificationEmailSpy).toHaveBeenCalledTimes(0);

      accountCreateSpy.mockReset();
      accountExistsByEmailSpy.mockReset();
      sendVerificationEmailSpy.mockReset();
    });
  });

  describe('change activation code', () => {
    it('should update activation code', async () => {
      expect.assertions(2);

      const service = new AccountService();

      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce({
        status: StatusEnum.UNVERIFIED,
        details: {
          activationCodeDate: subMinutes(new Date(), 5),
        },
      } as any);
      const accountChangeActivationCodeSpy = jest.spyOn(AccountRepository.prototype, 'changeActivationCode').mockResolvedValueOnce();

      await service.changeActivationCode(faker.datatype.uuid());

      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountChangeActivationCodeSpy).toHaveBeenCalledTimes(1);

      accountGetByIdSpy.mockReset();
      accountChangeActivationCodeSpy.mockReset();
    });

    it('should update activation code and send verification email', async () => {
      expect.assertions(3);

      const service = new AccountService(undefined, true);

      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValue({
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        status: StatusEnum.UNVERIFIED,
        details: {
          activationCode: '01234567',
          activationCodeDate: subMinutes(new Date(), 5),
        },
      } as any);
      const accountChangeActivationCodeSpy = jest.spyOn(AccountRepository.prototype, 'changeActivationCode').mockResolvedValueOnce();
      const sendVerificationEmailSpy = jest.spyOn(SNSService.prototype, 'sendVerificationEmail').mockResolvedValueOnce();

      await service.changeActivationCode(faker.datatype.uuid());

      expect(accountGetByIdSpy).toHaveBeenCalledTimes(2);
      expect(accountChangeActivationCodeSpy).toHaveBeenCalledTimes(1);
      expect(sendVerificationEmailSpy).toHaveBeenCalledTimes(1);

      accountGetByIdSpy.mockReset();
      accountChangeActivationCodeSpy.mockReset();
      sendVerificationEmailSpy.mockReset();
    });

    it('should throw an exception if account not found', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(null as any);
      const accountChangeActivationCodeSpy = jest.spyOn(AccountRepository.prototype, 'changeActivationCode').mockResolvedValueOnce();

      const result = service.changeActivationCode(faker.datatype.uuid());

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_NOT_FOUND'));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountChangeActivationCodeSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountChangeActivationCodeSpy.mockReset();
    });

    it('should throw an exception if account status is != UNVERIFIED', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce({
        status: StatusEnum.VERIFIED,
        details: {
          activationCodeDate: subMinutes(new Date(), 5),
        },
      } as any);
      const accountChangeActivationCodeSpy = jest.spyOn(AccountRepository.prototype, 'changeActivationCode').mockResolvedValueOnce();

      const result = service.changeActivationCode(faker.datatype.uuid());

      await expect(result).rejects.toThrow(new ValidationError('CANT_CHANGE_ACTIVATION_CODE', { value: StatusEnum.VERIFIED }));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountChangeActivationCodeSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountChangeActivationCodeSpy.mockReset();
    });

    it('should throw an exception if account had many requests to change activation code', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce({
        status: StatusEnum.UNVERIFIED,
        details: {
          activationCodeDate: subMinutes(new Date(), 1),
        },
      } as any);
      const accountChangeActivationCodeSpy = jest.spyOn(AccountRepository.prototype, 'changeActivationCode').mockResolvedValueOnce();

      const result = service.changeActivationCode(faker.datatype.uuid());

      await expect(result).rejects.toThrow(new ValidationError('ACTIVATION_CODE_MANY_REQUESTS', { value: 3 }));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountChangeActivationCodeSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountChangeActivationCodeSpy.mockReset();
    });

    it('should throw an exception if account had many requests to change activation code (delay)', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce({
        status: StatusEnum.UNVERIFIED,
        details: {
          activationCodeDate: subMinutes(new Date(), 4),
        },
      } as any);
      const accountChangeActivationCodeSpy = jest.spyOn(AccountRepository.prototype, 'changeActivationCode').mockResolvedValueOnce();

      const result = service.changeActivationCode(faker.datatype.uuid());

      await expect(result).rejects.toThrow(new ValidationError('ACTIVATION_CODE_MANY_REQUESTS', { value: 1 }));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountChangeActivationCodeSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountChangeActivationCodeSpy.mockReset();
    });
  });

  describe('activate account', () => {
    it('should activate the account', async () => {
      expect.assertions(2);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.UNVERIFIED,
        details: {
          activationCode: '01234567',
          activationCodeDate: subMinutes(new Date(), 5),
        },
      };
      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(account as any);
      const accountActivateSpy = jest.spyOn(AccountRepository.prototype, 'activate').mockResolvedValueOnce();

      await service.activate(account._id, account.details.activationCode);

      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountActivateSpy).toHaveBeenCalledTimes(1);

      accountGetByIdSpy.mockReset();
      accountActivateSpy.mockReset();
    });

    it('should throw an exception if account not found', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(null);
      const accountActivateSpy = jest.spyOn(AccountRepository.prototype, 'activate').mockResolvedValueOnce();

      const result = service.activate(faker.datatype.uuid(), '01234567');

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_NOT_FOUND'));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountActivateSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountActivateSpy.mockReset();
    });

    it('should throw an exception if account status != UNVERIFIED', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.DISABLED,
        details: {
          activationCode: '01234567',
          activationCodeDate: subMinutes(new Date(), 5),
        },
      };
      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(account as any);
      const accountActivateSpy = jest.spyOn(AccountRepository.prototype, 'activate').mockResolvedValueOnce();

      const result = service.activate(account._id, account.details.activationCode);

      await expect(result).rejects.toThrow(new ValidationError('CANT_ACTIVATE_ACCOUNT', { value: account.status }));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountActivateSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountActivateSpy.mockReset();
    });

    it('should throw an exception if account has many invalid attempts to activate', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.UNVERIFIED,
        details: {
          activationCode: '01234567',
          activationCodeDate: subMinutes(new Date(), 5),
          countFailedActivationAttempts: 3,
        },
      };
      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(account as any);
      const accountActivateSpy = jest.spyOn(AccountRepository.prototype, 'activate').mockResolvedValueOnce();

      const result = service.activate(account._id, account.details.activationCode);

      await expect(result).rejects.toThrow(new ValidationError('ACTIVATION_CODE_MANY_INVALID_ATTEMPTS'));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountActivateSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountActivateSpy.mockReset();
    });

    it('should throw an exception if account activation code is expired', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.UNVERIFIED,
        details: {
          activationCode: '01234567',
          activationCodeDate: subMinutes(new Date(), 30),
        },
      };
      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(account as any);
      const accountActivateSpy = jest.spyOn(AccountRepository.prototype, 'activate').mockResolvedValueOnce();

      const result = service.activate(account._id, account.details.activationCode);

      await expect(result).rejects.toThrow(new ValidationError('ACTIVATION_CODE_EXPIRED'));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountActivateSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountActivateSpy.mockReset();
    });

    it('should throw an exception if account activation code is invalid', async () => {
      expect.assertions(4);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.UNVERIFIED,
        details: {
          activationCode: '01234567',
          activationCodeDate: subMinutes(new Date(), 5),
        },
      };
      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(account as any);
      const accountActivateSpy = jest.spyOn(AccountRepository.prototype, 'activate').mockResolvedValueOnce();
      const accountIncreaseFailActivationSpy = jest.spyOn(AccountRepository.prototype, 'increaseFailActivation').mockResolvedValueOnce();

      const result = service.activate(account._id, 'invalid_code');

      await expect(result).rejects.toThrow(new ValidationError('ACTIVATION_CODE_INVALID'));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountActivateSpy).toHaveBeenCalledTimes(0);
      expect(accountIncreaseFailActivationSpy).toHaveBeenCalledTimes(1);

      accountGetByIdSpy.mockReset();
      accountActivateSpy.mockReset();
      accountIncreaseFailActivationSpy.mockReset();
    });
  });

  describe('update password', () => {
    it('should update account password', async () => {
      expect.assertions(2);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.UNVERIFIED,
        password: getEncryptedPassword(currentPassword),
      };
      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(account as any);
      const accountUpdatePasswordSpy = jest.spyOn(AccountRepository.prototype, 'updatePassword').mockResolvedValueOnce();

      await service.updatePassword(account._id, currentPassword, faker.internet.password(20, false, /\w/, '@2'));

      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountUpdatePasswordSpy).toHaveBeenCalledTimes(1);

      accountGetByIdSpy.mockReset();
      accountUpdatePasswordSpy.mockReset();
    });

    it('should throw an exception if account not found', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(null as any);
      const accountUpdatePasswordSpy = jest.spyOn(AccountRepository.prototype, 'updatePassword').mockResolvedValueOnce();

      const result = service.updatePassword(faker.datatype.uuid(), currentPassword, faker.internet.password(20, false, /\w/, '@2'));

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_NOT_FOUND'));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountUpdatePasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountUpdatePasswordSpy.mockReset();
    });

    it('should throw an exception if account is disabled', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.DISABLED,
        password: getEncryptedPassword(currentPassword),
      };
      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(account as any);
      const accountUpdatePasswordSpy = jest.spyOn(AccountRepository.prototype, 'updatePassword').mockResolvedValueOnce();

      const result = service.updatePassword(account._id, currentPassword, faker.internet.password(20, false, /\w/, '@2'));

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_DISABLED'));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountUpdatePasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountUpdatePasswordSpy.mockReset();
    });

    it('should throw an exception if account current password doesn\'t match', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        password: getEncryptedPassword(currentPassword),
      };
      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(account as any);
      const accountUpdatePasswordSpy = jest.spyOn(AccountRepository.prototype, 'updatePassword').mockResolvedValueOnce();

      const result = service.updatePassword(
        account._id,
        faker.internet.password(20, false, /\w/, '@2'),
        faker.internet.password(20, false, /\w/, '@2'),
      );

      await expect(result).rejects.toThrow(new ValidationError('PASSWORD_DOESNT_MATCH'));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountUpdatePasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountUpdatePasswordSpy.mockReset();
    });

    it('should throw an exception if account current password is the same as new password', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        password: getEncryptedPassword(currentPassword),
      };
      const accountGetByIdSpy = jest.spyOn(AccountRepository.prototype, 'getById').mockResolvedValueOnce(account as any);
      const accountUpdatePasswordSpy = jest.spyOn(AccountRepository.prototype, 'updatePassword').mockResolvedValueOnce();

      const result = service.updatePassword(
        account._id,
        currentPassword,
        currentPassword,
      );

      await expect(result).rejects.toThrow(new ValidationError('CURRENT_PASSWORD_SAME_NEW_PASSWORD'));
      expect(accountGetByIdSpy).toHaveBeenCalledTimes(1);
      expect(accountUpdatePasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByIdSpy.mockReset();
      accountUpdatePasswordSpy.mockReset();
    });
  });

  describe('request recover password', () => {
    it('should request recover password', async () => {
      expect.assertions(2);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        details: {
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRequestRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'requestRecoverPassword').mockResolvedValueOnce();

      await service.requestRecoverPassword(faker.internet.email());

      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRequestRecoverPasswordSpy).toHaveBeenCalledTimes(1);

      accountGetByEmailSpy.mockReset();
      accountRequestRecoverPasswordSpy.mockReset();
    });

    it('should request recover password and send recover password email', async () => {
      expect.assertions(3);

      const service = new AccountService(undefined, true);

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        details: {
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRequestRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'requestRecoverPassword').mockResolvedValueOnce();
      const sendRecoverPasswordEmailSpy = jest.spyOn(SNSService.prototype, 'sendRecoverPasswordEmail').mockResolvedValueOnce();

      await service.requestRecoverPassword(faker.internet.email());

      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRequestRecoverPasswordSpy).toHaveBeenCalledTimes(1);
      expect(sendRecoverPasswordEmailSpy).toHaveBeenCalledTimes(1);

      accountGetByEmailSpy.mockReset();
      accountRequestRecoverPasswordSpy.mockReset();
      sendRecoverPasswordEmailSpy.mockReset();
    });

    it('should throw an exception if account not found', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(null as any);
      const accountRequestRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'requestRecoverPassword').mockResolvedValueOnce();

      const result = service.requestRecoverPassword(faker.internet.email());

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_NOT_FOUND'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRequestRecoverPasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountRequestRecoverPasswordSpy.mockReset();
    });

    it('should throw an exception if account is disabled', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.DISABLED,
        details: {
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRequestRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'requestRecoverPassword').mockResolvedValueOnce();

      const result = service.requestRecoverPassword(faker.internet.email());

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_DISABLED'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRequestRecoverPasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountRequestRecoverPasswordSpy.mockReset();
    });

    it('should throw an exception if account has many request recover password attempts', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        details: {
          recoverCodeDate: new Date(),
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRequestRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'requestRecoverPassword').mockResolvedValueOnce();

      const result = service.requestRecoverPassword(faker.internet.email());

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_RECOVER_MANY_REQUESTS', { value: 2 }));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRequestRecoverPasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountRequestRecoverPasswordSpy.mockReset();
    });

    it('should throw an exception if account has many request recover password attempts (delay)', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        details: {
          recoverCodeDate: subMinutes(new Date(), 2),
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRequestRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'requestRecoverPassword').mockResolvedValueOnce();

      const result = service.requestRecoverPassword(faker.internet.email());

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_RECOVER_MANY_REQUESTS', { value: 1 }));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRequestRecoverPasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountRequestRecoverPasswordSpy.mockReset();
    });
  });
});
