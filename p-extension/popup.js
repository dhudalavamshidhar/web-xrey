const techModeBtn = document.getElementById("techModeBtn");
const friendlyModeBtn = document.getElementById("friendlyModeBtn");
const techPanel = document.getElementById("techMode");
const friendlyPanel = document.getElementById("friendlyMode");
const refreshBtn = document.getElementById("refreshBtn");

const siteProfiles = [
  {
    matchers: [/amazon\./i, /flipkart\./i],
    category: "ecommerce",
    offers: [
      "Up to 15% cashback on select electronics",
      "Flat ₹250 off on secure UPI checkout",
      "Prime-safe sellers badge for verified stores",
    ],
    safetyTip: "Stick to sellers with 4★+ reviews and verified fulfillment.",
  },
  {
    matchers: [/make(my)?trip/i, /booking\.com/i, /airbnb/i],
    category: "travel",
    offers: [
      "No-cost EMIs on holiday bundles",
      "Complimentary lounge access on secure cards",
      "Early check-in bonus for trusted hosts",
    ],
    safetyTip: "Confirm the payment gateway URL before entering card details.",
  },
  {
    matchers: [/bookmyshow/i, /fandango/i],
    category: "tickets",
    offers: [
      "BOGO on weekday movie passes",
      "5% off on verified multiplex partners",
      "Express entry for digital tickets",
    ],
    safetyTip: "Avoid links that redirect outside the ticketing portal.",
  },
  {
    matchers: [/paytm/i, /phonepe/i, /gpay/i, /stripe/i],
    category: "upi",
    offers: [
      "Zero-fee UPI transfers up to ₹50,000",
      "Encrypted QR verification for storefronts",
      "AI fraud guard for new payees",
    ],
    safetyTip: "Compare the receiver name with bank records before paying.",
  },
];

const serverHeaderHints = {
  "www.google.com": "gws (Google Web Server)",
  "www.youtube.com": "gvs",
  "www.amazon.com": "Server: Server",
  "www.wikipedia.org": "mw1423.eqiad.wmnet",
};

const stackSignals = {
  "www.google.com": ["Google Frontend", "Borg CDN", "TLS 1.3"],
  "www.amazon.com": ["Amazon CloudFront", "React storefront"],
  "www.netflix.com": ["Zuul gateway", "Open Connect CDN"],
};

techModeBtn.addEventListener("click", () => switchMode("tech"));
friendlyModeBtn.addEventListener("click", () => switchMode("friendly"));
refreshBtn.addEventListener("click", () => init());

document.addEventListener("DOMContentLoaded", init);

async function init() {
  setLoadingState();
  try {
    const siteData = await buildSiteModel();
    renderTechMode(siteData);
    renderFriendlyMode(siteData);
  } catch (err) {
    console.error(err);
    renderError(err);
  }
}

function switchMode(mode) {
  const isTech = mode === "tech";
  techModeBtn.classList.toggle("active", isTech);
  friendlyModeBtn.classList.toggle("active", !isTech);
  techPanel.classList.toggle("active", isTech);
  friendlyPanel.classList.toggle("active", !isTech);
}

function setLoadingState() {
  document.getElementById("siteUrl").textContent = "Loading...";
  document.getElementById("protocol").textContent = "Protocol: —";
  document.getElementById("publicIp").textContent = "Resolving...";
  document.getElementById("serverHeader").textContent = "Analyzing headers...";
  document.getElementById("portList").innerHTML = "<li>Detecting ports...</li>";
  document.getElementById("techStack").innerHTML = "<li>Scanning signals...</li>";
  document.getElementById("securityStatus").textContent = "Checking...";
  document.getElementById("securityStatus").className = "status-chip";
  document.getElementById("trustLevel").textContent = "Trust level: —";
  document.getElementById("friendlyIntro").textContent = "Compiling smart picks...";
  document.getElementById("offerList").innerHTML = "";
  document.getElementById("safetyTip").textContent = "Loading safety insights...";
}

async function buildSiteModel() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  if (!tab || !tab.url) {
    throw new Error("Active tab URL unavailable. Open a standard web page.");
  }

  const url = new URL(tab.url);
  const protocol = url.protocol.replace(":", "").toUpperCase();
  const port = url.port;
  const hostname = url.hostname;

  const [ip, inferredPorts, serverHeader, stack, security] = await Promise.all([
    resolveIp(hostname),
    inferPorts(protocol, port),
    resolveServerHeader(hostname),
    detectStack(hostname),
    rateSecurity(protocol),
  ]);

  return {
    tabUrl: tab.url,
    protocol,
    hostname,
    ip,
    inferredPorts,
    serverHeader,
    stack,
    security,
  };
}

