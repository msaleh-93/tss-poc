import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import "~/lib/i18n";
import TanstackQuery from "~/lib/tanstack-query/root-provider";
import { routeTree } from "~/routeTree.gen";

// Create a new router instance
export function getRouter() {
    const rqContext = TanstackQuery.getContext();

    const router = createRouter({
        routeTree,
        context: { ...rqContext },
        defaultPreload: "intent",
        Wrap: (props: { children: React.ReactNode }) => {
            return (
                <TanstackQuery.Provider {...rqContext}>
                    {props.children}
                </TanstackQuery.Provider>
            );
        },
    });
    setupRouterSsrQueryIntegration({
        router,
        queryClient: rqContext.queryClient,
    });

    return router;
}
