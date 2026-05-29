# Architecture

NubeLab Core is the main public platform for `nubelab.es`.

It explains systems, architecture, integrations, automation, AI workflows, and
engineering tradeoffs. It does not replace the existing infrastructure dashboard
at `infra.nubelab.es`.

## Runtime Model

```text
Internet
  -> central Caddy container
  -> nubelab-core-web-1:3000
```

The first version is a single Next.js web container. This keeps the deployment
small while leaving room for server-only adapters later.

## Repository Structure

```text
src/app        Next.js routes and route handlers
src/config     site-level configuration
src/content    content schemas and loaders
content/en     English MDX source content
docker         Dockerfile and Compose files
docs           operational documentation
spec           project and VPS briefs
```

## Content Model

Content entries are MDX files with typed frontmatter:

```text
architecture | integration | lab | field-note | system
```

The initial locale is `en`. The config keeps a future `es` locale visible so the
site can evolve into a translated platform without rewriting the content model.

## Future Expansion

Potential future server-only modules:

- sanitized infrastructure previews
- operational metadata
- deployment summaries
- content indexing
- webhook handlers

These must stay behind explicit public DTOs. The browser should never query
Prometheus, exporters, Docker, databases, or internal services directly.
