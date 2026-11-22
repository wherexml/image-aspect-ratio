import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/fit-photo-to-instagram")({
  beforeLoad: () => {
    throw redirect({ to: "/fit-photo-to-instagram", statusCode: 308, replace: true });
  },
});
