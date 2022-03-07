import { version as uuidVersion, validate as uuidValidate } from 'uuid';

export function uuidValidateV4 (uuid: string): boolean {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

export default {};
