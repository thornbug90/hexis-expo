describe("ignore", () => {
  it("ignore", () => {});
});
/* import axios from "axios";
import { getRefreshOrAccessToken } from "./auth";

jest.mock("axios");

describe("getRefreshOrAccessToken", () => {
  it("should throw an error if no access code is provided", async () => {
    await expect(getRefreshOrAccessToken(undefined as any, undefined as any, undefined as any)).rejects.toThrow("No access code provided");
  });

  it("should throw an error if no code type is provided", async () => {
    await expect(getRefreshOrAccessToken("123", undefined as any, undefined as any)).rejects.toThrow("No code type provided");
  });

  it("should throw an error if no provider is provided", async () => {
    await expect(getRefreshOrAccessToken("123", "refresh", undefined as any)).rejects.toThrow("No provider provided");
  });

  it("should be called with x-www-form-urlencoded content-type headers", async () => {
    const apiCallSpy = jest.spyOn(axios, "post").mockResolvedValueOnce({ data: { refresh_token: "my cool refresh token" } });

    await getRefreshOrAccessToken("123", "refresh", "TRAINING_PEAKS");

    expect(apiCallSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({ headers: { "Content-Type": "application/x-www-form-urlencoded" } }),
    );
  });

  it("should return a refresh token if code type is refresh", async () => {
    jest.spyOn(axios, "post").mockResolvedValueOnce({
      data: { refresh_token: "my cool refresh token" },
    });

    const refreshToken = await getRefreshOrAccessToken("123", "refresh", "TRAINING_PEAKS");
    expect(refreshToken).toBe("my cool refresh token");
  });

  it("should return an access token if code type is access", async () => {
    jest.spyOn(axios, "post").mockResolvedValueOnce({ data: { access_token: "my cool access token" } });

    const accessToken = await getRefreshOrAccessToken("123", "access", "TRAINING_PEAKS");
    expect(accessToken).toBe("my cool access token");
  });

  it("should throw an error if the response from the provider is invalid", async () => {
    await expect(getRefreshOrAccessToken("123", "refresh", "INVALID_PROVIDER" as any)).rejects.toThrow("Invalid Provider");
  });

  it("should throw an error if the response from the provider contains an unexpected response", async () => {
    jest.spyOn(axios, "post").mockResolvedValueOnce({ unknown: "some unexpected response" });

    await expect(getRefreshOrAccessToken("123", "refresh", "TRAINING_PEAKS")).rejects.toThrow("No access info returned");
  });

  it("should throw an error if the response from the provider is empty", async () => {
    jest.spyOn(axios, "post").mockResolvedValueOnce({ data: {} });

    await expect(getRefreshOrAccessToken("123", "refresh", "TRAINING_PEAKS")).rejects.toThrow("No access info returned");
  });

  it("should throw an error if the response from the provider does not contain a refresh token", async () => {
    jest.spyOn(axios, "post").mockResolvedValueOnce({ data: { refresh_token: "" } });

    await expect(getRefreshOrAccessToken("123", "refresh", "TRAINING_PEAKS")).rejects.toThrow(
      "Response did not contain a refresh token or access token",
    );
  });

  it("should throw an error if the response from the provider does not contain a access token", async () => {
    jest.spyOn(axios, "post").mockResolvedValueOnce({ data: { access_token: "" } });

    await expect(getRefreshOrAccessToken("123", "refresh", "TRAINING_PEAKS")).rejects.toThrow(
      "Response did not contain a refresh token or access token",
    );
  });
});
 */
