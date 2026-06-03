# iSounds Deployment

## 1) Build

```bash
bun install
bun run build
```

## 2) Environment

Create `.env` in project root:

```env
VITE_API_BASE_URL=https://api.zoalcast.com/api
VITE_PORTAL_ID=6
VITE_ZAIN_DSP=https://dsplp.sd.zain.com/af-lp/?p=8991632598
SITE_URL=https://isounds.sd
PORT=8888
DB_PATH=./data/isounds.db
```

## 3) Systemd setup

```bash
sudo cp deploy/isounds.service /etc/systemd/system/isounds.service
sudo systemctl daemon-reload
sudo systemctl enable isounds
sudo systemctl start isounds
```

## 4) Operations

- Check status: `sudo systemctl status isounds`
- Tail logs: `journalctl -u isounds -f`
- Restart: `sudo systemctl restart isounds`

## 5) Health checks

- Liveness: `GET /healthz`
- Readiness: `GET /readyz`
- Robots: `GET /robots.txt`
- Sitemap: `GET /sitemap.xml`

## 6) Rollback

1. Checkout previous release tag/commit.
2. Run `bun run build`.
3. Restart service: `sudo systemctl restart isounds`.
