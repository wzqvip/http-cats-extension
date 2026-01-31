const ERROR_STATUS_MIN = 400;
const FALLBACK_STATUS = 520;
const HANDLED_TTL_MS = 2000;

const handledTabs = new Map();

function isInternalUrl(url) {
  return (
    url.startsWith("chrome-extension://") ||
    url.startsWith("chrome://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("chrome-error://")
  );
}

function recentlyHandled(tabId) {
  const last = handledTabs.get(tabId);
  return last && Date.now() - last < HANDLED_TTL_MS;
}

function markHandled(tabId) {
  handledTabs.set(tabId, Date.now());
}

function redirectToErrorPage(tabId, statusCode, originalUrl, reason) {
  if (tabId === -1 || tabId === undefined || tabId === null) {
    return;
  }
  if (recentlyHandled(tabId)) {
    return;
  }

  const code = Number.isFinite(statusCode) && statusCode > 0 ? statusCode : FALLBACK_STATUS;
  const params = new URLSearchParams({
    code: String(code),
    url: originalUrl || "",
    reason: reason || ""
  });

  markHandled(tabId);
  chrome.tabs.update(tabId, {
    url: chrome.runtime.getURL(`error.html?${params.toString()}`)
  });
}

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.type !== "main_frame") {
      return;
    }
    if (details.statusCode < ERROR_STATUS_MIN) {
      return;
    }
    if (!details.url || isInternalUrl(details.url)) {
      return;
    }

    redirectToErrorPage(
      details.tabId,
      details.statusCode,
      details.url,
      `HTTP ${details.statusCode}`
    );
  },
  { urls: ["<all_urls>"] }
);

chrome.webNavigation.onErrorOccurred.addListener((details) => {
  if (details.frameId !== 0) {
    return;
  }
  if (!details.url || isInternalUrl(details.url)) {
    return;
  }

  redirectToErrorPage(details.tabId, FALLBACK_STATUS, details.url, details.error || "Navigation error");
});
