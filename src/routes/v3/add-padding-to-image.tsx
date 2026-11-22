import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/add-padding-to-image")({
  beforeLoad: () => {
    throw redirect({ to: "/add-padding-to-image", statusCode: 308, replace: true });
  },
});
