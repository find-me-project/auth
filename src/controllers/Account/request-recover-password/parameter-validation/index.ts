import { body } from 'express-validator';
import getMessage from 'src/util/i18n/methods/get-message';

export default [
  body('email')
    .not().isEmpty()
    .withMessage(getMessage('EMAIL_REQUIRED'))
    .isEmail()
    .withMessage(getMessage('EMAIL_INVALID'))
    .trim()
    .escape(),
];
