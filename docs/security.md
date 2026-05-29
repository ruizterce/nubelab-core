# Security

NubeLab Core starts without public telemetry and without a Prometheus API.

Security defaults:

- HTTPS is handled by the central Caddy container.
- The app does not bind host ports `80` or `443`.
- Production traffic reaches the app through `proxy_net`.
- No Docker socket is mounted into the app container.
- No database, exporter, Prometheus, Grafana, or Alertmanager endpoint is exposed
  by this project.
- `/health` returns only service status and intentionally minimal metadata.
- Live operational routes, if added later, must use `Cache-Control: no-store`.

## Future Operational Data

If operational previews are added later:

- query private systems server-side only
- return sanitized aggregate DTOs
- expose `unknown` when a signal is unavailable
- never expose raw labels, scrape targets, internal hostnames, IPs, ports,
  filesystem paths, container IDs, environment variables, or secrets
