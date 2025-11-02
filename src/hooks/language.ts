import { useEffect } from "react";

import { useFnRef } from "./utils";

import i18n from "~/lib/i18n";

export function useOnLanguageChange(fn: () => void) {
    const onChange = useFnRef(fn);

    useEffect(() => {
        i18n.on("languageChanged", onChange);
        return () => i18n.off("languageChanged", onChange);
    }, []);
}
