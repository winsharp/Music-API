// Vitest global setup (wired up via vite.config.ts's `test.setupFiles`):
// starts the MSW mock server before any tests run, resets any per-test
// `server.use(...)` overrides after each test so they don't leak into the
// next one, and shuts the server down once the whole suite finishes.
import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());