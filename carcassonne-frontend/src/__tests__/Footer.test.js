import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../components/Footer";

describe("Footer component", () => {
  test("renders without crashing and shows correct text", () => {
    render(<Footer />);

    const textElement = screen.getByText(/© 2025 Carcassonne\./i);

    expect(textElement).toBeInTheDocument();
  });

  test("matches snapshot", () => {
    const { asFragment } = render(<Footer />);
    expect(asFragment()).toMatchSnapshot();
  });
});
