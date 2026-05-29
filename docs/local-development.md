# Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Recommended checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Local Docker

Build and run the production-like container locally:

```bash
docker compose -f docker/compose.dev.yml up --build -d
docker compose -f docker/compose.dev.yml ps
```

Stop it:

```bash
docker compose -f docker/compose.dev.yml down
```
