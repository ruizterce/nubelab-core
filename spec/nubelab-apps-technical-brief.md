# AI Technical Brief: Building New Web Apps On The Nubelab VPS

This document is a foundation brief for AI coding agents such as Codex. It
captures the technical patterns, deployment model, network assumptions, and
security rules needed to build new independent web applications on the same
Nubelab VPS infrastructure.

## Infrastructure Model

The VPS hosts multiple independent Dockerized web applications behind one
central reverse proxy.

Standard public request flow:

```text
Internet
  -> central Caddy container
  -> app frontend and/or app API container
  -> private app services, databases, workers, or monitoring integrations
```

Core principles:

- Each app is its own repository or project directory.
- Each app has its own Docker Compose file.
- Public HTTP/HTTPS is handled by the existing central Caddy container.
- Apps should not bind host ports `80` or `443`.
- Apps that need public traffic join the shared external Docker network
  `proxy_net`.
- Private app services should stay on app-specific internal networks.
- Monitoring access should be server-side only.

## Existing Shared VPS Components

Reusable platform components:

- Central Caddy container.
- External Docker network `proxy_net`.
- Monitoring network `monitoring_net`.
- Prometheus.
- node_exporter.
- cAdvisor.
- Grafana, if needed internally.
- Alertmanager, if needed internally.
- Tailscale access to the VPS.
- GitHub Actions deploy over SSH through Tailscale.
- GHCR container registry.

Do not duplicate these unless there is a strong reason:

- Public reverse proxy.
- TLS termination.
- Prometheus.
- Exporters.
- Docker socket access.

## Naming Pattern

For a new app, pick a stable project slug:

```text
<project-slug>
```

Use it consistently:

```text
repo:            <project-slug>
compose project: <project-slug>
frontend image:  ghcr.io/<owner>/<project-slug>-frontend:latest
api image:       ghcr.io/<owner>/<project-slug>-api:latest
frontend svc:    <project-slug>-frontend-1
api svc:         <project-slug>-api-1
VPS path:        /opt/<project-slug>
```

If the app is a single-container app, simplify names:

```text
image: ghcr.io/<owner>/<project-slug>:latest
svc:   <project-slug>-web-1
```

## Recommended App Architecture

For apps with frontend and API:

```text
browser
  -> central Caddy
  -> frontend container
  -> API container
  -> private dependencies
```

For simple server-rendered apps:

```text
browser
  -> central Caddy
  -> web container
  -> private dependencies
```

For apps that need metrics:

```text
browser
  -> central Caddy
  -> app server/API
  -> sanitized app endpoint
  -> Prometheus on monitoring_net
```

Rule: the browser must never query Prometheus, exporters, Docker, databases, or
internal services directly.

## Docker Network Pattern

Use these network roles:

```text
proxy_net       external network shared with central Caddy
shared_net      app-private network for frontend/API/internal services
monitoring_net  external network for Prometheus/exporters access
```

Recommended production network attachment:

- Frontend/web container:
  - joins `proxy_net`
  - joins `shared_net` only if it must call private app services
- API/server container:
  - joins `proxy_net` if Caddy routes to it directly
  - joins `shared_net` network
  - joins `monitoring_net` only if it must query Prometheus
- Database/cache/worker:
  - joins `shared_net` network
  - does not join `proxy_net`
- Monitoring integration:
  - server-side only
  - never exposed directly to public traffic

## Production Compose Template

Example for a frontend + API app:

```yaml
name: <project-slug>

services:
  frontend:
    image: ${IMAGE_PREFIX}/<project-slug>-frontend:latest
    environment:
      NODE_ENV: production
      API_BASE_URL: https://${DOMAIN}
    networks:
      - proxy_net
    healthcheck:
      test: ["CMD-SHELL", "node -e \"fetch('http://127.0.0.1:3000/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))\""]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  api:
    image: ${IMAGE_PREFIX}/<project-slug>-api:latest
    environment:
      NODE_ENV: production
      PORT: 4000
      CORS_ORIGIN: https://${DOMAIN}
    networks:
      - app_net
      - proxy_net
    healthcheck:
      test: ["CMD-SHELL", "node -e \"fetch('http://127.0.0.1:4000/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))\""]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped

networks:
  proxy_net:
    external: true
  app_net:
```

If the API must query Prometheus:

```yaml
    networks:
      - shared_net
      - proxy_net
      - monitoring_net

networks:
  proxy_net:
    external: true
  app_net:
  monitoring_net:
    external: true
```

## Production Environment Template

Create this on the VPS only:

```text
/opt/<project-slug>/docker/.env
```

Example:

