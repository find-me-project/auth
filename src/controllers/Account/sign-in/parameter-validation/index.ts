import { body } from 'express-validator';
import getMessage from 'src/util/i18n/methods/get-message';

export default [
  body('isNickname')
    .not().isEmpty()
    .withMessage(getMessage('IS_NICKNAME_REQUIRED'))
    .isBoolean()
    .withMessage(getMessage('IS_NICKNAME_INVALID'))
    .toBoolean(),
  body('accessData')
    .not().isEmpty()
    .withMessage(getMessage('ACCESS_DATA_REQUIRED'))
    .isString()
    .withMessage(getMessage('ACCESS_DATA_INVALID'))
    .trim()
    .escape(),
  body('password')
    .not().isEmpty()
    .withMessage(getMessage('PASSWORD_REQUIRED'))
    .isString()
    .withMessage(getMessage('PASSWORD_INVALID'))
    .trim()
    .escape(),
];
