import { faker } from '@faker-js/faker';
import { describe, it, expect } from '@jest/globals';
import makePerson from '..';
import ValidationError from '../../../../util/error/validation-error';

describe('make person', () => {
  it('should create a new person', () => {
    expect.assertions(3);

    const person = {
      name: faker.name.firstName(),
      birthDate: new Date('2000-01-01'),
    };
    const result = makePerson(person);

    expect(result._id).toBeDefined();
    expect(result.name).toBe(person.name);
    expect(result.birthDate).toBe(person.birthDate);
  });

  it('should throw an exception if _id is invalid', () => {
    expect.assertions(1);

    const person = {
      _id: 'invalid_id',
    };

    expect(
      () => makePerson(person as any),
    )
      .toThrow(new ValidationError('ID_INVALID'));
  });

  it('should throw an exception if name is not provided', () => {
    expect.assertions(1);

    const person = {
      name: undefined,
    };

    expect(
      () => makePerson(person as any),
    )
      .toThrow(new ValidationError('NAME_REQUIRED'));
  });

  it('should throw an exception if name length < 3', () => {
    expect.assertions(1);

    const person = {
      name: 'A',
    };

    expect(
      () => makePerson(person as any),
    )
      .toThrow(new ValidationError('NAME_MIN_LENGTH', { value: 3 }));
  });

  it('should throw an exception if name length > 30', () => {
    expect.assertions(1);

    const person = {
      name: faker.lorem.paragraph(),
    };

    expect(
      () => makePerson(person as any),
    )
      .toThrow(new ValidationError('NAME_MAX_LENGTH', { value: 30 }));
  });

  it('should throw an exception if name is invalid', () => {
    expect.assertions(1);

    const person = {
      name: 'Invalid Name !',
    };

    expect(
      () => makePerson(person as any),
    )
      .toThrow(new ValidationError('NAME_INVALID'));
  });

  it('should throw an exception if birth date is not provided', () => {
    expect.assertions(1);

    const person = {
      name: faker.name.firstName(),
      birthDate: undefined,
    };

    expect(
      () => makePerson(person as any),
    )
      .toThrow(new ValidationError('BIRTH_DATE_REQUIRED'));
  });

  it('should throw an exception if birth date is not Date', () => {
    expect.assertions(1);

    const person = {
      name: faker.name.firstName(),
      birthDate: 'invalid date',
    };

    expect(
      () => makePerson(person as any),
    )
      .toThrow(new ValidationError('BIRTH_DATE_INVALID'));
  });

  it('should throw an exception if birth date is invalid', () => {
    expect.assertions(1);

    const person = {
      name: faker.name.firstName(),
      birthDate: new Date('invalid date'),
    };

    expect(
      () => makePerson(person as any),
    )
      .toThrow(new ValidationError('BIRTH_DATE_INVALID'));
  });

  it('should throw an exception if the person\'s age is less than 13 years old', () => {
    expect.assertions(1);

    const person = {
      name: faker.name.firstName(),
      birthDate: new Date(),
    };

    expect(
      () => makePerson(person as any),
    )
      .toThrow(new ValidationError('BIRTH_DATE_MIN_DATE', { value: 13 }));
  });

  it('should throw an exception if the person\'s age is greater than 116 years old', () => {
    expect.assertions(1);

    const person = {
      name: faker.name.firstName(),
      birthDate: new Date('1900-01-01'),
    };

    expect(
      () => makePerson(person as any),
    )
      .toThrow(new ValidationError('BIRTH_DATE_INVALID'));
  });
});
