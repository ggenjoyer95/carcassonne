import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "../reportWebVitals";

jest.mock("../reportWebVitals", () => jest.fn());

describe("index.js", () => {
  let createRootMock;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';

    createRootMock = { render: jest.fn() };

    jest.spyOn(ReactDOM, "createRoot").mockReturnValue(createRootMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  test("renders App component by calling root.render", () => {
    require("../index");

    expect(ReactDOM.createRoot).toHaveBeenCalledWith(
      document.getElementById("root")
    );
    expect(createRootMock.render).toHaveBeenCalled();
  });
});
