import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/make-image-square")({
  beforeLoad: () => {
    throw redirect({ to: "/make-image-square", statusCode: 308, replace: true });
  },
});
