import { AccountDetailsType } from '../AccountDetails';
import { PersonType } from '../Person';

export enum RoleEnum {
  DEFAULT = 'default',
  ADMIN = 'admin',
}

export enum StatusEnum {
  UNVERIFIED = 'unverified',
  VERIFIED = 'verified',
  DISABLED = 'disabled',
}

export type AccountType = {
  _id?: string,
  nickname: string,
  email: string,
  password?: string,
  role?: RoleEnum,
  status?: StatusEnum,
  person?: string | PersonType,
  details?: string | AccountDetailsType,
  createdAt?: Date,
  updatedAt?: Date,
}
