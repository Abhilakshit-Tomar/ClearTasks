import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

let backend, vite, services;
let lastToken;
before(async () => {
  backend = http.createServer((request, response) => {
    lastToken = request.headers.authorization;
    if (request.url.includes("unreadable")) {
      response.end("<html>Unavailable</html>");
      return;
    }
    if (request.url.includes("/ai/")) {
      request.on("close", () => {});
      setTimeout(() => {
        if (!response.destroyed)
          response.end(JSON.stringify({ success: true, data: {} }));
      }, 200);
      return;
    }
    response.setHeader("Content-Type", "application/json");
    if (request.url.includes("failed")) {
      response.statusCode = 503;
      response.end(
        JSON.stringify({
          success: false,
          error: { message: "Service unavailable. Retry shortly." },
        }),
      );
      return;
    }
    response.end(JSON.stringify({ success: true, data: [{ id: "example" }] }));
  });
  await new Promise((resolve) => backend.listen(0, "127.0.0.1", resolve));
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  vite = await createServer({
    root,
    configFile: false,
    cacheDir: path.join(root, "node_modules/.vite-api-tests"),
    optimizeDeps: { noDiscovery: true, include: [] },
    resolve: { alias: { "@": path.join(root, "src") } },
    server: { middlewareMode: true },
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        `http://127.0.0.1:${backend.address().port}/api`,
      ),
    },
  });
  services = await vite.ssrLoadModule("/src/services/api.ts");
  services.setTokenProvider(async () => "test-token");
});
after(async () => {
  await vite?.close();
  await new Promise((resolve) => backend.close(resolve));
});

test("existing services send authenticated requests and unwrap successful data", async () => {
  assert.deepEqual(await services.projectService.getProjects(), [
    { id: "example" },
  ]);
  assert.equal(lastToken, "Bearer test-token");
});
test("failed requests retain the server explanation for visible recovery", async () => {
  await assert.rejects(
    services.projectService.getProject("failed"),
    /Service unavailable/,
  );
});
test("non-JSON service failures become a useful error instead of a parse exception", async () => {
  await assert.rejects(
    services.projectService.getProject("unreadable"),
    /unreadable response/,
  );
});
test("canceling generation aborts the actual request", async () => {
  const controller = new AbortController();
  const pending = services.aiService.analyzeProject(
    { title: "Example" },
    controller.signal,
  );
  setTimeout(() => controller.abort(), 20);
  await assert.rejects(pending, /Request cancelled/);
});
