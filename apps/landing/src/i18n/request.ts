import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';

export default getRequestConfig(async () => {
  const messages = (await import('../../messages/it.json')).default;
  return {
    locale: 'it',
    messages: messages as unknown as AbstractIntlMessages,
  };
});
