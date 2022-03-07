import { ClientSession } from 'mongoose';
import { StatusEnum } from 'src/models/Account';
import { PersonType } from 'src/models/Person';
import makePerson from 'src/models/Person/model';
import IPersonRepository from 'src/repositories/Person';
import { PersonRepository } from 'src/repositories/Person/repository';
import ValidationError from 'src/util/error/validation-error';

export class PersonService {
  private repository: IPersonRepository;

  constructor (session?: ClientSession) {
    this.repository = new PersonRepository(session);
  }

  async create (data: PersonType): Promise<PersonType> {
    const person = makePerson(data);
    const result = await this.repository.create(person);

    return result;
  }

  private async canUpdate (id: string): Promise<boolean> {
    const personExists = await PersonRepository.existsById(id);
    if (!personExists) {
      throw new ValidationError('PERSON_NOT_FOUND');
    }

    const account = await this.repository.getAccount(id);
    if (!account) {
      throw new ValidationError('ACCOUNT_NOT_FOUND');
    }

    if (account.status !== StatusEnum.VERIFIED) {
      throw new ValidationError('ACCOUNT_IS_NOT_VERIFIED');
    }

    return true;
  }

  async update (data: PersonType): Promise<PersonType> {
    await this.canUpdate(data._id!);

    const person = makePerson(data);
    const result = await this.repository.update(person);

    return result;
  }
}
