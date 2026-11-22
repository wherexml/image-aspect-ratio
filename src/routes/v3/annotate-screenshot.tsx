import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/annotate-screenshot")({
  beforeLoad: () => {
    throw redirect({ to: "/annotate-screenshot", statusCode: 308, replace: true });
  },
});
