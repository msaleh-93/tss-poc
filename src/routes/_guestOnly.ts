import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_guestOnly")({
    validateSearch(data) {
        return data as { refUrl?: string };
    },
    beforeLoad({ context, search }) {
        if (context.authStatus.isAuthenticated)
            throw redirect({ to: search.refUrl || "/", replace: true });
    },
});
