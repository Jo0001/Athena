# Athena

Log Analysis and more for the ViaVersion project

**Features**
- Analyze raw logs directly send per POST request
- Analyze logs from [supported sites](https://athena.viaversion.workers.dev/v0/analyze/sites)
- Checks the proxy up2date state (Velocity, Waterfall & BungeeCord)

## API Dokumentation

See development and prod https://www.postman.com/jo0001-team/workspace/viaversion/api/70fb5b15-3f24-4c8c-b633-2d64ac705960

## Contribution

New detections are very welcome - either add them directly per PR or just open an issue :)

## Development
For the development you need [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

To start you local dev server just go to the terminal tab of your IDE and type `npx wrangler dev`

Full commandlist https://developers.cloudflare.com/workers/wrangler/commands/