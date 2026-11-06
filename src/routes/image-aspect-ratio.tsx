import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL: the image checker now lives at /. Server entry also answers with a 308.
export const Route = createFileRoute("/image-aspect-ratio")({
  beforeLoad: () => { throw redirect({ to: "/", statusCode: 308 }); },
});
