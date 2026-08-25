import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RateAndCollect from "./RateAndCollect";
import { useAuth } from "../contexts/AuthContext";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import { releaseCollectionService } from "../services/releaseCollectionService";
import type { DiscogsConnection } from "../types/discogsOAuth";

vi.mock("../contexts/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../services/discogsAuthStorage", () => ({
    discogsAuthStorage: {
        getConnection: vi.fn(),
    },
}));

vi.mock("../services/releaseCollectionService", () => ({
    releaseCollectionService: {
        addToCollection: vi.fn(),
        rateRelease: vi.fn(),
    },
}));

const mockUser = { id: "user-1", username: "jdoe", email: "jdoe@example.com" };
const mockConnection: DiscogsConnection = {
    discogsUsername: "jdoe-discogs",
    oauthToken: "fake-token",
    oauthTokenSecret: "fake-secret",
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("RateAndCollect", () => {
    it("renders nothing when the user is not logged in", () => {
        vi.mocked(useAuth).mockReturnValue({ user: null, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
        const { container } = render(<RateAndCollect releaseId={123} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("prompts to connect Discogs when logged in but not connected", () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(null);

        render(<RateAndCollect releaseId={123} />);
        expect(screen.getByText(/connect your discogs account/i)).toBeInTheDocument();
    });

    it("shows a 'Save to Collection' button when not yet in the collection", () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);

        render(<RateAndCollect releaseId={123} />);
        expect(screen.getByRole("button", { name: /save to collection/i })).toBeInTheDocument();
    });

    it("shows star buttons immediately when existingEntry is provided", () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);

        render(<RateAndCollect releaseId={123} existingEntry={{ instance_id: 999, rating: 3 }} />);
        expect(screen.queryByRole("button", { name: /save to collection/i })).not.toBeInTheDocument();
        // 3 filled stars, 2 empty — 5 buttons total either way
        expect(screen.getAllByRole("button")).toHaveLength(5);
    });

    it("adds to collection and reveals star buttons after a successful save", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);
        vi.mocked(releaseCollectionService.addToCollection).mockResolvedValue({ instance_id: 555 });

        render(<RateAndCollect releaseId={123} />);
        await userEvent.click(screen.getByRole("button", { name: /save to collection/i }));

        expect(releaseCollectionService.addToCollection).toHaveBeenCalledWith(mockConnection, 123);
        expect(await screen.findAllByRole("button")).toHaveLength(5);
    });

    it("shows an error message when adding to the collection fails", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);
        vi.mocked(releaseCollectionService.addToCollection).mockRejectedValue(new Error("fail"));

        render(<RateAndCollect releaseId={123} />);
        await userEvent.click(screen.getByRole("button", { name: /save to collection/i }));

        expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("rates the release when a star is clicked", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);
        vi.mocked(releaseCollectionService.rateRelease).mockResolvedValue(undefined);

        render(<RateAndCollect releaseId={123} existingEntry={{ instance_id: 555, rating: 0 }} />);
        const stars = screen.getAllByRole("button");
        await userEvent.click(stars[3]); // 4th star = rating of 4

        expect(releaseCollectionService.rateRelease).toHaveBeenCalledWith(mockConnection, 123, 555, 4);
    });
});