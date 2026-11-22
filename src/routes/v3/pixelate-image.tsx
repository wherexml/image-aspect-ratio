import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/pixelate-image")({
  beforeLoad: () => {
    throw redirect({ to: "/blur-screenshot", statusCode: 308, replace: true });
  },
});
