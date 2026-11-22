import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/change-image-aspect-ratio")({
  beforeLoad: () => {
    throw redirect({ to: "/change-image-aspect-ratio", statusCode: 308, replace: true });
  },
});
