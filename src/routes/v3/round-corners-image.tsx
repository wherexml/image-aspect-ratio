import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/round-corners-image")({
  beforeLoad: () => {
    throw redirect({ to: "/round-corners-image", statusCode: 308, replace: true });
  },
});
