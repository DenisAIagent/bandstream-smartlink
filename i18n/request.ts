import {getRequestConfig} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {headers} from 'next/headers';

export default getRequestConfig(async ({requestLocale}) => {
  // Try to get locale from requestLocale first
  let locale = await requestLocale;

  // If no locale is found, try to detect from Accept-Language header
  if (!locale) {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    
    if (acceptLanguage) {
      // Get the first preferred language from the Accept-Language header
      const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
      if (routing.locales.includes(preferredLocale as any)) {
        locale = preferredLocale;
      }
    }
  }

  // If still no valid locale is found, use default
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  
  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default
  };
});