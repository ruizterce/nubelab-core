# Deployment

Production target:

```text
domain:          nubelab.es
compose project: nubelab-core
image:           ghcr.io/ruizterce/nubelab-core:latest
VPS path:        /opt/nubelab-core
service:         nubelab-core-web-1
```

## VPS Environment

Create this file only on the VPS:

```text
/opt/nubelab-core/docker/.env
```

Example:

```env
DOMAIN=nubelab.es
IMAGE_PREFIX=ghcr.io/ruizterce
```

## Compose

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env pull
docker compose -f docker/compose.prod.yml --env-file docker/.env up -d
```

The service joins only `proxy_net` in production.

## Caddy

Add this site block to the central Caddyfile:

```caddy
nubelab.es {
    import security_headers
    encode zstd gzip

    reverse_proxy nubelab-core-web-1:3000
}
```

Reload Caddy:

```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## GitHub Actions Secrets

Required deployment secrets:

```text
TAILSCALE_AUTHKEY
VPS_HOST
VPS_USER
VPS_SSH_KEY
VPS_PROJECT_PATH
```

Set `VPS_PROJECT_PATH` to:

```text
/opt/nubelab-core
```
