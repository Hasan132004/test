const fs = require("fs");
const path = require("path");
const http = require("http");
const { URL } = require("url");

const rootDir = __dirname;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const sepIndex = trimmed.indexOf("=");
    if (sepIndex < 1) {
      continue;
    }

    const key = trimmed.slice(0, sepIndex).trim();
    let value = trimmed.slice(sepIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(rootDir, ".env"));

const port = Number(process.env.PORT) || 3000;

const apiHandlers = {
  "/api/login": require("./api/login"),
  "/api/register": require("./api/register"),
  "/api/send-permission-code": require("./api/send-permission-code"),
  "/api/send-mode-table": require("./api/send-mode-table"),
  "/api/status": require("./api/status"),
  "/api/emergency-stop": require("./api/emergency-stop"),
};

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch {
    return null;
  }
}

function sendFile(res, filePath, contentType) {
  const data = readFileSafe(filePath);
  if (!data) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not Found");
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", contentType);
  res.end(data);
}

function augmentResponse(res) {
  res.status = function status(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function json(payload) {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    res.end(JSON.stringify(payload));
    return res;
  };
  return res;
}

function collectBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        raw = "";
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function getRoutePath(req) {
  const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  return parsed.pathname;
}

const server = http.createServer(async (req, res) => {
  const routePath = getRoutePath(req);

  if (apiHandlers[routePath]) {
    req.body = await collectBody(req);
    augmentResponse(res);
    try {
      const maybePromise = apiHandlers[routePath](req, res);
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
    } catch {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      if (!res.writableEnded) {
        res.end(
          JSON.stringify({
            ok: false,
            error: "Internal server error.",
          })
        );
      }
    }
    return;
  }

  if (routePath === "/" || routePath === "/login" || routePath === "/login.html") {
    sendFile(res, path.join(rootDir, "login.html"), "text/html; charset=utf-8");
    return;
  }

  if (routePath === "/dashboard" || routePath === "/code.html") {
    sendFile(res, path.join(rootDir, "code.html"), "text/html; charset=utf-8");
    return;
  }

  if (routePath === "/emergency" || routePath === "/emergency.html") {
    sendFile(res, path.join(rootDir, "emergency.html"), "text/html; charset=utf-8");
    return;
  }

  if (routePath === "/project-detail" || routePath === "/project-detail.html") {
    sendFile(res, path.join(rootDir, "project-detail.html"), "text/html; charset=utf-8");
    return;
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Not Found");
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Local dev server running at http://localhost:${port}`);
});
