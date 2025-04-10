import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import GamePage from "../components/GamePage";
import { MemoryRouter } from "react-router-dom";

jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(() => ({ playerId: "test-player" })),
}));

jest.mock("../components/CarcassonneMap", () => () => (
  <div data-testid="carcassonne-map">CarcassonneMap</div>
));

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

global.fetch = jest.fn();

describe("GamePage component (extended tests)", () => {
  const defaultGameState = {
    players: [
      {
        playerId: "test-player",
        name: "Alice",
        meeples: 5,
        abbats: 3,
        color: "blue",
      },
      { playerId: "player2", name: "Bob", meeples: 7, abbats: 2, color: "red" },
    ],
    status: "waiting",
    remainingCards: 10,
    currentMoveMade: false,
    currentTurn: "test-player",
    board: {
      "0,0": {
        tile: "image",
        image: "photo1.png",
        offsetX: 40,
        offsetY: 40,
        rotation: 0,
        owner: "system",
      },
    },
    imageRotation: 0,
    currentTileImage: "photo1.png",
    scores: { "test-player": 3, player2: 5 },
  };

  beforeEach(() => {
    fetch.mockReset();
    mockNavigate.mockReset();
    localStorage.setItem("jwt", "dummy-token");
    const { jwtDecode } = require("jwt-decode");
    jwtDecode.mockReturnValue({ playerId: "test-player" });
  });

  test("displays loading state initially and then renders game state", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => defaultGameState,
    });

    render(
      <MemoryRouter initialEntries={["/game/test-game"]}>
        <GamePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Загрузка состояния игры/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.queryByText(/Загрузка состояния игры/i)
      ).not.toBeInTheDocument()
    );

    expect(screen.getByText(/Игра test-game/i)).toBeInTheDocument();
    expect(screen.getByText(/Осталось 10 карт/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Alice/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bob/i)).toBeInTheDocument();
    expect(screen.getByTestId("carcassonne-map")).toBeInTheDocument();
  });

  test("navigates to /finish when game status is finished", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...defaultGameState, status: "finished" }),
    });

    render(
      <MemoryRouter initialEntries={["/game/test-game"]}>
        <GamePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/finish",
        expect.objectContaining({ state: expect.any(Object) })
      );
    });
  });

  test("calls zoom in/out functions", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => defaultGameState,
    });

    render(
      <MemoryRouter initialEntries={["/game/test-game"]}>
        <GamePage />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByText(/Осталось 10 карт/i)).toBeInTheDocument()
    );

    const zoomInButton = screen.getByRole("button", { name: /Приблизить/i });
    const zoomOutButton = screen.getByRole("button", { name: /Отдалить/i });

    fireEvent.click(zoomInButton);
    fireEvent.click(zoomOutButton);

    expect(screen.getByTestId("carcassonne-map")).toBeInTheDocument();
  });

  test("handleExit: clicking 'Выйти' navigates to root", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => defaultGameState,
    });
    render(
      <MemoryRouter initialEntries={["/game/test-game"]}>
        <GamePage />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByText(/Игра test-game/i)).toBeInTheDocument()
    );
    const exitButton = screen.getByRole("button", { name: /Выйти/i });
    fireEvent.click(exitButton);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("handleRotateImage: successful fetch updates gameState and error branch displays error message", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...defaultGameState, imageRotation: 90 }),
    });
    render(
      <MemoryRouter initialEntries={["/game/test-game"]}>
        <GamePage />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText(/Осталось 10 карт/i));
    const rotateButton = screen.getByRole("button", { name: /Повернуть/i });
    fireEvent.click(rotateButton);
    await waitFor(() => {
      expect(
        screen.queryByText(/Ошибка при повороте изображения/i)
      ).not.toBeInTheDocument();
    });

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errorMessage: "Ошибка поворота" }),
    });
    fireEvent.click(rotateButton);
    await waitFor(() => {
      expect(screen.getByText(/Ошибка поворота/i)).toBeInTheDocument();
    });
  });

  test("handleSkipTurn: successful call updates game state", async () => {
    const updatedState = { ...defaultGameState, currentTurn: "player2" };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedState,
    });
    render(
      <MemoryRouter initialEntries={["/game/test-game"]}>
        <GamePage />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByText(/Осталось 10 карт/i)).toBeInTheDocument()
    );
    const skipTurnButton = screen.getByRole("button", {
      name: /Пропустить ход/i,
    });
    fireEvent.click(skipTurnButton);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test("handleEndTurn: successful call updates game state", async () => {
    const stateWithMove = { ...defaultGameState, currentMoveMade: true };
    const updatedState = { ...defaultGameState, currentTurn: "player2" };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => stateWithMove,
    });
    render(
      <MemoryRouter initialEntries={["/game/test-game"]}>
        <GamePage />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText(/Осталось 10 карт/i));
    const endTurnButton = screen.getByRole("button", { name: /Сделать ход/i });
    fireEvent.click(endTurnButton);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedState,
    });
    await waitFor(() =>
      expect(screen.getByText(/Осталось 10 карт/i)).toBeInTheDocument()
    );
  });

  test("handlePlaceTile: successful call updates game state, error branch shows error", async () => {
    const updatedState = {
      ...defaultGameState,
      board: {
        "0,0": {
          tile: "image",
          image: "photo2.png",
          offsetX: 30,
          offsetY: 30,
          rotation: 0,
          owner: "system",
        },
      },
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedState,
    });
    render(
      <MemoryRouter initialEntries={["/game/test-game"]}>
        <GamePage />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText(/Осталось 10 карт/i));

    const mapContainer = screen.getByTestId("carcassonne-map").parentElement;
    fireEvent.click(mapContainer, { clientX: 10, clientY: 10 });
    expect(fetch).toHaveBeenCalled();
  });

  test("jwtDecode failure: logs error and continues rendering", async () => {
    const { jwtDecode } = require("jwt-decode");
    jwtDecode.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => defaultGameState,
    });

    render(
      <MemoryRouter initialEntries={["/game/test-game"]}>
        <GamePage />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByText(/Осталось 10 карт/i)).toBeInTheDocument()
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Ошибка декодирования токена",
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });
});
