import { body } from 'express-validator';
import getMessage from 'src/util/i18n/methods/get-message';

export default [
  body('nickname')
    .not().isEmpty()
    .withMessage(getMessage('NICKNAME_REQUIRED'))
    .trim()
    .escape(),
  body('email')
    .not().isEmpty()
    .withMessage(getMessage('EMAIL_REQUIRED'))
    .isEmail()
    .withMessage(getMessage('EMAIL_INVALID'))
    .trim()
    .escape(),
  body('password')
    .not().isEmpty()
    .withMessage(getMessage('PASSWORD_REQUIRED')),
  body('name')
    .not().isEmpty()
    .withMessage(getMessage('NAME_REQUIRED'))
    .trim()
    .escape(),
  body('birthDate')
    .not().isEmpty()
    .withMessage(getMessage('BIRTH_DATE_REQUIRED'))
    .isDate()
    .withMessage(getMessage('BIRTH_DATE_INVALID'))
    .toDate(),
];
