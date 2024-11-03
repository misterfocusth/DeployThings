import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { api } from "../lib/tsr-react-query";
import { FC } from "react";

export const Route = createRootRoute({
  component: () => <Root />,
});

const Root: FC = () => {
  const { data, isPending } = api.post.getPost.useQuery({
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
      <div className=" sticky top-0 bg-white">
        <div className="p-5 flex gap-5 text-lg">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>{" "}
          <Link to="/project" className="[&.active]:font-bold">
            Projects
          </Link>
        </div>
        <hr />
      </div>
      <Outlet/>
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
};
