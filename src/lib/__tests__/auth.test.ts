// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify, decodeProtectedHeader } from "jose";

vi.mock("server-only", () => ({}));

const mockSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: mockSet })),
}));

beforeEach(() => {
  mockSet.mockClear();
});

async function callCreateSession() {
  const { createSession } = await import("../auth");
  await createSession("user-123", "test@example.com");
}

function getCookieArgs() {
  expect(mockSet).toHaveBeenCalledOnce();
  return {
    name: mockSet.mock.calls[0][0] as string,
    token: mockSet.mock.calls[0][1] as string,
    options: mockSet.mock.calls[0][2] as Record<string, unknown>,
  };
}

test("sets cookie with name auth-token", async () => {
  await callCreateSession();
  expect(getCookieArgs().name).toBe("auth-token");
});

test("cookie is httpOnly", async () => {
  await callCreateSession();
  expect(getCookieArgs().options.httpOnly).toBe(true);
});

test("cookie is not secure in test environment", async () => {
  await callCreateSession();
  expect(getCookieArgs().options.secure).toBe(false);
});

test("cookie sameSite is lax", async () => {
  await callCreateSession();
  expect(getCookieArgs().options.sameSite).toBe("lax");
});

test("cookie path is /", async () => {
  await callCreateSession();
  expect(getCookieArgs().options.path).toBe("/");
});

test("cookie expires in approximately 7 days", async () => {
  const before = Date.now();
  await callCreateSession();
  const after = Date.now();

  const expires = getCookieArgs().options.expires as Date;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("JWT payload contains userId and email", async () => {
  await callCreateSession();
  const { token } = getCookieArgs();

  const secret = new TextEncoder().encode("development-secret-key");
  const { payload } = await jwtVerify(token, secret);

  expect(payload.userId).toBe("user-123");
  expect(payload.email).toBe("test@example.com");
});

test("JWT uses HS256 algorithm", async () => {
  await callCreateSession();
  const { token } = getCookieArgs();

  const header = decodeProtectedHeader(token);
  expect(header.alg).toBe("HS256");
});
