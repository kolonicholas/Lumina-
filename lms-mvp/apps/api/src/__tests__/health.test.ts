import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../app.js";

describe("health", () => {
  it("returns ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});
