import React from "react";
import { render } from "@testing-library/react";
import Meeple from "../components/Meeple";

describe("Meeple component", () => {
  test('renders "аббаты" variant correctly', () => {
    const testProps = {
      type: "аббаты",
      color: "green",
      size: 24,
      style: { margin: "10px" },
    };

    const { container } = render(<Meeple {...testProps} />);

    const svgEl = container.querySelector("svg");
    expect(svgEl).toBeInTheDocument();

    expect(svgEl.getAttribute("viewBox")).toBe("0 0 512 512");

    const pathEl = container.querySelector("path");
    expect(pathEl).toBeInTheDocument();
    expect(pathEl.getAttribute("fill")).toBe(testProps.color);

    expect(svgEl).toHaveStyle("margin: 10px");
  });

  test('renders default variant correctly when type is not "аббаты"', () => {
    const testProps = {
      type: "other",
      color: "blue",
      size: 30,
      style: { padding: "5px" },
    };

    const { container } = render(<Meeple {...testProps} />);

    const svgEl = container.querySelector("svg");
    expect(svgEl).toBeInTheDocument();

    expect(svgEl.getAttribute("viewBox")).toBe("0 0 397 397");

    const pathEl = container.querySelector("path");
    expect(pathEl).toBeInTheDocument();
    expect(pathEl.getAttribute("fill")).toBe(testProps.color);

    expect(svgEl).toHaveStyle("padding: 5px");
  });

  test("matches snapshot", () => {
    const { asFragment } = render(
      <Meeple type="аббаты" color="red" size={24} style={{ margin: "8px" }} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
