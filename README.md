# GodViewActivation

Experience Earth as astronauts see it. Explore our planet freely from orbit — then turn on the **GodView**.

Fewer than 600 people in history have watched Earth from space. Many returned changed, describing awe, a dissolving of borders, and a deep sense of responsibility for the world below — the *Overview Effect*. GodViewActivation recreates the conditions for that shift in any modern browser, for free.

## The experience

- **Explore** — drag to orbit a photorealistic Earth, scroll to zoom from low orbit out to a "pale blue dot" distance. Day and night drift across the globe beneath animated clouds while a quiet space ambience plays.
- **GodView** — one button. The camera flies to the iconic whole-Earth vantage, the thin blue atmosphere line glows, binaural alpha-wave audio fades in, and an astronaut's words appear. Stay as long as you like; ESC or a tap returns control.

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests (Vitest)
npm run build    # type-check + production build
```

Requires Node 20.x. Built with Three.js + TypeScript + Vite; no backend — deploys as a static site.

## Deployment (Docker on Ubuntu 22.04)

After `npm run build` the app is pure static files, so the production container serves them with **nginx** — no Node.js at runtime. The multi-stage `Dockerfile` uses Node only to build; the final image is nginx + ~2MB of assets.

### 1. Install Docker (once per server)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# optional: run docker without sudo (log out and back in afterwards)
sudo usermod -aG docker $USER
```

### 2. Deploy

```bash
git clone <your-repo-url> godviewactivation
cd godviewactivation
docker compose up -d --build
```

The site is now on port 3004: `http://<server-ip>:3004/`. The container restarts automatically on reboot (`restart: unless-stopped`).

**Update to a new version:**

```bash
git pull
docker compose up -d --build
```

**Logs / status / stop:**

```bash
docker compose logs -f
docker compose ps
docker compose down
```

### HTTPS

For a public domain, put a TLS proxy in front (e.g. [Caddy](https://caddyserver.com/) with automatic Let's Encrypt, or nginx + certbot on the host) and forward to the container's port 80. Change the published port in `docker-compose.yml` (e.g. `"8080:80"`) if 80 is taken by the proxy.

### Without Docker (alternative)

Any static file server works — there is no server-side code:

```bash
npm ci && npm run build   # produces dist/
sudo apt-get install -y nginx
sudo cp -r dist/* /var/www/html/
```

## Credits & licensing

- Earth, Sun, and planet textures (2K set plus the 8K Earth day map) by [Solar System Scope](https://www.solarsystemscope.com/textures/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), based on NASA imagery.
- Astronaut quotes: Carl Sagan, Edgar Mitchell, William Anders, Aleksei Leonov.
- Ambience and binaural audio are synthesized in-browser with the Web Audio API.
