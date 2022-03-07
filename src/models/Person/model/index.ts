import { differenceInYears, isValid } from 'date-fns';
import ValidationError from 'src/util/error/validation-error';
import { uuidValidateV4 } from 'src/util/uuid';
import { v4 as uuidv4 } from 'uuid';
import type { PersonType } from '..';

export default function makePerson (person: PersonType): Readonly<PersonType> {
  if (person._id && !uuidValidateV4(person._id)) {
    throw new ValidationError('ID_INVALID');
  }
  if (!person.name) {
    throw new ValidationError('NAME_REQUIRED');
  }
  if (person.name.length < 3) {
    throw new ValidationError('NAME_MIN_LENGTH', { value: 3 });
  }
  if (person.name.length > 30) {
    throw new ValidationError('NAME_MAX_LENGTH', { value: 30 });
  }
  if (!person.name.match(/^([A-Z][a-z]+([ ]?[a-z]?['-]?[A-Z][a-z]+)*)$/g)) {
    throw new ValidationError('NAME_INVALID');
  }
  if (!person.birthDate) {
    throw new ValidationError('BIRTH_DATE_REQUIRED');
  }
  if (!(person.birthDate instanceof Date)) {
    throw new ValidationError('BIRTH_DATE_INVALID');
  }
  if (!isValid(person.birthDate)) {
    throw new ValidationError('BIRTH_DATE_INVALID');
  }

  const age = differenceInYears(new Date(), person.birthDate);
  if (age < 13) {
    throw new ValidationError('BIRTH_DATE_MIN_DATE', { value: 13 });
  }
  if (age > 116) {
    throw new ValidationError('BIRTH_DATE_INVALID');
  }

  return Object.freeze({
    _id: person._id || uuidv4(),
    name: person.name,
    birthDate: person.birthDate,
  });
}
