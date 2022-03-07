import { body } from 'express-validator';
import getMessage from 'src/util/i18n/methods/get-message';

export default [
  body('currentPassword')
    .not().isEmpty()
    .withMessage(getMessage('PASSWORD_REQUIRED'))
    .isString()
    .withMessage(getMessage('PASSWORD_INVALID'))
    .escape(),
  body('newPassword')
    .not().isEmpty()
    .withMessage(getMessage('PASSWORD_REQUIRED'))
    .isString()
    .withMessage(getMessage('PASSWORD_INVALID'))
    .escape(),
];
