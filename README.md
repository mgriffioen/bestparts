# bestparts

`bestparts` is a small Next.js app for collecting and browsing memorable movie scenes from YouTube. It uses Prisma with PostgreSQL for storage, and TMDB powers the movie title suggestions on the submit form.

## Requirements

- Node.js `20.9.0` or newer
- npm
- A running PostgreSQL database
- A TMDB read access token if you want movie title autocomplete

## Run locally

1. Install the required Node.js version.

   ```bash
   nvm use
   ```

   If you do not use `nvm`, install Node `20.9.0` or newer manually.

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create your local environment file.

   ```bash
   cp .env.example .env
   ```

4. Update `DATABASE_URL` in `.env` to point at your local PostgreSQL instance. Example:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bestparts?schema=public"
   TMDB_TOKEN="your_tmdb_read_access_token"
   ```

   `TMDB_TOKEN` is optional for basic use, but movie title suggestions will not work without it.

5. Create the database schema locally.

   ```bash
   npm run db:migrate
   ```

6. Start the development server.

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

## Useful scripts

- `npm run dev` starts the Next.js dev server
- `npm run build` generates the Prisma client, applies deploy migrations, and builds the app
- `npm run start` starts the production build
- `npm run db:migrate` creates and applies local Prisma migrations
- `npm run db:generate` regenerates the Prisma client
- `npm run db:studio` opens Prisma Studio
