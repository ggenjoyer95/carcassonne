import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateGame from "../components/CreateGame";
import { MemoryRouter } from "react-router-dom";
import Cookies from "js-cookie";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.spyOn(Cookies, "set");

describe("CreateGame component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly with initial state", () => {
    render(
      <MemoryRouter>
        <CreateGame />
      </MemoryRouter>
    );

    expect(screen.getByText(/Создать игру/i)).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("");
    const button = screen.getByRole("button", { name: /Сгенерировать ID/i });
    expect(button).toBeDisabled();
  });

  test("enables the button when a non-empty name is entered", () => {
    render(
      <MemoryRouter>
        <CreateGame />
      </MemoryRouter>
    );

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /Сгенерировать ID/i });
    fireEvent.change(input, { target: { value: "Alice" } });
    expect(input).toHaveValue("Alice");
    expect(button).not.toBeDisabled();
  });

  test("creates game successfully and navigates to lobby", async () => {
    const mockGameId = "test-game";
    const mockToken = "fake-token";

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ gameId: mockGameId }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: mockToken }),
      });

    const localStorageSetItemSpy = jest.spyOn(Storage.prototype, "setItem");

    render(
      <MemoryRouter>
        <CreateGame />
      </MemoryRouter>
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Alice" } });

    const button = screen.getByRole("button", { name: /Сгенерировать ID/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    expect(Cookies.set).toHaveBeenCalledWith(`creator_${mockGameId}`, "true");

    expect(localStorageSetItemSpy).toHaveBeenCalledWith("jwt", mockToken);

    expect(mockNavigate).toHaveBeenCalledWith(`/lobby/${mockGameId}`);
  });

  test("logs error when create game response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ errorMessage: "Ошибка при создании игры" }),
    });

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    render(
      <MemoryRouter>
        <CreateGame />
      </MemoryRouter>
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Alice" } });

    const button = screen.getByRole("button", { name: /Сгенерировать ID/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Ошибка при создании игры");
    });
  });

  test("logs error when join game response is not ok", async () => {
    const mockGameId = "test-game";
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ gameId: mockGameId }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({ errorMessage: "Ошибка при подключении к игре" }),
      });

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    render(
      <MemoryRouter>
        <CreateGame />
      </MemoryRouter>
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Alice" } });
    const button = screen.getByRole("button", { name: /Сгенерировать ID/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Ошибка при подключении к игре"
      );
    });
  });

  test("logs connection error when fetch throws", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    render(
      <MemoryRouter>
        <CreateGame />
      </MemoryRouter>
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Alice" } });
    const button = screen.getByRole("button", { name: /Сгенерировать ID/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Ошибка соединения с сервером:",
        expect.any(Error)
      );
    });
  });
});
