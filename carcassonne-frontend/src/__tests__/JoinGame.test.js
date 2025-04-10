import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JoinGame from "../components/JoinGame";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

beforeEach(() => {
  mockedUsedNavigate.mockReset();
  localStorage.clear();
});

const originalFetch = global.fetch;

describe("JoinGame component (обновлённые тесты)", () => {
  test("renders the join game form without errors", () => {
    render(
      <MemoryRouter>
        <JoinGame />
      </MemoryRouter>
    );

    expect(screen.getByText(/Присоединение к игре/i)).toBeInTheDocument();

    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThanOrEqual(2);

    expect(
      screen.getByRole("button", { name: /Присоединиться/i })
    ).toBeInTheDocument();
  });

  test("submits the form successfully and navigates to lobby", async () => {
    const fakeToken = "fake-jwt-token";
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ token: fakeToken }),
      })
    );

    render(
      <MemoryRouter>
        <JoinGame />
      </MemoryRouter>
    );

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "TESTGAME" } });
    fireEvent.change(inputs[1], { target: { value: "TestPlayer" } });

    const formButton = screen.getByRole("button", { name: /Присоединиться/i });
    fireEvent.click(formButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/game/TESTGAME/join`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: "1234", playerName: "TestPlayer" }),
        })
      );
    });

    expect(localStorage.getItem("jwt")).toBe(fakeToken);
    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/lobby/TESTGAME`);

    global.fetch = originalFetch;
  });

  test("displays an error message when fetch response is not OK", async () => {
    const errorMessage = "Game not found";
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ errorMessage }),
      })
    );

    render(
      <MemoryRouter>
        <JoinGame />
      </MemoryRouter>
    );

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "NONEXISTENT" } });
    fireEvent.change(inputs[1], { target: { value: "TestPlayer" } });

    const formButton = screen.getByRole("button", { name: /Присоединиться/i });
    fireEvent.click(formButton);

    const errorText = await screen.findByText(
      new RegExp(`Ошибка: ${errorMessage}`, "i")
    );
    expect(errorText).toBeInTheDocument();
    expect(mockedUsedNavigate).not.toHaveBeenCalled();

    global.fetch = originalFetch;
  });

  test("displays a connection error message when fetch throws an exception", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network Error")));

    render(
      <MemoryRouter>
        <JoinGame />
      </MemoryRouter>
    );

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "ANYGAME" } });
    fireEvent.change(inputs[1], { target: { value: "TestPlayer" } });

    const formButton = screen.getByRole("button", { name: /Присоединиться/i });
    fireEvent.click(formButton);

    const errorText = await screen.findByText(/Ошибка соединения с сервером/i);
    expect(errorText).toBeInTheDocument();
    expect(mockedUsedNavigate).not.toHaveBeenCalled();

    global.fetch = originalFetch;
  });
});
