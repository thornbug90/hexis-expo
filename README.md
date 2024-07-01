<<<<<<< HEAD
# Hexis Backend API

A GraphQL API for Hexis Web & App

## Prerequisites

To build and run this app locally you will need:

- Install [Node.js](https://nodejs.org/en/)
- Install [Redis](https://redis.io/docs/getting-started/)
- Install [Postgres](https://www.postgresql.org/download/)

# Getting Started

- Clone the repository and Install dependencies

```bash
npm install
# or
yarn
```

- Create a `.env` file by duplicating the contents of `.example.env` and updating the fields respectively (Speak to a fellow developer)

```
cp .example.env .env
```

- Run the project

```bash
npm run dev
# or
yarn dev
```

## Environment variables

Create a .env file (or just rename the .example.env) containing all the env variables you want to set, dotenv library will take care of setting them. This project is using three variables at the moment:

- `PORT` -> Port where the server will be started on
- `DATABASE_URL` -> A remote Postgres URL. e.g. =postgres://postgres:xxxxx@db.zbbwlvunazmamwsjhwrv.supabase.co:6543/postgres?pgbouncer=true
- `REDIS_PASSWORD` -> Redis Database credentials
- `ENGINES_API_ENDPOINT` -> A python endpoint for Hexis
- `SUPABASE_URL` -> Supabase database URL
- `SUPABASE_SERVICE_ROLE_KEY` -> Supabase Service role key
- `SUPABASE_IMAGE_ASSETS_URL` -> URL for where the assets are stored
- `STRIPE_SECRET_KEY` -> Stripe key
- `SENTRY_DSN` -> Sentry URL

### Adding types and definitions to Prisma

1. Add in the type to the enums file under source -> schems -> enums.ts
1. Update the schema.prisma file in prisma -> schema.prisma with the enum and use it.
1. Run `npm run postinstall` and it should create the definition for you.

## Creators

**Team**

- <https://github.com/orgs/abs-hexis/people>

## Copyright and License

copyright 2022 ABS
=======
# hexis-backend
>>>>>>> 3c3e923a10797ec3daf6299076fc4d23440cb8a3
