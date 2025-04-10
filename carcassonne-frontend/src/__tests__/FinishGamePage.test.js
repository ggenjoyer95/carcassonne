import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import FinishGamePage from "../components/FinishGamePage";
import { MemoryRouter, Routes, Route } from "react-router-dom";

jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(() => ({ playerId: "1" })),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockGameState = {
  gameId: "test-game",
  scores: {
    1: 10,
    2: 20,
  },
  players: [
    { playerId: "1", name: "Alice" },
    { playerId: "2", name: "Bob" },
  ],
  status: "finished",
};

describe("FinishGamePage component", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders game final state from location.state when provided", () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/finish", state: mockGameState }]}
      >
        <Routes>
          <Route path="/finish" element={<FinishGamePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Игра завершена!/i)).toBeInTheDocument();

    const winnerHeading = screen.getByRole("heading", { name: /Победитель:/i });
    expect(winnerHeading).toHaveTextContent("Победитель: Bob");

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  test("fetches game final state when location.state is missing", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGameState),
      })
    );

    render(
      <MemoryRouter initialEntries={[{ pathname: "/finish", state: null }]}>
        <Routes>
          <Route path="/finish" element={<FinishGamePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Загрузка финального состояния игры/i)
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText(/Игра завершена!/i)).toBeInTheDocument()
    );
  });

  test("navigates to main page when 'На главную' button is clicked", () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/finish", state: mockGameState }]}
      >
        <Routes>
          <Route path="/finish" element={<FinishGamePage />} />
        </Routes>
      </MemoryRouter>
    );

    const mainButton = screen.getByRole("button", { name: /На главную/i });
    fireEvent.click(mainButton);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
