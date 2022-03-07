import { body } from 'express-validator';
import getMessage from 'src/util/i18n/methods/get-message';

export default [
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
