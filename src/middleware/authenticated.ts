import { AuthenticationError } from "apollo-server";
import supabase from "../lib/gotrue";
import { Context, Resolver } from "../types";

const authenticated =
  <A, B>(resolver: Resolver<A, B>) =>
  async (parent: unknown, args: A, context: Context, info: unknown) => {
    let gotrueId: string;
    let authToken: string = "";

    if (context.req.headers && "authorization" in context.req.headers && typeof context.req.headers.authorization === "string") {
      authToken = context.req.headers["authorization"];
    }

    if (authToken) {
      try {
        const token = authToken.split(" ")[1];
        const { data } = await supabase.auth.getUser(token);
        if (data && data.user) gotrueId = data.user.id;
        else throw new Error("Invalid credentials. Please try logging in again.");
      } catch {
        throw new AuthenticationError("Invalid credentials. Please try logging in again.");
      }
    } else {
      throw new AuthenticationError("Invalid credentials. Please login again.");
    }

    context.req.gotrueId = gotrueId;
    return resolver(parent, args, context, info);
  };

export default authenticated;
