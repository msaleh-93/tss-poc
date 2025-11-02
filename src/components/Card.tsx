import type { ReactNode } from "react";
import { cn } from "~/utils";

interface Props {
    className?: string;
    children: ReactNode;
}

export function Card({ className, children }: Props) {
    return (
        <div
            className={cn(
                "p-4 border border-zinc-200 dark:border-zinc-600 rounded-md shadow-md flex justify-between items-end gap-5",
                className,
            )}
        >
            {children}
        </div>
    );
}
