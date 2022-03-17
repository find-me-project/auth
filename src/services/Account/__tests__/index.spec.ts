import { faker } from '@faker-js/faker';
import {
  describe, it, expect, jest,
} from '@jest/globals';
import { subMinutes } from 'date-fns';
import { AccountService } from '../..';
import { RoleEnum, StatusEnum } from '../../../models/Account';
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

  describe('recover password', () => {
    it('should recover account password', async () => {
      expect.assertions(2);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        email: faker.internet.email(),
        password: getEncryptedPassword(currentPassword),
        details: {
          recoverCode: '01234567',
          recoverCodeDate: subMinutes(new Date(), 10),
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'recoverPassword').mockResolvedValueOnce();

      await service.recoverPassword(account.email, account.details.recoverCode, faker.internet.password(20, false, /\w/, '@2'));

      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRecoverPasswordSpy).toHaveBeenCalledTimes(1);

      accountGetByEmailSpy.mockReset();
      accountRecoverPasswordSpy.mockReset();
    });

    it('should throw an exception if account is not found', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(null as any);
      const accountRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'recoverPassword').mockResolvedValueOnce();

      const result = service.recoverPassword(
        faker.internet.email(),
        '01234567',
        faker.internet.password(20, false, /\w/, '@2'),
      );

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_NOT_FOUND'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRecoverPasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountRecoverPasswordSpy.mockReset();
    });

    it('should throw an exception if account is disabled', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.DISABLED,
        email: faker.internet.email(),
        details: {
          recoverCode: '01234567',
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'recoverPassword').mockResolvedValueOnce();

      const result = service.recoverPassword(
        account.email,
        account.details.recoverCode,
        faker.internet.password(20, false, /\w/, '@2'),
      );

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_DISABLED'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRecoverPasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountRecoverPasswordSpy.mockReset();
    });

    it('should throw an exception if account not requested recover password', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        email: faker.internet.email(),
        details: {
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'recoverPassword').mockResolvedValueOnce();

      const result = service.recoverPassword(
        account.email,
        '01234567',
        faker.internet.password(20, false, /\w/, '@2'),
      );

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_NOT_REQUESTED_RECOVER'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRecoverPasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountRecoverPasswordSpy.mockReset();
    });

    it('should throw an exception if account has many failed recovery attempts', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        email: faker.internet.email(),
        details: {
          recoverCode: '01234567',
          recoverCodeDate: subMinutes(new Date(), 10),
          countFailedRecoveryAttempts: 3,
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'recoverPassword').mockResolvedValueOnce();

      const result = service.recoverPassword(
        account.email,
        account.details.recoverCode,
        faker.internet.password(20, false, /\w/, '@2'),
      );

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_MANY_FAILED_RECOVERY_ATTEMPTS'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRecoverPasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountRecoverPasswordSpy.mockReset();
    });

    it('should throw an exception if account recover code is expired', async () => {
      expect.assertions(3);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        email: faker.internet.email(),
        details: {
          recoverCode: '01234567',
          recoverCodeDate: subMinutes(new Date(), 30),
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'recoverPassword').mockResolvedValueOnce();

      const result = service.recoverPassword(
        account.email,
        account.details.recoverCode,
        faker.internet.password(20, false, /\w/, '@2'),
      );

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_RECOVER_CODE_EXPIRED'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRecoverPasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountRecoverPasswordSpy.mockReset();
    });

    it('should throw an exception if account recover code is invalid', async () => {
      expect.assertions(4);

      const service = new AccountService();

      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        email: faker.internet.email(),
        details: {
          recoverCode: '01234567',
          recoverCodeDate: subMinutes(new Date(), 10),
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'recoverPassword').mockResolvedValueOnce();
      const accountIncreaseFailedRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'increaseFailedRecoverPassword').mockResolvedValueOnce();

      const result = service.recoverPassword(
        account.email,
        'invalid_code',
        faker.internet.password(20, false, /\w/, '@2'),
      );

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_RECOVER_CODE_INVALID'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRecoverPasswordSpy).toHaveBeenCalledTimes(0);
      expect(accountIncreaseFailedRecoverPasswordSpy).toHaveBeenCalledTimes(1);

      accountGetByEmailSpy.mockReset();
      accountRecoverPasswordSpy.mockReset();
      accountIncreaseFailedRecoverPasswordSpy.mockReset();
    });

    it('should throw an exception if new password is the same as the current', async () => {
      expect.assertions(4);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        email: faker.internet.email(),
        password: getEncryptedPassword(currentPassword),
        details: {
          recoverCode: '01234567',
          recoverCodeDate: subMinutes(new Date(), 10),
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'recoverPassword').mockResolvedValueOnce();
      const accountIncreaseFailedRecoverPasswordSpy = jest.spyOn(AccountRepository.prototype, 'increaseFailedRecoverPassword').mockResolvedValueOnce();

      const result = service.recoverPassword(
        account.email,
        account.details.recoverCode,
        currentPassword,
      );

      await expect(result).rejects.toThrow(new ValidationError('CURRENT_PASSWORD_SAME_NEW_PASSWORD'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountRecoverPasswordSpy).toHaveBeenCalledTimes(0);
      expect(accountIncreaseFailedRecoverPasswordSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountRecoverPasswordSpy.mockReset();
      accountIncreaseFailedRecoverPasswordSpy.mockReset();
    });
  });

  describe('sign in', () => {
    it('should sign in by email', async () => {
      expect.assertions(4);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        role: RoleEnum.DEFAULT,
        email: faker.internet.email(),
        password: getEncryptedPassword(currentPassword),
        person: faker.datatype.uuid(),
        details: {
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountGetByNicknameSpy = jest.spyOn(AccountRepository.prototype, 'getByNickname');
      const saveLastSignInSpy = jest.spyOn(AccountRepository.prototype, 'saveLastSignIn').mockResolvedValueOnce();

      const result = await service.signIn(account.email, currentPassword, false);

      expect(result).toBeDefined();
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountGetByNicknameSpy).toHaveBeenCalledTimes(0);
      expect(saveLastSignInSpy).toHaveBeenCalledTimes(1);

      accountGetByEmailSpy.mockReset();
      accountGetByNicknameSpy.mockReset();
      saveLastSignInSpy.mockReset();
    });

    it('should sign in by nickname', async () => {
      expect.assertions(4);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        role: RoleEnum.DEFAULT,
        email: faker.internet.email(),
        nickname: faker.name.firstName(),
        password: getEncryptedPassword(currentPassword),
        person: faker.datatype.uuid(),
        details: {
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail');
      const accountGetByNicknameSpy = jest.spyOn(AccountRepository.prototype, 'getByNickname').mockResolvedValueOnce(account as any);
      const saveLastSignInSpy = jest.spyOn(AccountRepository.prototype, 'saveLastSignIn').mockResolvedValueOnce();

      const result = await service.signIn(account.nickname, currentPassword, true);

      expect(result).toBeDefined();
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(0);
      expect(accountGetByNicknameSpy).toHaveBeenCalledTimes(1);
      expect(saveLastSignInSpy).toHaveBeenCalledTimes(1);

      accountGetByEmailSpy.mockReset();
      accountGetByNicknameSpy.mockReset();
      saveLastSignInSpy.mockReset();
    });

    it('should throw an exception if account not found', async () => {
      expect.assertions(4);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(null as any);
      const accountGetByNicknameSpy = jest.spyOn(AccountRepository.prototype, 'getByNickname');
      const saveLastSignInSpy = jest.spyOn(AccountRepository.prototype, 'saveLastSignIn');

      const result = service.signIn(faker.internet.email(), currentPassword, false);

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_NOT_FOUND'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountGetByNicknameSpy).toHaveBeenCalledTimes(0);
      expect(saveLastSignInSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountGetByNicknameSpy.mockReset();
      saveLastSignInSpy.mockReset();
    });

    it('should throw an exception if account is disabled', async () => {
      expect.assertions(4);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.DISABLED,
        role: RoleEnum.DEFAULT,
        email: faker.internet.email(),
        password: getEncryptedPassword(currentPassword),
        person: faker.datatype.uuid(),
        details: {
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountGetByNicknameSpy = jest.spyOn(AccountRepository.prototype, 'getByNickname');
      const saveLastSignInSpy = jest.spyOn(AccountRepository.prototype, 'saveLastSignIn');

      const result = service.signIn(account.email, currentPassword, false);

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_DISABLED'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountGetByNicknameSpy).toHaveBeenCalledTimes(0);
      expect(saveLastSignInSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountGetByNicknameSpy.mockReset();
      saveLastSignInSpy.mockReset();
    });

    it('should throw an exception if many failed sign in attempts are made', async () => {
      expect.assertions(4);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        role: RoleEnum.DEFAULT,
        email: faker.internet.email(),
        password: getEncryptedPassword(currentPassword),
        person: faker.datatype.uuid(),
        details: {
          lastFailedSignInAttemptDate: new Date(),
          countFailedSignInAttempts: 4,
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountGetByNicknameSpy = jest.spyOn(AccountRepository.prototype, 'getByNickname');
      const saveLastSignInSpy = jest.spyOn(AccountRepository.prototype, 'saveLastSignIn');

      const result = service.signIn(account.email, currentPassword, false);

      await expect(result).rejects.toThrow(new ValidationError('SIGN_IN_MANY_FAILED_ATTEMPTS', { value: 2 }));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountGetByNicknameSpy).toHaveBeenCalledTimes(0);
      expect(saveLastSignInSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountGetByNicknameSpy.mockReset();
      saveLastSignInSpy.mockReset();
    });

    it('should throw an exception if many failed sign in attempts are made (delay)', async () => {
      expect.assertions(4);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        role: RoleEnum.DEFAULT,
        email: faker.internet.email(),
        password: getEncryptedPassword(currentPassword),
        person: faker.datatype.uuid(),
        details: {
          lastFailedSignInAttemptDate: subMinutes(new Date(), 3),
          countFailedSignInAttempts: 6,
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountGetByNicknameSpy = jest.spyOn(AccountRepository.prototype, 'getByNickname');
      const saveLastSignInSpy = jest.spyOn(AccountRepository.prototype, 'saveLastSignIn');

      const result = service.signIn(account.email, currentPassword, false);

      await expect(result).rejects.toThrow(new ValidationError('SIGN_IN_MANY_FAILED_ATTEMPTS', { value: 1 }));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountGetByNicknameSpy).toHaveBeenCalledTimes(0);
      expect(saveLastSignInSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountGetByNicknameSpy.mockReset();
      saveLastSignInSpy.mockReset();
    });

    it('should throw an exception if password invalid', async () => {
      expect.assertions(5);

      const service = new AccountService();

      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        role: RoleEnum.DEFAULT,
        email: faker.internet.email(),
        password: getEncryptedPassword(currentPassword),
        person: faker.datatype.uuid(),
        details: {
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountGetByNicknameSpy = jest.spyOn(AccountRepository.prototype, 'getByNickname');
      const saveLastSignInSpy = jest.spyOn(AccountRepository.prototype, 'saveLastSignIn');
      const increaseFailedSignInSpy = jest.spyOn(AccountRepository.prototype, 'increaseFailedSignIn').mockResolvedValueOnce();

      const result = service.signIn(account.email, faker.internet.password(20, false, /\w/, '@2'), false);

      await expect(result).rejects.toThrow(new ValidationError('PASSWORD_INVALID'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountGetByNicknameSpy).toHaveBeenCalledTimes(0);
      expect(saveLastSignInSpy).toHaveBeenCalledTimes(0);
      expect(increaseFailedSignInSpy).toHaveBeenCalledTimes(1);

      accountGetByEmailSpy.mockReset();
      accountGetByNicknameSpy.mockReset();
      saveLastSignInSpy.mockReset();
      increaseFailedSignInSpy.mockReset();
    });

    it('should throw an exception if invalid environment was provided', async () => {
      expect.assertions(4);

      const service = new AccountService();

      process.env = {};
      const currentPassword = faker.internet.password(20, false, /\w/, '@2');
      const account = {
        _id: faker.datatype.uuid(),
        status: StatusEnum.VERIFIED,
        role: RoleEnum.DEFAULT,
        email: faker.internet.email(),
        password: getEncryptedPassword(currentPassword),
        person: faker.datatype.uuid(),
        details: {
        },
      };
      const accountGetByEmailSpy = jest.spyOn(AccountRepository.prototype, 'getByEmail').mockResolvedValueOnce(account as any);
      const accountGetByNicknameSpy = jest.spyOn(AccountRepository.prototype, 'getByNickname');
      const saveLastSignInSpy = jest.spyOn(AccountRepository.prototype, 'saveLastSignIn');

      const result = service.signIn(account.email, currentPassword, false);

      await expect(result).rejects.toThrow(new ValidationError('INTERNAL_ERROR_INVALID_ENV'));
      expect(accountGetByEmailSpy).toHaveBeenCalledTimes(1);
      expect(accountGetByNicknameSpy).toHaveBeenCalledTimes(0);
      expect(saveLastSignInSpy).toHaveBeenCalledTimes(0);

      accountGetByEmailSpy.mockReset();
      accountGetByNicknameSpy.mockReset();
      saveLastSignInSpy.mockReset();
    });
  });
});
