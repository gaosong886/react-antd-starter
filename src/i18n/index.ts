import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './locales/zh.json';
import en from './locales/en.json';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    zh: {
        translation: zh,
    },
    en: {
        translation: en,
    },
};

i18n.use(initReactI18next)
    .use(new LanguageDetector(null, { order: ['querystring', 'navigator', 'htmlTag'] }))
    .init({
        resources,
        fallbackLng: 'en',
    });

export default i18n;
