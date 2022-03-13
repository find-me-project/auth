import { ClientSession } from 'mongoose';
import { AccountType } from 'src/models/Account';
import { AccountModel } from 'src/models/Account/schema';
import { PersonType } from 'src/models/Person';
import { PersonModel } from 'src/models/Person/schema';
import IPersonRepository from '..';

export class PersonRepository implements IPersonRepository {
  private session?: ClientSession;

  constructor (session?: ClientSession) {
    this.session = session;
  }

  async create (person: PersonType): Promise<PersonType> {
    const result = new PersonModel(person);
    await result.save({ session: this.session });
    const item = result.toJSON();

    return item;
  }

  async update (person: PersonType): Promise<PersonType> {
    const result = await PersonModel.findOneAndUpdate(
      { _id: person._id },
      {
        $set: {
          name: person.name,
          birthDate: person.birthDate,
        },
      },
      {
        new: true,
        session: this.session,
      },
    ).exec();

    return result!.toJSON();
  }

  async getAccount (id: string): Promise<AccountType | null> {
    const result = await AccountModel.findOne(
      { person: id },
      null,
      {
        session: this.session,
      },
    ).exec();

    if (result) {
      return result.toJSON();
    }

    return result;
  }

  static async existsById (id: string): Promise<boolean> {
    const result = await PersonModel.exists({ _id: id });

    return !!result;
  }
}
