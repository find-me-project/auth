import en from '../lang/en.json';

enum lang {
  EN = 'EN'
}

const langFiles = {
  EN: en,
};

/**
 * Get i18n locale file
 */
export default function getLocale (): Record<string, string> {
  const {
    LOCALE,
  } = process.env;

  return langFiles[(LOCALE || 'EN') as lang];
}
