const fs = require("fs");
const getNextPagesFromBuildDir = require("../getNextPagesFromBuildDir");
const logger = require("../../utils/logger");

jest.mock("fs");
jest.mock("../../utils/logger");

describe("getNextPagesFromBuildDir", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return an empty array when there are no pages", () => {
    expect.assertions(1);

    fs.readdir.mockImplementationOnce((path, cb) => cb(null, []));

    return getNextPagesFromBuildDir("/path/to/build/dir").then(nextPages => {
      expect(nextPages).toEqual([]);
    });
  });

  it("should return two next pages", () => {
    expect.assertions(3);

    fs.readdir.mockImplementationOnce((path, cb) =>
      cb(null, ["index.js", "about.js"])
    );

    return getNextPagesFromBuildDir("/path/to/build").then(nextPages => {
      expect(nextPages).toHaveLength(2);
      expect(nextPages[0].pageName).toEqual("index");
      expect(nextPages[1].pageName).toEqual("about");
    });
  });

  it("should pass provided pageConfig to next pages", () => {
    expect.assertions(2);

    fs.readdir.mockImplementationOnce((path, cb) =>
      cb(null, ["index.js", "about.js"])
    );

    const indexPageConfigOverride = { foo: "bar" };
    const aboutPageConfigOverride = { bar: "baz" };

    const pageConfig = {
      index: indexPageConfigOverride,
      about: aboutPageConfigOverride
    };

    return getNextPagesFromBuildDir("/path/to/build", pageConfig).then(
      nextPages => {
        expect(nextPages[0].serverlessFunctionOverrides).toEqual(
          indexPageConfigOverride
        );
        expect(nextPages[1].serverlessFunctionOverrides).toEqual(
          aboutPageConfigOverride
        );
      }
    );
  });

  it("should log pages found", () => {
    expect.assertions(1);

    const buildDir = "/path/to/build";

    fs.readdir.mockImplementationOnce((path, cb) => cb(null, ["admin.js"]));

    return getNextPagesFromBuildDir(buildDir).then(() => {
      expect(logger.log).toBeCalledWith(`Found 1 next page(s)`);
    });
  });

  it("should skip _app and _document pages", () => {
    expect.assertions(2);

    fs.readdir.mockImplementationOnce((path, cb) =>
      cb(null, ["_app.js", "_document.js", "_error.js"])
    );

    return getNextPagesFromBuildDir("/path/to/build").then(nextPages => {
      expect(nextPages).toHaveLength(1);
      expect(nextPages[0].pageName).toEqual("_error");
    });
  });

  it("should skip compatLayer file", () => {
    expect.assertions(2);

    fs.readdir.mockImplementationOnce((path, cb) =>
      cb(null, ["compatLayer.js", "home.js"])
    );

    return getNextPagesFromBuildDir("/path/to/build").then(nextPages => {
      expect(nextPages).toHaveLength(1);
      expect(nextPages[0].pageName).toEqual("home");
    });
  });
});
