import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/v3/calculator")({
  beforeLoad: () => {
    throw redirect({ to: "/calculator", statusCode: 308, replace: true });
  },
});
