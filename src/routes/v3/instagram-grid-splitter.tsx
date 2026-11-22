import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/instagram-grid-splitter")({
  beforeLoad: () => {
    throw redirect({ to: "/instagram-grid-splitter", statusCode: 308, replace: true });
  },
});
