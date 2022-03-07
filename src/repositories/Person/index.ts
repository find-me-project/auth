import { AccountType } from 'src/models/Account';
import { PersonType } from 'src/models/Person';

interface IPersonRepository {
  create (person: PersonType): Promise<PersonType>,
  update (person: PersonType): Promise<PersonType>,
  getAccount (id: string): Promise<AccountType | null>
}

export default IPersonRepository;
