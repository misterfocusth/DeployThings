import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: About,
});

function About() {
  return <div className="p-2">Hello from Home!</div>;
}
