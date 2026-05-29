# NubeLab Core

NubeLab Core is the main public platform for `nubelab.es`: an operational
systems platform for infrastructure, automation, industrial operations, AI
workflows, and technical integration.

This is not intended to behave like a traditional developer portfolio. It is the
narrative and architectural layer of the NubeLab ecosystem. The live
infrastructure surface remains independent at `infra.nubelab.es`.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- MDX content
- Docker and Docker Compose
- GHCR-based deployment to the NubeLab VPS

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Recommended checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Production Shape

```text
Internet
  -> central Caddy container
  -> nubelab-core-web-1:3000
```

Production deployment uses:

- compose project: `nubelab-core`
- image: `ghcr.io/ruizterce/nubelab-core:latest`
- VPS path: `/opt/nubelab-core`
- public domain: `nubelab.es`
- public network: `proxy_net`

## Content

Content starts in English under `content/en`. The locale model is intentionally
simple so Spanish translations can be added later without changing the platform
shape.

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [Local development](docs/local-development.md)
- [Security](docs/security.md)
- [Operations](docs/operations.md)
- [Troubleshooting](docs/troubleshooting.md)
