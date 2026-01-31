const STATUS_TEXT = {
	100: "Continue",
	101: "Switching Protocols",
	102: "Processing",
	103: "Early Hints",
	200: "OK",
	201: "Created",
	202: "Accepted",
	203: "Non-Authoritative Information",
	204: "No Content",
	205: "Reset Content",
	206: "Partial Content",
	207: "Multi-Status",
	208: "Already Reported",
	226: "IM Used",
	300: "Multiple Choices",
	301: "Moved Permanently",
	302: "Found",
	303: "See Other",
	304: "Not Modified",
	305: "Use Proxy",
	307: "Temporary Redirect",
	308: "Permanent Redirect",
	400: "Bad Request",
	401: "Unauthorized",
	402: "Payment Required",
	403: "Forbidden",
	404: "Not Found",
	405: "Method Not Allowed",
	406: "Not Acceptable",
	407: "Proxy Authentication Required",
	408: "Request Timeout",
	409: "Conflict",
	410: "Gone",
	411: "Length Required",
	412: "Precondition Failed",
	413: "Payload Too Large",
	414: "URI Too Long",
	415: "Unsupported Media Type",
	416: "Range Not Satisfiable",
	417: "Expectation Failed",
	418: "I'm a teapot",
	420: "Enhance Your Calm",
	421: "Misdirected Request",
	422: "Unprocessable Entity",
	423: "Locked",
	424: "Failed Dependency",
	425: "Too Early",
	426: "Upgrade Required",
	428: "Precondition Required",
	429: "Too Many Requests",
	431: "Request Header Fields Too Large",
	444: "No Response",
	450: "Blocked by Windows Parental Controls",
	451: "Unavailable For Legal Reasons",
	497: "HTTP Request Sent to HTTPS Port",
	498: "Invalid Token",
	499: "Client Closed Request",
	500: "Internal Server Error",
	501: "Not Implemented",
	502: "Bad Gateway",
	503: "Service Unavailable",
	504: "Gateway Timeout",
	506: "Variant Also Negotiates",
	507: "Insufficient Storage",
	508: "Loop Detected",
	509: "Bandwidth Limit Exceeded",
	510: "Not Extended",
	511: "Network Authentication Required",
	520: "Unknown Error",
	521: "Web Server Is Down",
	522: "Connection Timed Out",
	523: "Origin Is Unreachable",
	524: "A Timeout Occurred",
	525: "SSL Handshake Failed",
	526: "Invalid SSL Certificate",
	527: "Railgun Error",
	530: "Site Frozen",
	561: "Unauthorized",
	598: "Network Read Timeout Error",
	599: "Network Connect Timeout Error"
};

const params = new URLSearchParams(window.location.search);
const rawCode = Number(params.get("code"));
const originalUrl = params.get("url") || "";
const reason = params.get("reason") || "";

const statusCode = Number.isFinite(rawCode) && rawCode > 0 ? rawCode : 520;
const statusText = STATUS_TEXT[statusCode];

const statusCodeEl = document.getElementById("status-code");
const mainTitleEl = document.getElementById("main-title");
const subtitleEl = document.getElementById("subtitle");
const reasonEl = document.getElementById("reason");
const catImage = document.getElementById("cat-image");

const locale = (navigator.language || "en").toLowerCase();
const isZh = locale.startsWith("zh");

const i18n = {
	title: isZh ? "该网页无法正常运作" : "This page isn’t working",
	subtitleWithHost: isZh
		? (host) => `${host} 目前无法处理此请求。`
		: (host) => `${host} is currently unable to handle this request.`,
	subtitleWithoutHost: isZh ? "当前地址无法处理此请求。" : "The current address can’t handle this request.",
	httpErrorPrefix: isZh ? "HTTP 错误" : "HTTP ERROR"
};

statusCodeEl.textContent = String(statusCode);
mainTitleEl.textContent = i18n.title;

let hostText = originalUrl;
try {
	hostText = new URL(originalUrl).host || originalUrl;
} catch (error) {
	hostText = originalUrl;
}

subtitleEl.textContent = hostText
	? i18n.subtitleWithHost(hostText)
	: i18n.subtitleWithoutHost;

let displayReason = `${i18n.httpErrorPrefix} ${statusCode}`;
if (statusText) {
	displayReason = `${i18n.httpErrorPrefix} ${statusCode}: ${statusText}`;
}

reasonEl.textContent = displayReason;

if (originalUrl) {
  const urlInfoEl = document.getElementById("url-info");
  const urlLinkEl = document.getElementById("original-url-link");
  const copyBtnEl = document.getElementById("copy-url-btn");

  urlLinkEl.textContent = originalUrl;
  urlLinkEl.href = originalUrl;

  urlInfoEl.style.display = "flex";

  copyBtnEl.addEventListener("click", (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(originalUrl).then(() => {
      copyBtnEl.classList.add("copied");
      setTimeout(() => {
        copyBtnEl.classList.remove("copied");
      }, 2000);
    });
  });
}

catImage.src = `https://http.cat/${statusCode}.jpg`;
catImage.alt = `HTTP ${statusCode}`;

document.title = `HTTP ${statusCode} | http.cat`;
