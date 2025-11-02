import "i18next";

import type translation from "../locales/en.json";
import type { DEFAULT_NS } from "./i18n";

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: typeof DEFAULT_NS;
        resources: {
            translation: typeof translation;
        };
    }
}
