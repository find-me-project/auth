import type { Request, Response } from 'express';
import { Router } from 'express';
import Account from 'src/controllers/Account';
import Person from 'src/controllers/Person';
import init from 'src/util/router';
import { auth } from './middlewares';
import makeExpressCallback from './util/make-express-callback';

const routes = Router();

init(routes);

routes.get('/', (_request: Request, response: Response) => response.json({ message: 'Hello there' }));

// =======================================================
// ACCOUNT
// =======================================================

routes.post(
  '/account',
  Account.create.validation,
  makeExpressCallback(Account.create.method),
);

routes.patch(
  '/account/activate',
  auth.isAuthenticated,
  makeExpressCallback(Account.requestActivationCode.method),
);

routes.post(
  '/account/activate',
  auth.isAuthenticated,
  Account.activate.validation,
  makeExpressCallback(Account.activate.method),
);

routes.patch(
  '/account/recover-password',
  Account.requestRecoverPassword.validation,
  makeExpressCallback(Account.requestRecoverPassword.method),
);

routes.post(
  '/account/recover-password',
  Account.recoverPassword.validation,
  makeExpressCallback(Account.recoverPassword.method),
);

routes.patch(
  '/account/password',
  auth.isAuthenticated,
  Account.updatePassword.validation,
  makeExpressCallback(Account.updatePassword.method),
);

routes.post(
  '/account/sign-in',
  Account.signIn.validation,
  makeExpressCallback(Account.signIn.method),
);

routes.post(
  '/account/sign-out',
  auth.isAuthenticated,
  makeExpressCallback(Account.signOut.method),
);

// =======================================================
// PERSON
// =======================================================

routes.put(
  '/person',
  auth.isAuthenticated,
  Person.update.validation,
  makeExpressCallback(Person.update.method),
);

export default routes;
