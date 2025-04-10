import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/Header";

test("renders Header component without crashing", () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

  const headerElement = screen.getByText(/Carcassonne/i);
  expect(headerElement).toBeInTheDocument();
});

test("Header matches snapshot", () => {
  const { asFragment } = render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
