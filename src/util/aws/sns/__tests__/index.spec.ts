import { faker } from '@faker-js/faker';
import {
  describe, it, expect, jest,
} from '@jest/globals';
import ValidationError from '../../../error/validation-error';
import { SNSService } from '../..';
import randomCode from '../../../code/random-code';

describe('sns service', () => {
  describe('constructor', () => {
    it('should create a sns service', () => {
      expect.assertions(1);

      const service = new SNSService();

      expect(service).toBeDefined();
    });

    it('should not create a sns service if invalid environment was provided', () => {
      expect.assertions(1);

      process.env = {};

      expect(
        () => new SNSService(),
      )
        .toThrow(new ValidationError('INTERNAL_ERROR_INVALID_ENV'));
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      expect.assertions(1);

      const {
        AWS_TOPIC_ARN_VERIFICATION_EMAIL,
      } = process.env;

      const service = new SNSService();
      const sendMessageSpy = jest.spyOn(service as any, 'sendMessage').mockImplementationOnce(() => null);

      const nickname = faker.name.firstName();
      const email = faker.internet.email();
      const code = randomCode(6);

      await service.sendVerificationEmail(nickname, email, code);

      const payload = {
        TopicArn: AWS_TOPIC_ARN_VERIFICATION_EMAIL,
        Message: JSON.stringify({
          nickname: nickname,
          email: email,
          code: code,
        }),
      };

      expect(sendMessageSpy).toHaveBeenCalledWith(payload);
    });

    it('should send verification email - with sns publish', async () => {
      expect.assertions(1);

      const {
        AWS_TOPIC_ARN_VERIFICATION_EMAIL,
      } = process.env;

      jest.mock('aws-sdk/clients/sns', () => jest.fn().mockImplementationOnce(() => ({
        publish: jest.fn().mockImplementationOnce(() => ({
          promise: jest.fn().mockReturnValueOnce(null),
        })),
      })));
      const service = new SNSService();
      const sendMessageSpy = jest.spyOn(service as any, 'sendMessage');

      const nickname = faker.name.firstName();
      const email = faker.internet.email();
      const code = randomCode(6);

      await service.sendVerificationEmail(nickname, email, code);

      const payload = {
        TopicArn: AWS_TOPIC_ARN_VERIFICATION_EMAIL,
        Message: JSON.stringify({
          nickname: nickname,
          email: email,
          code: code,
        }),
      };

      expect(sendMessageSpy).toHaveBeenCalledWith(payload);
    });

    it('should not send verification email if invalid environment was provided', async () => {
      expect.assertions(2);

      const service = new SNSService();
      const sendMessageSpy = jest.spyOn(service as any, 'sendMessage').mockImplementationOnce(() => null);
      process.env = {};

      const nickname = faker.name.firstName();
      const email = faker.internet.email();
      const code = randomCode(6);

      const result = service.sendVerificationEmail(nickname, email, code);

      await expect(
        result,
      )
        .rejects
        .toThrow(new ValidationError('INTERNAL_ERROR_INVALID_ENV'));
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('sendRecoverPasswordEmail', () => {
    it('should send recover password email', async () => {
      expect.assertions(1);

      const {
        AWS_TOPIC_ARN_RECOVER_PASSWORD,
      } = process.env;

      const service = new SNSService();
      const sendMessageSpy = jest.spyOn(service as any, 'sendMessage').mockImplementationOnce(() => null);

      const email = faker.internet.email();
      const code = randomCode(6);

      await service.sendRecoverPasswordEmail(email, code);

      const payload = {
        TopicArn: AWS_TOPIC_ARN_RECOVER_PASSWORD,
        Message: JSON.stringify({
          email: email,
          code: code,
        }),
      };

      expect(sendMessageSpy).toHaveBeenCalledWith(payload);
    });

    it('should not send recover password email if invalid environment was provided', async () => {
      expect.assertions(2);

      const service = new SNSService();
      const sendMessageSpy = jest.spyOn(service as any, 'sendMessage').mockImplementationOnce(() => null);
      process.env = {};

      const email = faker.internet.email();
      const code = randomCode(6);

      const result = service.sendRecoverPasswordEmail(email, code);
      await expect(
        result,
      )
        .rejects
        .toThrow(new ValidationError('INTERNAL_ERROR_INVALID_ENV'));
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);
    });
  });
});
