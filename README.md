# routing-oracle

Multi-model routing validator for [nexus-agents](https://github.com/nexus-substrate/nexus-agents). Chains `delegate_to_model`, `weather_report`, and `consensus_vote` to validate routing decisions.

## Quick start

```bash
pnpm install
pnpm test        # Run unit tests
pnpm typecheck   # TypeScript strict check
pnpm build       # Compile to dist/
```

## MCP tools covered

| Tool | Purpose |
|------|---------|
| `delegate_to_model` | Route task to optimal model |
| `weather_report` | Get multi-CLI performance metrics |
| `consensus_vote` | Multi-model consensus voting |

## Live integration mode

```bash
NEXUS_LIVE=true ORACLE_TASK="Build a REST API" npx tsx src/run-live.ts
```

## License

MIT
