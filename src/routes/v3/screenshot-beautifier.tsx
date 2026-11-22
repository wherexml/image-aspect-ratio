import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/screenshot-beautifier")({
  beforeLoad: () => {
    throw redirect({ to: "/screenshot-beautifier", statusCode: 308, replace: true });
  },
});
