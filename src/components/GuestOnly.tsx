import type { ReactNode } from "react";
import { useAuth } from "~/hooks/auth";

interface Props {
    children: ReactNode;
}

export function GuestOnly({ children }: Props) {
    const {
        data: { isAuthenticated },
    } = useAuth();

    return isAuthenticated ? null : children;
}
