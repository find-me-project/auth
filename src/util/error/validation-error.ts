import getMessage, { ParamsType } from '../i18n/methods/get-message';

export default class ValidationError extends Error {
  private readonly code: string;

  private readonly params?: ParamsType;

  public constructor (code: string, params?: ParamsType) {
    super(code);
    const message = getMessage(code, params);

    this.name = 'ValidationError';
    this.code = message.code;
    this.params = message.params;
    this.message = message.message!;

    Error.captureStackTrace(this, ValidationError);
  }

  public getName (): string {
    return this.name;
  }

  public getMessage (): string | undefined {
    return this.message;
  }

  public getParams (): ParamsType | undefined {
    return this.params;
  }

  public getCode (): string {
    return this.code;
  }
}
