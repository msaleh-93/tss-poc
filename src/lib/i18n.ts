import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import arTranslations from "~/locales/ar.json";
import enTranslations from "~/locales/en.json";

export const resources = {
    ar: { translation: arTranslations },
    en: { translation: enTranslations },
} as const;

export const DEFAULT_NS = "translation";

const COOKIE_KEY = "i18nLng";

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        defaultNS: DEFAULT_NS,
        fallbackLng: "en",
        supportedLngs: ["ar", "en"],
        detection: {
            order: ["cookie"],
            lookupCookie: COOKIE_KEY,
            caches: ["cookie"],
            cookieMinutes: 60 * 24 * 365,
        },
        interpolation: { escapeValue: false },
    });

export const setSSRLanguage = createIsomorphicFn().server(async () => {
    const language = getCookie(COOKIE_KEY);
    await i18n.changeLanguage(language || "en");
});

export default i18n;
