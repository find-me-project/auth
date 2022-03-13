import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { AccountService, PersonService } from 'src/services';
import parameterValidation from './parameter-validation';

async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const {
    name,
    birthDate,
    nickname,
    email,
    password,
  } = request.body;

  const personService = new PersonService(session);
  const person = await personService.create({
    name: name,
    birthDate: birthDate,
  });

  const accountService = new AccountService(session, true);
  const account = await accountService.create({
    nickname: nickname,
    email: email,
    password: password,
    person: person._id,
  });

  return response.successfulCreated({
    account: account,
  }, 'SAVED');
}

export default {
  validation: parameterValidation,
  method: method,
};
