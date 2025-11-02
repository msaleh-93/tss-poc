import { Outlet, createFileRoute } from "@tanstack/react-router";
import FlightForm from "~/components/FlightForm";

export const Route = createFileRoute("/_withSearch")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <main className="p-10 flex flex-col gap-5">
            <FlightForm />
            <Outlet />
        </main>
    );
}
