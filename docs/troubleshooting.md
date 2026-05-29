# Troubleshooting

## Caddy Cannot Resolve The App Container

Symptom:

```text
lookup nubelab-core-web-1: no such host
```

Likely cause: the app container is not attached to `proxy_net`.

Check:

```bash
docker inspect caddy --format '{{json .NetworkSettings.Networks}}'
docker inspect nubelab-core-web-1 --format '{{json .NetworkSettings.Networks}}'
```

## GHCR Image Not Found

Check:

- the deploy workflow ran on `main`
- the image name is `ghcr.io/ruizterce/nubelab-core:latest`
- the GHCR package exists
- the package is public or the VPS is logged into GHCR with `read:packages`

## Health Check Fails

Check:

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env logs --tail=100 web
curl -i http://127.0.0.1:3000/health
```

Inside the container, the app must listen on `0.0.0.0:3000`.
