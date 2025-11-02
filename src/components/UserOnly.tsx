import type { ReactNode } from "react";
import { useAuth } from "~/hooks/auth";

interface Props {
    children: ReactNode;
}

export function UserOnly({ children }: Props) {
    const {
        data: { isAuthenticated },
    } = useAuth();

    return isAuthenticated ? children : null;
}