```env
DOMAIN=app.nubelab.es
IMAGE_PREFIX=ghcr.io/<owner>
CORS_ORIGIN=https://app.nubelab.es
PUBLIC_BRAND_NAME=Nubelab
ENABLE_INTERNAL_DIAGNOSTICS=false
INTERNAL_DIAGNOSTICS_TOKEN=
```

If the app needs Prometheus:

```env
PROMETHEUS_URL=http://prometheus:9090
```

Do not commit:

- `docker/.env`
- `docker/.env.deploy`
- private keys
- tokens
- production secrets
- generated runtime state

## Central Caddy Pattern

The central Caddy container owns ports `80` and `443`. New apps add a site
block to the central Caddyfile.

Frontend + API example:

```caddy
app.nubelab.es {
    import security_headers
    encode zstd gzip

    handle /api/internal/* {
        respond 404
    }

    handle /api/* {
        reverse_proxy <project-slug>-api-1:4000
    }

    handle {
        reverse_proxy <project-slug>-frontend-1:3000
    }
}
```

Single web container example:

```caddy
app.nubelab.es {
    import security_headers
    encode zstd gzip

    reverse_proxy <project-slug>-web-1:3000
}
```

Reload Caddy:

```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

Common Caddy failure:

```text
lookup <container-name>: no such host
```

Likely cause: target container is not attached to `proxy_net`.

Check:

```bash
docker inspect caddy --format '{{json .NetworkSettings.Networks}}'
docker inspect <container-name> --format '{{json .NetworkSettings.Networks}}'
```

## Local Development Pattern

Recommended local options:

1. Run services directly with Node/framework dev servers.
2. Run the full app with Docker Compose.
3. Use an SSH tunnel when local code needs real VPS-only services such as
   Prometheus.

Typical local ports:

```text
frontend/web: http://localhost:3000
api:          http://localhost:4000
```

Recommended checks:

```bash
npm install
npm run typecheck
npm run lint
npm run build
docker compose -f docker/compose.dev.yml up --build -d
docker compose -f docker/compose.dev.yml ps
```

## Local Docker Pattern

For dev compose, point containers back to host services with:

```text
host.docker.internal
```

Examples:

```env
API_BASE_URL=http://host.docker.internal:4000
PROMETHEUS_URL=http://host.docker.internal:9090
```

On Linux Docker Engine, add if needed:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

## Prometheus Access Pattern

Only server-side code may query Prometheus.

Production:

```text
PROMETHEUS_URL=http://prometheus:9090
```

Local with SSH tunnel:

```bash
ssh -N -L 9090:<prometheus-bind-address>:9090 <vps-user>@<vps-tailscale-hostname>
```

Important:

- Use the actual address where Prometheus listens on the VPS.
- If Prometheus is bound to a Tailscale/private address, tunneling to
  `localhost:9090` on the VPS will fail.
- The public app should receive only sanitized, aggregated metrics.

Verify locally:

```bash
curl "http://localhost:9090/api/v1/query?query=up"
```

## Metrics Security Rules

Safe public metric examples:

- aggregate CPU percentage
- aggregate memory percentage
- aggregate disk percentage
- uptime days
- service status enum
- sanitized deploy metadata
- count of observed containers
- aggregated time series

Never expose:

- Prometheus itself
- Grafana publicly unless intentionally protected
- Alertmanager publicly
- exporters publicly
- Docker socket
- raw Prometheus labels
- raw scrape targets
- container IDs
- internal IPs
- internal hostnames
- internal ports
- filesystem paths
- environment variables
- secrets

Use explicit states:

```text
source: prometheus | partial | unavailable
status: operational | degraded | down | unknown
```

Rule: if a signal is not observable, return `unknown`, not `operational`.

## CI/CD Pattern

Use two workflows:

```text
.github/workflows/ci.yml
.github/workflows/deploy.yml
```

CI should run on push and pull request:

```text
npm ci
npm run typecheck
npm run lint
npm run build
docker build app images
```

Deploy should run on push to `main`:

```text
build image(s)
push to GHCR
join Tailscale
SSH into VPS
cd /opt/<project-slug>
git pull --ff-only
write docker/.env.deploy if release metadata is useful
docker compose pull
docker compose up -d
```

Recommended deploy concurrency:

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: false
```

For multiple apps, use app-specific concurrency groups:

```yaml
concurrency:
  group: deploy-<project-slug>-production
  cancel-in-progress: false
```

## GitHub Actions Secrets

Create secrets one by one in:

```text
Repository -> Settings -> Secrets and variables -> Actions
```

Required:

```text
TAILSCALE_AUTHKEY
VPS_HOST
VPS_USER
VPS_SSH_KEY
VPS_PROJECT_PATH
```

Meanings:

