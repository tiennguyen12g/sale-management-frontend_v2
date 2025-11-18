import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import viTranslations from './locales/vi.json';

// Get saved locale from localStorage or default to 'en'
const savedLocale = localStorage.getItem('locale') || 'en';
const defaultLocale = (savedLocale === 'en' || savedLocale === 'vi') ? savedLocale : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      vi: {
        translation: viTranslations,
      },
    },
    lng: defaultLocale,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Sync locale changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('locale', lng);
});

export default i18n;

