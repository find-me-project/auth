import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { PersonService } from 'src/services';
import parameterValidation from './parameter-validation';

async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const {
    name,
    birthDate,
  } = request.body;

  const {
    personId,
  } = request.accessData!;

  const service = new PersonService(session);
  const result = await service.update({
    _id: personId,
    name: name,
    birthDate: birthDate,
  });

  return response.success({
    person: result,
  }, 'UPDATED');
}

export default {
  validation: parameterValidation,
  method: method,
};
