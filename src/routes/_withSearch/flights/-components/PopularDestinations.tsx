import { useSuspenseQuery } from "@tanstack/react-query";
import { flightQueries } from "~/api/flights";

export default function PopularDestinations() {
    const { data } = useSuspenseQuery(flightQueries.popularDestinations());
    return data.map(({ code, city, country, name }) => (
        <div
            key={code}
            className="p-2 border-b border-zinc-200 dark:border-zinc-600"
        >
            <h3 dir="auto" className="text-xl">
                {city}
            </h3>
            <h4 dir="auto" className="text-lg">
                {name}
            </h4>
            <h5
                dir="auto"
                className="text-sm text-indigo-700 dark:text-indigo-300"
            >
                {country}
            </h5>
        </div>
    ));
}
