import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { flightQueries } from "~/api/flights";
import Button from "~/components/Button";
import i18n from "~/lib/i18n";

export const Route = createFileRoute("/_userOnly/payment/$flightId")({
    beforeLoad({ params: { flightId } }) {
        return { pageTitle: `${i18n.t("flight options for")} "${flightId}"` };
    },
    async loader({ context, params: { flightId } }) {
        const flight = await context.queryClient.ensureQueryData(
            flightQueries.flightDetails(flightId),
        );

        if (!flight) throw redirect({ to: "..", replace: true });
        return { prices: flight.prices };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { prices } = Route.useLoaderData();

    const options = useMemo(() => {
        const result = Object.entries(prices).map(([type, price]) => ({
            type,
            price,
        }));
        result.sort((a, b) => a.price - b.price);
        return result;
    }, [prices]);

    const [selected, setSelected] = useState<string>();
    const { t } = useTranslation();

    return (
        <main className="w-screen h-[calc(100vh-4rem)] bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center">
            <div className="p-5 bg-white dark:bg-zinc-800 rounded-lg  flex flex-col gap-5 shadow-md">
                {options.map(({ type, price }) => (
                    <div
                        className="py-2 border-b border-zinc-300 flex gap-10 items-center"
                        key={type}
                    >
                        <h3 className="w-40 font-bold capitalize">
                            {t(type as any)}
                        </h3>
                        <p className="w-16">${price}</p>
                        <Button
                            label={t("select")}
                            small
                            color={"success"}
                            outlined={selected !== type}
                            onClick={() => setSelected(type)}
                        />
                    </div>
                ))}
                <Button label={t("pay")} disabled={!selected} />
            </div>
        </main>
    );
}
