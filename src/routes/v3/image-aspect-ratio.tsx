import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/image-aspect-ratio")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 308, replace: true });
  },
});
