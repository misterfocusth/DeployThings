import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { api } from "../libs/tsr-react-query";
import { FC } from "react";

export const Route = createRootRoute({
  component: () => <Root />,
});

const Root: FC = () => {
  const { data, isPending } = api.getPost.useQuery({
    queryData: {
      params: {
        id: "1",
      },
    },
    queryKey: ["post", "1"],
  });

  if (isPending) {
    console.log("Loading...");
  }

  if (data?.status !== 200) {
    console.log("Error");
  }

  return (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
      </div>
      <hr />

      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
};
