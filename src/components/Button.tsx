import { cn } from "~/utils";

const COLOR_MAP = {
    filled: {
        primary: "bg-indigo-600 text-white",
        secondary: "bg-white text-indigo-600",
        danger: "bg-red-600 text-white",
        success: "bg-green-600 text-white",
    },
    outlined: {
        primary: "border-indigo-600 text-indigo-600",
        secondary: "border-white text-white",
        danger: "border-red-600 text-red-600",
        success: "border-green-600 text-green-600",
    },
};

interface Props {
    label: string;
    type?: "submit" | "reset" | "button";
    disabled?: boolean;
    className?: string;
    small?: boolean;
    outlined?: boolean;
    color?: "primary" | "secondary" | "danger" | "success";
    onClick?: () => void;
}

export default function Button({
    label,
    type,
    disabled,
    className,
    small,
    outlined,
    color = "primary",
    onClick,
}: Props) {
    return (
        <button
            className={cn(
                "px-4 border-2 font-bold rounded-md not-disabled:cursor-pointer disabled:border-zinc-400",
                outlined ? "disabled:text-zinc-400" : "disabled:text-white",
                small ? "h-9" : "h-10",
                COLOR_MAP.outlined[color],
                {
                    [COLOR_MAP.filled[color]]: !outlined,
                    "disabled:bg-zinc-400": !outlined,
                },
                className,
            )}
            type={type}
            disabled={disabled}
            onClick={onClick}
        >
            {label}
        </button>
    );
}
