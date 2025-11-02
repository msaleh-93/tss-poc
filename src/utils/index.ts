import classnames from "classnames";
import { twMerge } from "tailwind-merge";

export function cn(...args: Parameters<typeof classnames>) {
    return twMerge(classnames(...args));
}

export function cachedGetter<T>(fn: () => T) {
    let instance: T;
    return () => {
        if (!instance) instance = fn();
        return instance;
    };
}
