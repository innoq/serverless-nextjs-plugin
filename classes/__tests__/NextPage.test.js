const NextPage = require("../NextPage");

describe("NextPage", () => {
  describe("#constructor", () => {
    it("should set a pagePath", () => {
      const pagePath = "/build/serverless/pages/home.js";
      const page = new NextPage(pagePath);

      expect(page.pagePath).toEqual(pagePath);
    });
  });

  describe("When is the index page", () => {
    const pagesDir = "/build/serverless/pages";
    const pagePath = `${pagesDir}/index.js`;
    let page;

    beforeEach(() => {
      page = new NextPage(pagePath);
    });

    describe("#serverlessFunction", () => {
      it("should return function http event path /", () => {
        const { events } = page.serverlessFunction.indexPage;

        expect(events).toHaveLength(1);

        const httpEvent = events[0].http;
        expect(httpEvent.path).toEqual("/");
      });
    });
  });

  describe("When is the _error page", () => {
    const pagesDir = "/build/serverless/pages";
    const pagePath = `${pagesDir}/_error.js`;
    let page;

    beforeEach(() => {
      page = new NextPage(pagePath);
    });

    describe("#serverlessFunction", () => {
      it("should name the function notFoundErrorPage", () => {
        expect(page.serverlessFunction.notFoundErrorPage).toBeDefined();
      });

      it("should return function http event path /{proxy+}", () => {
        const { events } = page.serverlessFunction.notFoundErrorPage;

        expect(events).toHaveLength(1);

        const httpEvent = events[0].http;
        expect(httpEvent.path).toEqual("/{proxy+}");
      });
    });
  });

  describe("When a new instance is created", () => {
    const pagesDir = "/build/serverless/pages";
    const pagePath = `${pagesDir}/admin.js`;
    let page;

    beforeEach(() => {
      page = new NextPage(pagePath);
    });

    it("should have pageCompatPath", () => {
      expect(page.pageCompatPath).toEqual(`${pagesDir}/admin.compat.js`);
    });

    it("should return pageOriginalPath", () => {
      expect(page.pageOriginalPath).toEqual(`${pagesDir}/admin.original.js`);
    });

    it("should return pageDir", () => {
      expect(page.pageDir).toEqual(pagesDir);
    });

    it("should return pageName", () => {
      expect(page.pageName).toEqual("admin");
    });

    it("should return pageHandler", () => {
      expect(page.pageHandler).toEqual("/build/serverless/pages/admin.render");
    });

    it("should return pageFunctionName", () => {
      expect(page.functionName).toEqual("adminPage");
    });

    describe("#serverlessFunction", () => {
      it("should return function name", () => {
        const pageFunction = page.serverlessFunction;
        expect(pageFunction.adminPage).toBeDefined();
      });

      it("should return function handler", () => {
        const { handler } = page.serverlessFunction.adminPage;
        expect(handler).toEqual(`${pagesDir}/admin.render`);
      });

      it("should return function http event", () => {
        const { events } = page.serverlessFunction.adminPage;

        expect(events).toHaveLength(1);

        const httpEvent = events[0].http;

        expect(httpEvent.path).toEqual("admin");
        expect(httpEvent.method).toEqual("get");
      });

      it("should override serverlessFunction with provided pageConfig", () => {
        const serverlessFunctionOverrides = { foo: "bar" };

        const pageWithCustomConfig = new NextPage(
          pagePath,
          serverlessFunctionOverrides
        );

        expect(pageWithCustomConfig.serverlessFunction.adminPage.foo).toBe(
          "bar"
        );
      });

      it("should NOT change handler with provided pageConfig", () => {
        const serverlessFunctionOverrides = { handler: "invalid/handler" };

        const pageWithCustomConfig = new NextPage(
          pagePath,
          serverlessFunctionOverrides
        );

        expect(pageWithCustomConfig.serverlessFunction.adminPage.handler).toBe(
          pageWithCustomConfig.pageHandler
        );
      });

      it("should NOT change runtime with provided pageConfig", () => {
        const serverlessFunctionOverrides = { runtime: "python2.7" };

        const pageWithCustomConfig = new NextPage(
          pagePath,
          serverlessFunctionOverrides
        );

        expect(pageWithCustomConfig.serverlessFunction.adminPage.runtime).toBe(
          undefined
        );
      });
    });
  });
});
