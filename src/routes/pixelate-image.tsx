import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/pixelate-image")({
  beforeLoad: () => {
    throw redirect({ to: "/blur-screenshot", statusCode: 308, replace: true });
  },
});
