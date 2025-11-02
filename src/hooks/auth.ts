import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useFnRef } from "./utils";

import type { AuthStatus } from "~/api/auth";
import { authQueries } from "~/api/auth";

export function useOnAuthChange(fn: (status: AuthStatus) => void) {
    const {
        data,
        data: { isAuthenticated },
    } = useAuth();
    const wasAuthenticated = useRef(isAuthenticated);
    const onChange = useFnRef(fn);

    useEffect(() => {
        if (wasAuthenticated.current === isAuthenticated) return;
        wasAuthenticated.current = isAuthenticated;
        onChange(data);
    }, [isAuthenticated]);
}

export function useAuth() {
    return useSuspenseQuery(authQueries.user());
}
