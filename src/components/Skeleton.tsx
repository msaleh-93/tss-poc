import { cn } from "~/utils";

interface Props {
    className?: string;
}

export default function Skeleton({ className }: Props) {
    return (
        <div
            className={cn(
                "bg-zinc-200 dark:bg-zinc-700 rounded-md animate-pulse",
                className,
            )}
        ></div>
    );
}
