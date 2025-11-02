import { TanStackDevtools } from "@tanstack/react-devtools";
import {
    HeadContent,
    Scripts,
    createRootRouteWithContext,
    useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import type { QueryClient } from "@tanstack/react-query";

import { authQueries } from "~/api/auth";
import Header from "~/components/Header";
import { useOnAuthChange } from "~/hooks/auth";
import { useOnLanguageChange } from "~/hooks/language";
import i18n, { setSSRLanguage } from "~/lib/i18n";
import TanStackQueryDevtools from "~/lib/tanstack-query/devtools";
import { ThemeScript } from "~/lib/theme";
import appCss from "~/styles.css?url";

interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    async beforeLoad({ context }) {
        const [authStatus] = await Promise.allSettled([
            context.queryClient.ensureQueryData(authQueries.user()),
            setSSRLanguage(),
        ]);

        if (authStatus.status === "rejected")
            throw new Error(authStatus.reason);

        return { authStatus: authStatus.value };
    },
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title: i18n.t("fly akeed") },
        ],
        links: [{ rel: "stylesheet", href: appCss }],
    }),
    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    useOnAuthChange(() => {
        console.log("useOnAuthChange:router.invalidate()");
        router.invalidate();
    });

    useOnLanguageChange(() => {
        console.log("useOnLanguageChange:router.invalidate()");
        router.invalidate();
    });

    return (
        <html lang={i18n.language} dir={i18n.dir()} suppressHydrationWarning>
            <head>
                <HeadContent />
                <ThemeScript />
            </head>
            <body className="dark:bg-zinc-800 dark:text-white dark:scheme-dark">
                <Header />
                {children}

                <TanStackDevtools
                    config={{
                        position: "bottom-right",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                        TanStackQueryDevtools,
                    ]}
                />
                <Scripts />
            </body>
        </html>
    );
}
