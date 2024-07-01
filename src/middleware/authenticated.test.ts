import { AuthenticationError } from "apollo-server";
import supabase from "../lib/gotrue";
import authenticated from "./authenticated";
import { Context } from "../types";

describe("authenticated middleware", () => {
  let resolver: jest.Mock;
  let context: any;
  let info: any;

  beforeEach(() => {
    resolver = jest.fn();
    context = { req: { headers: {} } };
    info = {};
  });

  it("should throw an AuthenticationError if no authorization header is provided", async () => {
    await expect(authenticated(resolver)(null, null, context as Context, info)).rejects.toThrow(
      new AuthenticationError("Invalid credentials. Please login again."),
    );
  });

  it("should throw an AuthenticationError if the authorization header is invalid", async () => {
    context.req.headers["authorization"] = "Bearer invalid-token";
    supabase.auth.getUser = jest.fn().mockRejectedValueOnce(undefined);
    await expect(authenticated(resolver)(null, null, context as Context, info)).rejects.toThrow(
      new AuthenticationError("Invalid credentials. Please try logging in again."),
    );
  });

  it("should set the gotrueId on the context if the authorization header is valid", async () => {
    const token = "valid-token";
    const gotrueId = "12345";
    context.req.headers["authorization"] = `Bearer ${token}`;
    supabase.auth.getUser = jest.fn().mockResolvedValue({ data: { user: { id: gotrueId } } });
    await authenticated(resolver)(null, null, context as Context, info);
    expect(context.req.gotrueId).toBe(gotrueId);
  });

  it("should call the resolver if the authorization header is valid", async () => {
    const token = "valid-token";
    const gotrueId = "12345";
    context.req.headers["authorization"] = `Bearer ${token}`;
    supabase.auth.getUser = jest.fn().mockResolvedValue({ data: { user: { id: gotrueId } } });
    await authenticated(resolver)(null, null, context as Context, info);
    expect(resolver).toHaveBeenCalledTimes(1);
  });
});
