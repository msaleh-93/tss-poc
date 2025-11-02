import { useRef } from "react";

export function useFnRef<T extends (...args: Array<any>) => any>(fn: T) {
    const ref = useRef(fn);
    ref.current = fn;
    return useRef((...args: Parameters<T>) =>
        ref.current.apply(ref.current, args),
    ).current as T;
}
