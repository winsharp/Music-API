import { describe, it, expect } from "vitest";
import { AxiosError } from "axios";
import { getApiErrorMessage } from "./getApiErrorMessage";

const axiosErrorWithStatus = (status: number, data?: unknown) =>
    new AxiosError("failed", undefined, undefined, undefined, {
        status,
        data,
        statusText: "",
        headers: {},
        // @ts-expect-error - minimal fake config, not used by getApiErrorMessage
        config: {},
    });

describe("getApiErrorMessage", () => {
    it("returns a network message when there is no response", () => {
        const err = new AxiosError("Network Error");
        expect(getApiErrorMessage(err)).toMatch(/couldn't reach discogs/i);
    });

    it("returns an auth message on 401", () => {
        expect(getApiErrorMessage(axiosErrorWithStatus(401))).toMatch(/token may be missing or invalid/i);
    });

    it("returns a not-found message on 404", () => {
        expect(getApiErrorMessage(axiosErrorWithStatus(404))).toMatch(/couldn't be found/i);
    });

    it("returns a rate-limit message on 429", () => {
        expect(getApiErrorMessage(axiosErrorWithStatus(429))).toMatch(/rate limit/i);
    });

    it("returns a server error message on 500, including the Discogs message when present", () => {
        expect(getApiErrorMessage(axiosErrorWithStatus(500, { message: "oops" }))).toBe("Discogs server error: oops");
        expect(getApiErrorMessage(axiosErrorWithStatus(500))).toMatch(/server issues/i);
    });

    it("returns a generic message for other statuses and non-axios errors", () => {
        expect(getApiErrorMessage(axiosErrorWithStatus(418))).toMatch(/went wrong/i);
        expect(getApiErrorMessage(new Error("boom"))).toMatch(/went wrong/i);
    });
});
