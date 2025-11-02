import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";

import { authQueries, signIn } from "~/api/auth";
import Button from "~/components/Button";
import Field from "~/components/Field";
import i18n from "~/lib/i18n";

export const Route = createFileRoute("/_guestOnly/sign-in")({
    beforeLoad() {
        return { pageTitle: i18n.t("sign in") };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const queryClient = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: useServerFn(signIn),
        onSuccess() {
            queryClient.invalidateQueries(authQueries.user());
        },
    });

    const { t } = useTranslation();

    return (
        <main className="w-screen h-[calc(100vh-4rem)] bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center">
            <form
                className="p-5 bg-white dark:bg-zinc-800 rounded-lg flex gap-5 items-end shadow-md"
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get("name");
                    if (name) mutate({ data: name });
                }}
            >
                <Field label={t("user name")} name="name" />
                <Button label={t("sign in")} />
            </form>
        </main>
    );
}
