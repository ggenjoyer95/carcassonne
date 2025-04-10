import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import LobbyPage from "../components/LobbyPage";
import { MemoryRouter } from "react-router-dom";
import Cookies from "js-cookie";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({ gameId: "test-game" }),
    useNavigate: () => mockNavigate,
  };
});

jest.spyOn(Cookies, "get").mockImplementation((key) => {
  if (key === "creator_test-game") return "true";
  return "";
});

global.fetch = jest.fn();

describe("LobbyPage component", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  test("renders the lobby page and displays a list of players", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        players: [{ playerId: "1", name: "Alice" }],
        status: "waiting",
      }),
    });

    render(
      <MemoryRouter initialEntries={["/lobby/test-game"]}>
        <LobbyPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Лобби игры: test-game/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Alice/i)).toBeInTheDocument();
    });
  });

  test("navigates to /game/test-game if the game status is active", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: [], status: "active" }),
    });

    render(
      <MemoryRouter initialEntries={["/lobby/test-game"]}>
        <LobbyPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/game/test-game");
    });
  });

  test("handles leaving the lobby and navigates to the root", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          players: [{ playerId: "1", name: "Alice" }],
          status: "waiting",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    render(
      <MemoryRouter initialEntries={["/lobby/test-game"]}>
        <LobbyPage />
      </MemoryRouter>
    );

    const leaveButton = screen.getByRole("button", { name: /Выйти из лобби/i });
    fireEvent.click(leaveButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
