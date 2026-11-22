import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/safe-zone-checker")({
  beforeLoad: () => {
    throw redirect({ to: "/safe-zone-checker", statusCode: 308, replace: true });
  },
});
