import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useChildMatches, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
    ChevronDown,
    ChevronRight,
    Home,
    Menu,
    Network,
    SquareFunction,
    StickyNote,
    X,
} from "lucide-react";
import { Suspense, memo, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import Button from "./Button";
import { GuestOnly } from "./GuestOnly";
import { UserOnly } from "./UserOnly";

import { authQueries, signOut } from "~/api/auth";
import { useTheme } from "~/lib/theme";
import { cn } from "~/utils";

export default function Header() {
    const routerState = useRouterState();
    return routerState.location.pathname.startsWith("/demo") ? (
        <DemoHeader />
    ) : (
        <MainHeader />
    );
}

function MainHeader() {
    return (
        <header className="w-full h-16 px-8 bg-indigo-700 text-white flex items-center justify-between sticky top-0">
            <div className="flex gap-5 items-center">
                <Link
                    to="/"
                    className="size-10 bg-white rounded-tl-2xl rounded-br-2xl relative after:content-[''] after:size-6 after:bg-pink-500 after:rounded-full after:absolute after:left-1 after:top-1"
                ></Link>
                <Title />
            </div>
            <div className="flex gap-5">
                <ThemeToggle />
                <LanguageToggle />
                <AuthSection />
                <Link to="/demo">
                    <Button label="Demo" outlined small color="secondary" />
                </Link>
            </div>
        </header>
    );
}

const Title = memo(() => {
    const matches = useChildMatches();
    const { t } = useTranslation();
    const pageTitle = useMemo(() => {
        let i, context;
        for (i = matches.length; i > 0; i--) {
            context = matches[i - 1].context;
            if ("pageTitle" in context) return context.pageTitle;
        }

        return t("fly akeed");
    }, [matches]);

    return (
        <h1 className="text-2xl font-bold" dir="auto">
            {pageTitle}
        </h1>
    );
});

const AuthSection = memo(() => {
    const routerState = useRouterState();
    return routerState.location.pathname !== "/sign-in" ? (
        <Suspense fallback={null}>
            <UserOnly>
                <SignOutButton />
            </UserOnly>
            <GuestOnly>
                <SignInButton />
            </GuestOnly>
        </Suspense>
    ) : null;
});

const SignInButton = memo(() => {
    const routerState = useRouterState();
    const { t } = useTranslation();

    return (
        <Link to="/sign-in" search={{ refUrl: routerState.location.href }}>
            <Button label={t("sign in")} color="success" small />
        </Link>
    );
});

const SignOutButton = memo(() => {
    const queryClient = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: useServerFn(signOut),
        onSuccess() {
            queryClient.invalidateQueries(authQueries.user());
        },
    });

    const { t } = useTranslation();

    return (
        <Button
            label={t("sign out")}
            color="danger"
            onClick={() => mutate({})}
            small
        />
    );
});

const LANGS = [
    { code: "ar", label: "ع", className: "pb-2" },
    { code: "en", label: "En", className: undefined },
] as const;

const LanguageToggle = memo(() => {
    const { i18n } = useTranslation();

    return (
        <div className="h-9 p-0.5 bg-white rounded-md flex">
            {LANGS.map(({ code, label, className }) => (
                <button
                    key={code}
                    className={cn(
                        "size-8 flex items-center justify-center rounded font-bold",
                        {
                            "bg-indigo-700": i18n.language === code,
                            "text-black": i18n.language !== code,
                        },
                        className,
                    )}
                    onClick={() => {
                        i18n.changeLanguage(code);
                    }}
                >
                    {label}
                </button>
            ))}
        </div>
    );
});

const ThemeToggle = memo(() => {
    const setUserTheme = useTheme((s) => s.setUserTheme);

    return (
        <button
            className="size-9 border-2 border-white rounded-md font-bold flex items-center justify-center"
            onClick={() => setUserTheme("next")}
        >
            <span className="not-system:hidden pb-1">💻️</span>
            <span className="system:hidden not-dark:hidden">🌒</span>
            <span className="system:hidden dark:hidden">☀️</span>
        </button>
    );
});

function DemoHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const [groupedExpanded, setGroupedExpanded] = useState<
        Record<string, boolean>
    >({});

    return (
        <>
            <header className="p-4 flex items-center bg-gray-800 text-white shadow-lg">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <h1 className="ml-4 text-xl font-semibold">
                    <Link to="/">
                        <img
                            src="/tanstack-word-logo-white.svg"
                            alt="TanStack Logo"
                            className="h-10"
                        />
                    </Link>
                </h1>
            </header>

            <aside
                className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Navigation</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <Link
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                        activeProps={{
                            className:
                                "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                        }}
                    >
                        <Home size={20} />
                        <span className="font-medium">Home</span>
                    </Link>

                    {/* Demo Links Start */}

                    <Link
                        to="/demo/start/server-funcs"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                        activeProps={{
                            className:
                                "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                        }}
                    >
                        <SquareFunction size={20} />
                        <span className="font-medium">
                            Start - Server Functions
                        </span>
                    </Link>

                    <Link
                        to="/demo/start/api-request"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                        activeProps={{
                            className:
                                "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                        }}
                    >
                        <Network size={20} />
                        <span className="font-medium">Start - API Request</span>
                    </Link>

                    <div className="flex flex-row justify-between">
                        <Link
                            to="/demo/start/ssr"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                            activeProps={{
                                className:
                                    "flex-1 flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                            }}
                        >
                            <StickyNote size={20} />
                            <span className="font-medium">
                                Start - SSR Demos
                            </span>
                        </Link>
                        <button
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            onClick={() =>
                                setGroupedExpanded((prev) => ({
                                    ...prev,
                                    StartSSRDemo: !prev.StartSSRDemo,
                                }))
                            }
                        >
                            {groupedExpanded.StartSSRDemo ? (
                                <ChevronDown size={20} />
                            ) : (
                                <ChevronRight size={20} />
                            )}
                        </button>
                    </div>
                    {groupedExpanded.StartSSRDemo && (
                        <div className="flex flex-col ml-4">
                            <Link
                                to="/demo/start/ssr/spa-mode"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                                activeProps={{
                                    className:
                                        "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                                }}
                            >
                                <StickyNote size={20} />
                                <span className="font-medium">SPA Mode</span>
                            </Link>

                            <Link
                                to="/demo/start/ssr/full-ssr"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                                activeProps={{
                                    className:
                                        "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                                }}
                            >
                                <StickyNote size={20} />
                                <span className="font-medium">Full SSR</span>
                            </Link>

                            <Link
                                to="/demo/start/ssr/data-only"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                                activeProps={{
                                    className:
                                        "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                                }}
                            >
                                <StickyNote size={20} />
                                <span className="font-medium">Data Only</span>
                            </Link>
                        </div>
                    )}

                    <Link
                        to="/demo/tanstack-query"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                        activeProps={{
                            className:
                                "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                        }}
                    >
                        <Network size={20} />
                        <span className="font-medium">TanStack Query</span>
                    </Link>

                    {/* Demo Links End */}
                </nav>
            </aside>
        </>
    );
}
