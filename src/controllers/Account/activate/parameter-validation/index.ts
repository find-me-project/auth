import { body } from 'express-validator';
import getMessage from 'src/util/i18n/methods/get-message';

export default [
  body('code')
    .not().isEmpty()
    .withMessage(getMessage('CODE_REQUIRED'))
    .isString()
    .withMessage(getMessage('CODE_INVALID'))
    .isLength({ min: 8, max: 8 })
    .withMessage(getMessage('CODE_INVALID'))
    .trim()
    .escape(),
];
