import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** The MSW mock server used by every test, started/stopped by `setup.ts`. */
export const server = setupServer(...handlers);