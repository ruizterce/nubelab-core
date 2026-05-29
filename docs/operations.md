# Operations

## Health Check

The app exposes:

```text
/health
```

Expected response:

```json
{
  "service": "nubelab-core",
  "status": "ok",
  "telemetry": "not_configured",
  "timestamp": "..."
}
```

## Production Status

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env ps
```

## Logs

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env logs --tail=100
docker logs --tail=100 caddy
```

## Restart

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env restart web
```

## Manual Deploy

```bash
cd /opt/nubelab-core
git pull --ff-only
docker compose -f docker/compose.prod.yml --env-file docker/.env pull
docker compose -f docker/compose.prod.yml --env-file docker/.env up -d
```