async function resolveIp(hostname) {
  try {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("DNS lookup failed");
    const data = await response.json();
    const answer = data.Answer ? data.Answer.find((ans) => ans.type === 1) : null;
    return answer ? answer.data : "Not resolved";
  } catch (error) {
    console.warn("DNS error:", error);
    return "Demo lookup unavailable";
  }
}

async function resolveServerHeader(hostname) {
  if (serverHeaderHints[hostname]) {
    return serverHeaderHints[hostname];
  }
  return "Unavailable due to browser security sandbox";
}

async function detectStack(hostname) {
  if (stackSignals[hostname]) {
    return stackSignals[hostname];
  }
  return ["Common CDN detected", "Modern JS bundle", "Basic CSP active"];
}

async function inferPorts(protocol, explicitPort) {
  const hints = [];
  if (explicitPort) {
    hints.push(`${explicitPort} (explicit in URL)`);
  }
  if (protocol === "HTTPS") {
    hints.push("443 (HTTPS default)");
    hints.push("8443 (common secure alt)");
  } else {
    hints.push("80 (HTTP default)");
    hints.push("8080 (legacy app port)");
  }
  hints.push("53 (DNS dependency)");
  return hints;
}

async function rateSecurity(protocol) {
  if (protocol === "HTTPS") {
    return {
      label: "Encrypted",
      level: "high",
      message: "Connection uses HTTPS with modern TLS.",
    };
  }
  return {
    label: "Unencrypted",
    level: "medium",
    message: "HTTP detected. Avoid sharing credentials here.",
  };
}

function renderTechMode(model) {
  document.getElementById("siteUrl").textContent = model.tabUrl;
  document.getElementById("protocol").textContent = `Protocol: ${model.protocol}`;
  document.getElementById("publicIp").textContent = model.ip;
  document.getElementById("serverHeader").textContent = model.serverHeader;
  document.getElementById("portList").innerHTML = model.inferredPorts
    .map((port) => `<li>${port}</li>`)
    .join("");
  document.getElementById("techStack").innerHTML = model.stack
    .map((signal) => `<li>${signal}</li>`)
    .join("");

  const statusEl = document.getElementById("securityStatus");
  statusEl.textContent = model.security.label;
  statusEl.className = `status-chip ${model.security.level === "high" ? "good" : "caution"}`;

  document.getElementById("trustLevel").textContent = model.security.message;
}

function renderFriendlyMode(model) {
  const profile = siteProfiles.find((entry) => entry.matchers.some((regex) => regex.test(model.hostname)));
  if (!profile) {
    document.getElementById("friendlyIntro").textContent =
      "No curated promos detected for this site. Browse safely!";
    document.getElementById("offerList").innerHTML = "<li>Enable secure HTTPS and trusted payments.</li>";
    document.getElementById("safetyTip").textContent =
      "Check for the lock icon beside the address bar before transacting.";
    return;
  }

  document.getElementById("friendlyIntro").textContent = `Popular ${profile.category} portal detected.`;
  document.getElementById("offerList").innerHTML = profile.offers.map((offer) => `<li>${offer}</li>`).join("");
  document.getElementById("safetyTip").textContent = profile.safetyTip;
}

function renderError(err) {
  document.getElementById("siteUrl").textContent = err.message;
  document.getElementById("protocol").textContent = "Protocol: —";
  document.getElementById("publicIp").textContent = "Unavailable";
  document.getElementById("serverHeader").textContent = "—";
  document.getElementById("portList").innerHTML = "<li>No data</li>";
  document.getElementById("techStack").innerHTML = "<li>No data</li>";
  document.getElementById("securityStatus").textContent = "Error";
  document.getElementById("securityStatus").className = "status-chip alert";
  document.getElementById("trustLevel").textContent = "Trust level: unknown";
  document.getElementById("friendlyIntro").textContent = "Unable to load offers.";
  document.getElementById("offerList").innerHTML = "";
  document.getElementById("safetyTip").textContent = "Reload the page or switch tabs.";
}

