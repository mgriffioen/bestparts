import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { proxy } from "@/proxy";

function createRequest(path: string, sessionToken?: string) {
  const headers = new Headers();

  if (sessionToken) {
    headers.set("cookie", `${SESSION_COOKIE_NAME}=${sessionToken}`);
  }

  return new NextRequest(`http://localhost:3000${path}`, {
    headers,
  });
}

describe("proxy route protection", () => {
  it("redirects guests from protected pages to login", () => {
    const response = proxy(createRequest("/submit"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fsubmit"
    );
  });

  it("allows authenticated requests through protected pages", () => {
    const response = proxy(createRequest("/submit", "session-token"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
