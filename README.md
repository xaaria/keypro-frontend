
# How to run

## Back end

Clone [Repository](https://github.com/xaaria/keypro-backend)

`docker compose up`

Postgres will run on (default) port `5432`. Change it if already in use.

If Django won't run, it might be because of database is not yet ready. Restart _backend-1_ container and it should work.

Database migrations are applied automatically.

## Front end

First clone this repo, install node packages, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
# or
npx next
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Login ⚠️

After successfull login, *refresh* your browser ⚠️. This is because of a bug / not perfectly implemented Nextjs logic. You should no be logged in as intended.


---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
