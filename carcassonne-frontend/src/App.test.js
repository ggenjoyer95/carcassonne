import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders loading game data message", () => {
  render(<App />);
  const textElement = screen.getByText(/Загрузка данных игры.../i);
  expect(textElement).toBeInTheDocument();
});
