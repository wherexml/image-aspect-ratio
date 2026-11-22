import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/video-aspect-ratio")({
  beforeLoad: () => {
    throw redirect({ to: "/video-aspect-ratio", statusCode: 308, replace: true });
  },
});
