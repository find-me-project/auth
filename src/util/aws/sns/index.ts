import { config, SNS } from 'aws-sdk';
import ValidationError from 'src/util/error/validation-error';

type SNSParamsType = {
  TopicArn: string,
  Message: string,
}

export class SNSService {
  private service: SNS

  constructor () {
    const {
      AWS_REGION,
    } = process.env;

    if (!AWS_REGION) {
      throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
    }

    config.update({ region: AWS_REGION });
    this.service = new SNS();
  }

  private async sendMessage (params: SNSParamsType): Promise<void> {
    await this.service.publish(params).promise();
  }

  async sendVerificationEmail (nickname: string, email: string, code: string): Promise<void> {
    const {
      AWS_TOPIC_ARN_VERIFICATION_EMAIL,
    } = process.env;

    if (!AWS_TOPIC_ARN_VERIFICATION_EMAIL) {
      throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
    }

    const payload: SNSParamsType = {
      TopicArn: AWS_TOPIC_ARN_VERIFICATION_EMAIL,
      Message: JSON.stringify({
        nickname: nickname,
        email: email,
        code: code,
      }),
    };

    await this.sendMessage(payload);
  }

  async sendRecoverPasswordEmail (email: string, code: string): Promise<void> {
    const {
      AWS_TOPIC_ARN_RECOVER_PASSWORD,
    } = process.env;

    if (!AWS_TOPIC_ARN_RECOVER_PASSWORD) {
      throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
    }

    const payload: SNSParamsType = {
      TopicArn: AWS_TOPIC_ARN_RECOVER_PASSWORD,
      Message: JSON.stringify({
        email: email,
        code: code,
      }),
    };

    await this.sendMessage(payload);
  }
}
