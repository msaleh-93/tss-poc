import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default {
    getContext() {
        const queryClient = new QueryClient();
        return { queryClient };
    },
    Provider({
        children,
        queryClient,
    }: {
        children: React.ReactNode;
        queryClient: QueryClient;
    }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    },
};
