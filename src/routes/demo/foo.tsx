import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/foo")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/demo/foo"!</div>;
}
