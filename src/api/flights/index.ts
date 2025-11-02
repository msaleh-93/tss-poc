import { queryOptions } from "@tanstack/react-query";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

import { FlightBookingAPI } from "./factory";

import { cachedGetter } from "~/utils";

const getApi = createServerOnlyFn(cachedGetter(() => new FlightBookingAPI()));

export const fetchFlights = createServerFn()
    .inputValidator(
        (data) =>
            data as {
                from: string;
                to: string;
                date?: string;
            },
    )
    .handler(async ({ data: { from, to, date } }) => {
        return await getApi().searchFlights({
            origin: from,
            destination: to,
            departureDate: date || "",
            passengers: { adults: 1, children: 0, infants: 0 },
            cabinClass: "economy",
            directOnly: true,
        });
    });

export const flightDetails = createServerFn()
    .inputValidator((data) => data as string)
    .handler(async ({ data }) => {
        return await getApi().getFlightDetails(data);
    });

export const fetchPopularDestinations = createServerFn().handler(async () => {
    return await getApi().getPopularDestinations();
});

export const flightQueries = {
    all: ["flights"],
    flightDetails(id: string) {
        return queryOptions({
            queryKey: [...this.all, id],
            queryFn: () => flightDetails({ data: id }),
        });
    },
    popularDestinations() {
        return queryOptions({
            queryKey: [...this.all, "popular-destinations"],
            queryFn: fetchPopularDestinations,
        });
    },
};
