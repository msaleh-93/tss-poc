import { ScriptOnce } from "@tanstack/react-router";
import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
import { createStore, useStore } from "zustand";

import { cachedGetter } from "~/utils";

const APP_THEMES = ["dark", "light"] as const,
    USER_THEMES = ["system", ...APP_THEMES] as const,
    THEME_KEY = "theme";

export type AppTheme = (typeof APP_THEMES)[number];
export type UserTheme = (typeof USER_THEMES)[number];

const systemDarkTheme = createClientOnlyFn(
    cachedGetter(() => window.matchMedia("(prefers-color-scheme: dark)")),
);

const getSystemTheme = createIsomorphicFn()
    .server(() => "light" as const)
    .client((): AppTheme => (systemDarkTheme().matches ? "dark" : "light"));

interface ThemeStore {
    userTheme: UserTheme;
    appTheme: AppTheme;
    setUserTheme: (theme: UserTheme | "next") => void;
}

const themeStore = createStore<ThemeStore>()((set, get) => {
    let initTheme = "system" as UserTheme,
        controller: AbortController | undefined;

    function updateDOM() {
        const { userTheme, appTheme } = get(),
            { classList } = document.documentElement;

        let theme;
        for (theme of USER_THEMES)
            classList.toggle(theme, theme === userTheme || theme === appTheme);
    }

    function trackSystemTheme() {
        controller = new AbortController();
        systemDarkTheme().addEventListener(
            "change",
            () => {
                set({ appTheme: getSystemTheme() });
                updateDOM();
                // console.log("handleSystemThemeChange", get());
            },
            { signal: controller.signal },
        );
    }

    createIsomorphicFn().client(() => {
        initTheme = localStorage.getItem(THEME_KEY) as UserTheme;
        if (!USER_THEMES.includes(initTheme)) initTheme = "system";

        if (initTheme === "system") trackSystemTheme();

        window.addEventListener("storage", ({ key, newValue }) => {
            if (key !== THEME_KEY) return;
            const theme = newValue as UserTheme;
            get().setUserTheme(USER_THEMES.includes(theme) ? theme : "system");
            // console.log("handleStorageChange", get());
        });
    })();

    return {
        userTheme: initTheme,
        appTheme: initTheme === "system" ? getSystemTheme() : initTheme,
        setUserTheme(userTheme) {
            const prevTheme = get().userTheme;

            if (userTheme === "next")
                userTheme =
                    USER_THEMES[
                        (USER_THEMES.indexOf(prevTheme) + 1) %
                            USER_THEMES.length
                    ];
            set({
                userTheme,
                appTheme: userTheme === "system" ? getSystemTheme() : userTheme,
            });

            updateDOM();
            localStorage.setItem(THEME_KEY, userTheme);

            if (userTheme === prevTheme) return;

            controller?.abort();
            if (userTheme === "system") trackSystemTheme();
            else controller = undefined;
        },
    };
});

export function useTheme<T>(selector: (s: ThemeStore) => T): T;
export function useTheme(): ThemeStore;
export function useTheme(selector?: (s: ThemeStore) => unknown) {
    return useStore(themeStore, selector!);
}

export function ThemeScript() {
    return <ScriptOnce>{THEME_SCRIPT}</ScriptOnce>;
}

const THEME_SCRIPT = (() => {
    function setTheme() {
        const THEMES = [
                { key: "light", icon: "☀️" },
                { key: "dark", icon: "🌒" },
                { key: "system", icon: "💻️" },
            ],
            classList = document.documentElement.classList;

        let appTheme = localStorage.getItem("theme") || "system";
        if (THEMES.every(({ key }) => key !== appTheme)) appTheme = "system";

        let theme;
        for ({ key: theme } of THEMES)
            classList.toggle(theme, theme === appTheme);

        if (appTheme === "system")
            classList.toggle(
                "dark",
                window.matchMedia("(prefers-color-scheme: dark)").matches,
            );

        console.log(
            `Theme Set to ${THEMES.find(({ key }) => key === appTheme)?.icon}`,
        );
    }
    return `(${setTheme.toString()})()`;
})();
