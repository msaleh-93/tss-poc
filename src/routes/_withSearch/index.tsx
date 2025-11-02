import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";

export const Route = createFileRoute("/_withSearch/")({
    beforeLoad() {
        return { pageTitle: i18n.t("search flights") };
    },
    head: ({ match }) => ({
        meta: [{ title: match.context.pageTitle }],
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const { t } = useTranslation();
    return (
        <div className="p-5">
            <h2 className="text-2xl text-center font-bold">
                {t("promotion material")}
            </h2>
        </div>
    );
}
