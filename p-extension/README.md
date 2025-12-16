## SafeBrowse AI

SafeBrowse AI is a Manifest V3 Chrome extension that delivers dual-view safety insights for every site:

- **Tech Mode** highlights URL metadata, demo DNS resolution, inferred open ports, basic tech-stack hints, and HTTPS trust indicators.
- **Non-Tech Mode** keeps things friendly with curated offers for popular portals plus clear safety reminders.

> ⚠️ The extension never performs intrusive scanning. Port data is inferred (e.g., 443 for HTTPS). A separate Python script is included solely for educational purposes and must not be invoked from the extension.

### Project Structure

- `manifest.json` – MV3 manifest with popup-only action
- `popup.html` / `popup.css` / `popup.js` – UI and logic for both modes
- `icons/icon128.png` – lightweight icon
- `educational/port_scanner.py` – standalone Python demo script

### Running the Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this project folder
4. Pin SafeBrowse AI and open it while visiting any tab

### Features

- Active tab analysis using the Tabs API
- DNS-over-HTTPS lookup via `dns.google` for demo IP resolution
- Static server-header and tech-stack hints to respect browser sandbox rules
- Inferred port list with clear disclaimer
- Contextual offers and safety tips for e-commerce, travel, tickets, and UPI sites

### Educational Python Scanner

`educational/port_scanner.py` mirrors classic socket-based port scanning for study purposes. Run it separately from a terminal:

```bash
python educational/port_scanner.py
```

Never connect this script to the browser extension or execute it automatically; it is strictly opt-in learning material.

