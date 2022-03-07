import getLocale from './get-locale';

export type ParamsType = Record<string, string | number | boolean>
export type MessageType = {
  code: string,
  message?: string,
  params?: ParamsType
}

/**
 * Get the i18n message object
 *
 * @param {string} key - i18n object key (always String uppercase)
 * @param {ParamsType} params - (Optional) parameters object
 * @returns a MessageType object with {code: string, message: string, params: ParamsType}
 */
export default function getMessage (key: string, params?: ParamsType): MessageType {
  const locale = getLocale();
  let message = locale[key.toUpperCase()];

  if (message && message.length && params) {
    Object.keys(params).forEach((p: string) => {
      message = message.replace(`{${p}}`, params[p].toString());
    });
  }

  return {
    code: key.toUpperCase(),
    message: message,
    params: params,
  };
}
