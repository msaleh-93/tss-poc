type TargetEventPairs = [
    [Window, WindowEventMap],
    [Document, DocumentEventMap],
    [HTMLElement, HTMLElementEventMap],
    [MediaQueryList, MediaQueryListEventMap],
    [MediaRecorder, MediaRecorderEventMap],
];

type EventMap<T, TList = TargetEventPairs> = TList extends [
    infer Head,
    ...infer Tail,
]
    ? Head extends [infer Target, infer Map]
        ? T extends Target
            ? Map
            : EventMap<T, Tail>
        : never
    : never;

type EventsSub<T> = { (): void } & {
    [Key in keyof EventMap<T>]: (
        listener: (evt: EventMap<T>[Key]) => void,
        options?: AddEventListenerOptions,
    ) => EventsSub<T>;
};

export function eventsSub<T extends TargetEventPairs[number][0]>(target: T) {
    const controller = new AbortController();
    const proxy = new Proxy(
        controller.abort.bind(
            controller,
            new Error("Unsubscribed"),
        ) as EventsSub<T>,
        {
            get(_, type: string) {
                controller.signal.throwIfAborted();
                return (
                    listener: (evt: unknown) => void,
                    { signal, ...options }: AddEventListenerOptions = {},
                ) => {
                    target.addEventListener(type, listener, {
                        signal: signal
                            ? AbortSignal.any([controller.signal, signal])
                            : controller.signal,
                        ...options,
                    });
                    return proxy;
                };
            },
        },
    );
    return proxy;
}
