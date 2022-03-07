function getRandomCode (maxLength: number, value?: string): string {
  if (value && value.length >= maxLength) {
    return value;
  }

  return getRandomCode(maxLength, `${value || ''}${Math.floor(Math.random() * 10)}`);
}

export default function randomCode (maxLength: number): string {
  return getRandomCode(maxLength);
}
