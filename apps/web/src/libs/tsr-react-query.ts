import { initTsrReactQuery } from "@ts-rest/react-query/v5";
import { contract } from "@repo/contracts";

export const api = initTsrReactQuery(contract, {
  baseUrl: import.meta.env.VITE_BASE_URL,
  baseHeaders: {},
});