- `TAILSCALE_AUTHKEY`: lets the GitHub runner join the tailnet.
- `VPS_HOST`: Tailscale hostname or private tailnet address of the VPS.
- `VPS_USER`: SSH user, for example `admin`.
- `VPS_SSH_KEY`: private key used by GitHub Actions to SSH into the VPS.
- `VPS_PROJECT_PATH`: app path on the VPS, for example `/opt/<project-slug>`.

SSH rule:

- Store the private key in `VPS_SSH_KEY`.
- Put the matching public key in `/home/<user>/.ssh/authorized_keys` on the VPS.
- Do not put the public key in GitHub Secrets unless another workflow needs it.
- Do not commit either key.

Tailscale auth key recommendation:

- reusable
- ephemeral
- pre-approved if device approval is enabled
- tagged for CI, for example `tag:ci`

This lets the VPS keep SSH restricted to Tailscale devices.

## GHCR Pattern

Deploy images to:

```text
ghcr.io/<owner>/<project-slug>:latest
ghcr.io/<owner>/<project-slug>-frontend:latest
ghcr.io/<owner>/<project-slug>-api:latest
```

The VPS must be able to pull images.

Options:

- Make GHCR packages public.
- Or run `docker login ghcr.io` on the VPS with a token that has
  `read:packages`.

If an image is `not found`:

- confirm deploy workflow ran, not only CI
- confirm image names match compose
- confirm the package exists in GHCR
- confirm package visibility or VPS registry auth

## First Deploy Checklist

On the VPS:

```bash
cd /opt
sudo git clone <repo-url> <project-slug>
sudo chown -R <user>:<user> /opt/<project-slug>
cd /opt/<project-slug>
```

Create app env:

```bash
nano docker/.env
```

Create required external networks if missing:

```bash
docker network create proxy_net
docker network create monitoring_net
```

Only create external networks if they do not already exist.

Deploy manually once:

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env pull
docker compose -f docker/compose.prod.yml --env-file docker/.env up -d
```

Add Caddy site block and reload:

```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

Verify:

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env ps
curl -I https://app.nubelab.es
```

## Health Check Pattern

Every public web/API container should have:

- internal `/health` endpoint
- Docker healthcheck
- Caddy route verification
- deployment smoke check if the app is critical

Example Node healthcheck:

```yaml
healthcheck:
  test: ["CMD-SHELL", "node -e \"fetch('http://127.0.0.1:3000/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))\""]
  interval: 30s
  timeout: 5s
  retries: 3
```

## Operational Commands

Compose status:

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env ps
```

Logs:

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env logs --tail=100
docker logs --tail=100 caddy
```

Restart one service:

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env restart <service>
```

Manual deploy:

```bash
cd /opt/<project-slug>
git pull --ff-only
docker compose -f docker/compose.prod.yml --env-file docker/.env pull
docker compose -f docker/compose.prod.yml --env-file docker/.env up -d
```

## Recommended Repo Docs For Each New App

Create these docs early:

```text
README.md
docs/architecture.md
docs/deployment.md
docs/local-development.md
docs/security.md
docs/operations.md
docs/troubleshooting.md
```

At minimum, document:

- app purpose
- public domain
- container names
- image names
- VPS path
- required env vars
- Caddy route
- networks
- CI/CD secrets
- manual deploy commands
- security boundary

## Security Defaults For New Apps

Use by default:

- HTTPS through central Caddy.
- Security headers in Caddy.
- No public internal diagnostics.
- No Docker socket in public app containers.
- No public database ports.
- No public Prometheus/exporter ports.
- Least networks per container.
- Server-side access to private systems.
- Public DTOs that intentionally omit internals.
- `unknown` state for missing signals.
- `cache: no-store` for live operational API routes.

Add when needed:

- Authentication.
- Rate limiting.
- CSRF protection for cookie-based sessions.
- Audit logs for user actions.
- Backup/restore docs for persistent data.
- Database migration workflow.
- Secret rotation notes.

## Relationship To `vps-infra-showcase`

`vps-infra-showcase` remains:

- an independent public infrastructure dashboard
- deployed at its own domain
- behind central Caddy
- using its own containers and compose project
- a useful reference implementation for metrics, CI/CD, Docker, and Caddy

Future apps may link to it, but should not replace its routes, containers,
images, or deployment pipeline unless explicitly intended.

## AI Agent Rules

When using this brief to build a new app:

- Treat this as infrastructure context, not as a mandate to copy the showcase UI.
- Reuse the deployment/network/security patterns.
- Pick new project-specific container/image names.
- Pick a new domain or subdomain.
- Keep the central Caddy route explicit.
- Keep app-specific secrets out of git.
- Verify local dev before production deploy.
- Verify production compose and Caddy connectivity after deploy.
- Do not weaken monitoring or internal service exposure for convenience.
