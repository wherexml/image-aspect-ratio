import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/og-image-safe-zone")({
  beforeLoad: () => {
    throw redirect({ to: "/og-image-safe-zone", statusCode: 308, replace: true });
  },
});
