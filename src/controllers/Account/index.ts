import activate from './activate';
import create from './create';
import recoverPassword from './recover-password';
import requestActivationCode from './request-activation-code';
import requestRecoverPassword from './request-recover-password';
import signIn from './sign-in';
import signOut from './sign-out';
import updatePassword from './update-password';

export default {
  create: create,
  activate: activate,
  recoverPassword: recoverPassword,
  requestActivationCode: requestActivationCode,
  requestRecoverPassword: requestRecoverPassword,
  signIn: signIn,
  signOut: signOut,
  updatePassword: updatePassword,
};
