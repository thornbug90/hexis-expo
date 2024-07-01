export type Context = { req: Request & { gotrueId: string }; res: Response };
export type Resolver<A = unknown, B = unknown> = (parent: unknown, args: A, context: Context, info: unknown) => B;
