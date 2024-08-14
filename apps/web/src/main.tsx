import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

// React Router
import { RouterProvider, createRouter } from "@tanstack/react-router";

// TS-Rest React Query
import { api } from "./libs/tsr-react-query";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <api.ReactQueryProvider>
        <RouterProvider router={router} />
      </api.ReactQueryProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
