import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import FlightsSkeleton from "./-components/FlightsSkeleton";

import { fetchFlights } from "~/api/flights";
import Button from "~/components/Button";
import { Card } from "~/components/Card";

export const Route = createFileRoute("/_withSearch/flights/")({
    validateSearch(data) {
        if (!data.from) throw new Error("Departure airport is missing");
        if (!data.to) throw new Error("Arrival airport is missing");
        return data as { from: string; to: string; date?: string };
    },
    beforeLoad({ search: { from, to, date } }) {
        return {
            pageTitle: `Flights from "${from}" to "${to}"${date ? "on " + date : ""}`,
        };
    },
    loaderDeps({ search: { from, to, date } }) {
        return { from, to, date };
    },
    async loader({ deps }) {
        const flights = await fetchFlights({ data: deps });
        if (!flights.length) throw notFound();
        return flights;
    },
    head: ({ match }) => ({
        meta: [{ title: match.context.pageTitle }],
    }),
    pendingMs: 200,
    pendingComponent: FlightsSkeleton,
    notFoundComponent() {
        const { t } = useTranslation();
        return (
            <h2 className="text-xl text-red-600">
                {t("no flights were found")}
            </h2>
        );
    },
    errorComponent({ error }) {
        const { t } = useTranslation();
        return (
            <h2 className="text-xl text-red-600">
                {t("something went wrong")}: {error.message}
            </h2>
        );
    },
    component: RouteComponent,
});

function RouteComponent() {
    const data = Route.useLoaderData();
    const { t } = useTranslation();
    return data.map((flight) => (
        <Card key={flight.id}>
            <div>
                <h3 className="text-lg font-semibold">
                    {flight.segments[0].airline.name} Flight{" "}
                    {flight.segments[0].flightNumber}
                </h3>
                <div className="flex gap-5">
                    <p dir="auto" className="w-20 font-bold">
                        {t("departure")}
                        {": "}
                    </p>
                    <p dir="auto" className="w-50">
                        {new Date(
                            flight.segments[0].departure.dateTime,
                        ).toLocaleString()}
                    </p>
                    <p
                        dir="auto"
                        className="text-indigo-700 dark:text-indigo-300 font-semibold"
                    >
                        {flight.segments[0].departure.airport.name}
                    </p>
                </div>
                <div className="flex gap-5">
                    <p dir="auto" className="w-20 font-bold">
                        {t("arrival")}
                        {": "}
                    </p>
                    <p dir="auto" className="w-50">
                        {new Date(
                            flight.segments[0].arrival.dateTime,
                        ).toLocaleString()}
                    </p>
                    <p
                        dir="auto"
                        className="text-indigo-700 dark:text-indigo-300 font-semibold"
                    >
                        {flight.segments[0].arrival.airport.name}
                    </p>
                </div>
            </div>
            <div>
                <p dir="auto" className="mb-1 text-xl text-center font-bold">
                    ${flight.prices.economy}
                </p>
                <Link to="/payment/$flightId" params={{ flightId: flight.id }}>
                    <Button label={t("book")} small />
                </Link>
            </div>
        </Card>
    ));
}
