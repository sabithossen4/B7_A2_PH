import app from "../dist/app.js";
import { initDB, pool } from "../dist/db/index.js";

const createdUserIds = [];
let createdIssueId;
let server;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const request = async (baseUrl, path, options = {}, expectedStatus = 200) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const body = await response.json();
  assert(
    response.status === expectedStatus,
    `${options.method ?? "GET"} ${path}: expected ${expectedStatus}, received ${response.status} (${body.message})`,
  );
  return body;
};

try {
  await initDB();
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert(address && typeof address !== "string", "Could not determine test server port");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const contributorSignup = await request(baseUrl, "/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Contributor",
      email: `contributor-${unique}@example.com`,
      password: "test-password-123",
      role: "contributor",
    }),
  }, 201);
  createdUserIds.push(contributorSignup.data.id);

  const maintainerSignup = await request(baseUrl, "/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Maintainer",
      email: `maintainer-${unique}@example.com`,
      password: "test-password-123",
      role: "maintainer",
    }),
  }, 201);
  createdUserIds.push(maintainerSignup.data.id);

  const contributorLogin = await request(baseUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: `contributor-${unique}@example.com`,
      password: "test-password-123",
    }),
  });
  const maintainerLogin = await request(baseUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: `maintainer-${unique}@example.com`,
      password: "test-password-123",
    }),
  });

  const contributorToken = contributorLogin.data.token;
  const maintainerToken = maintainerLogin.data.token;
  const created = await request(baseUrl, "/api/issues", {
    method: "POST",
    headers: { Authorization: contributorToken },
    body: JSON.stringify({
      title: "Smoke test database timeout",
      description: "This issue verifies the complete DevPulse API workflow.",
      type: "bug",
    }),
  }, 201);
  createdIssueId = created.data.id;

  await request(baseUrl, "/api/issues?sort=newest&type=bug&status=open");
  await request(baseUrl, `/api/issues/${createdIssueId}`);
  await request(baseUrl, `/api/issues/${createdIssueId}`, {
    method: "PATCH",
    headers: { Authorization: contributorToken },
    body: JSON.stringify({ title: "Updated smoke test database timeout" }),
  });
  await request(baseUrl, `/api/issues/${createdIssueId}`, {
    method: "PATCH",
    headers: { Authorization: contributorToken },
    body: JSON.stringify({ status: "in_progress" }),
  }, 403);
  await request(baseUrl, `/api/issues/${createdIssueId}`, {
    method: "PATCH",
    headers: { Authorization: maintainerToken },
    body: JSON.stringify({ status: "in_progress" }),
  });
  await request(baseUrl, `/api/issues/${createdIssueId}`, {
    method: "PATCH",
    headers: { Authorization: contributorToken },
    body: JSON.stringify({ title: "Contributor should not change this" }),
  }, 409);
  await request(baseUrl, `/api/issues/${createdIssueId}`, {
    method: "DELETE",
    headers: { Authorization: contributorToken },
  }, 403);
  await request(baseUrl, `/api/issues/${createdIssueId}`, {
    method: "DELETE",
    headers: { Authorization: maintainerToken },
  });
  createdIssueId = undefined;

  console.log("Smoke test passed: auth, issue CRUD, filters, ownership, and roles");
} finally {
  if (createdIssueId !== undefined) {
    await pool.query("DELETE FROM devpulse.issues WHERE id = $1", [createdIssueId]);
  }
  if (createdUserIds.length > 0) {
    await pool.query("DELETE FROM devpulse.users WHERE id = ANY($1::int[])", [createdUserIds]);
  }
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
  await pool.end();
}
