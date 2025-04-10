import { tileAreas, loadTileDefinitions } from "../data/tileAreas";

describe("tileAreas module", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    if (global.fetch.mockRestore) {
      global.fetch.mockRestore();
    }
  });

  test("loadTileDefinitions: успешно загружает определения, если ответ от сервера ok", async () => {
    const fakeDefinitions = { testKey: "testValue" };

    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeDefinitions),
      })
    );

    const definitions = await loadTileDefinitions();
    expect(definitions).toEqual(fakeDefinitions);
    expect(tileAreas).toEqual(fakeDefinitions);
  });

  test("loadTileDefinitions: выбрасывает ошибку, если ответ от сервера не ok", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "error" }),
      })
    );

    await expect(loadTileDefinitions()).rejects.toThrow(
      "Не удалось загрузить определения плиток"
    );
  });
});
