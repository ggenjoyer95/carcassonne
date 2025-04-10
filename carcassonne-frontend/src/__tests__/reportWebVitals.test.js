import reportWebVitals from "../reportWebVitals";

jest.mock("web-vitals", () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}));

import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

describe("reportWebVitals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does nothing when onPerfEntry is not a function", async () => {
    await reportWebVitals(null);

    expect(getCLS).not.toHaveBeenCalled();
    expect(getFID).not.toHaveBeenCalled();
    expect(getFCP).not.toHaveBeenCalled();
    expect(getLCP).not.toHaveBeenCalled();
    expect(getTTFB).not.toHaveBeenCalled();
  });
});
