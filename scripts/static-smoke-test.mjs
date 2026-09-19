import app from "../dist/app.js";
import { pool } from "../dist/db/index.js";

let server;

const check = async (baseUrl, path, expectedStatus, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  if (response.status !== expectedStatus) {
    throw new Error(`${options.method ?? "GET"} ${path}: expected ${expectedStatus}, received ${response.status}`);
  }
  const body = await response.json();
  if (typeof body.success !== "boolean" || typeof body.message !== "string") {
    throw new Error(`${path}: response does not follow the standard response shape`);
  }
};

try {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not determine test server port");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  await check(baseUrl, "/", 200);
  await check(baseUrl, "/missing-route", 404);
  await check(baseUrl, "/api/issues", 401, { method: "POST" });
  await check(baseUrl, "/api/issues?sort=invalid", 400);
  await check(baseUrl, "/api/auth/signup", 400, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid" }),
  });
  await check(baseUrl, "/api/auth/login", 400, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{invalid-json",
  });

  console.log("Static smoke test passed: routing, validation, auth guard, and error responses");
} finally {
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
  await pool.end();
}
