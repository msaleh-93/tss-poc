import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { useTranslation } from "react-i18next";
import PopularDestinations from "./-components/PopularDestinations";
import PopularDestinationsSkeleton from "./-components/PopularDestinationsSkeleton";

import { Card } from "~/components/Card";

export const Route = createFileRoute("/_withSearch/flights")({
    component: RouteComponent,
});

function RouteComponent() {
    const { t } = useTranslation();
    return (
        <div className="flex gap-5">
            <div className="flex flex-col flex-1 gap-5">
                <Outlet />
            </div>
            <Card className="w-sm h-fit flex-col justify-start items-stretch font-bold">
                <h2
                    dir="auto"
                    className="p-2 text-2xl border-b border-zinc-300 dark:border-zinc-600"
                >
                    {t("popular destinations")}
                </h2>
                <Suspense fallback={<PopularDestinationsSkeleton />}>
                    <PopularDestinations />
                </Suspense>
            </Card>
        </div>
    );
}
