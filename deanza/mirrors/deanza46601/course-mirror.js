/* Live shared teaching content with explicit destination course navigation. */
(function (root) {
  "use strict";
  function canvasLink(value, config) {
    if (!value.startsWith(config.sourceCanvasUrl + "/") && value !== config.sourceCanvasUrl) return value;
    const tail = value.slice(config.sourceCanvasUrl.length);
    if (tail === "" || tail === "/modules") return config.destinationCanvasUrl + tail;
    const match = tail.match(/^\/(modules\/items|modules|assignments|discussion_topics|pages)\/([A-Za-z0-9_-]+)(.*)$/);
    if (!match || (match[3] && !/^[?#/]/.test(match[3]))) throw new Error("Unmapped source Canvas link");
    const kind = match[1] === "modules/items" ? "module_items" : match[1] === "pages" ? "page_urls" : match[1];
    const mapped = config.mapping[kind][match[2]];
    if (mapped === undefined) throw new Error("New Canvas content needs a local mirror sync");
    const suffix = match[3].replace(/([?&](?:amp;)?module_item_id=)(\d+)/g, (_whole, prefix, sourceItem) => {
      const destinationItem = config.mapping.module_items[sourceItem];
      if (destinationItem === undefined) throw new Error("Unmapped Canvas navigation context");
      return prefix + destinationItem;
    });
    return config.destinationCanvasUrl + "/" + match[1] + "/" + mapped + suffix;
  }
  function pageUrl(page, config, context, fragment) {
    if (!config.pages.includes(page)) throw new Error("New hosted page needs a local mirror sync");
    const result = new URL(config.mirrorBaseUrl);
    result.searchParams.set("page", page);
    result.searchParams.set("context", context === "canvas" ? "canvas" : "web");
    result.hash = fragment || "";
    return result.href;
  }
  function hostedLink(value, sourceUrl, config, context) {
    if (!value) return value;
    if (value.startsWith("#")) {
      const sourcePage = new URL(sourceUrl).pathname.slice(new URL(config.sharedBaseUrl).pathname.length);
      return pageUrl(sourcePage, config, context, value);
    }
    const native = canvasLink(value, config);
    if (native !== value) return native;
    const url = new URL(value, sourceUrl);
    const base = new URL(config.sharedBaseUrl);
    if (url.origin !== base.origin) return value;
    if (url.pathname.startsWith(base.pathname)) {
      const page = decodeURIComponent(url.pathname.slice(base.pathname.length));
      if (!page.endsWith(".html")) return value;
      return pageUrl(page, config, context, url.hash);
    }
    // Source scripts sometimes resolve a relative link against location.href
    // rather than document.baseURI. Resolve only explicit known-page aliases.
    const sourceFolders = new URL(".", sourceUrl).pathname.slice(base.pathname.length).split("/").filter(Boolean);
    for (const page of config.pages) {
      const target = page.split("/");
      let common = 0;
      while (common < sourceFolders.length && sourceFolders[common] === target[common]) common++;
      const relative = "../".repeat(sourceFolders.length - common) + target.slice(common).join("/");
      const aliases = [relative, "../".repeat(sourceFolders.length) + page];
      if (aliases.some(alias => new URL(alias, config.mirrorBaseUrl).pathname === url.pathname)) return pageUrl(page, config, context, url.hash);
    }
    return value;
  }
  function remapText(text, config) {
    const escaped = config.sourceCanvasUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped + "(?:/(?:modules/items|modules|assignments|discussion_topics|pages)/[A-Za-z0-9_-]+|/modules)?(?:\\?[^\\s\"'<>#]*)?(?:#[^\\s\"'<>]*)?(?=[\\s\"'<>]|$)", "g");
    const result = text.replace(pattern, value => canvasLink(value, config));
    if (result.includes(config.sourceCanvasUrl)) throw new Error("Unsupported source Canvas link");
    return result;
  }
  const api = { canvasLink, pageUrl, hostedLink, remapText };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (!root.document) return;
  const entry = new URL(root.location.href);
  const adapterBase = new URL("./", entry);
  // An LTI token is never needed by this adapter and must not be forwarded.
  entry.searchParams.delete("progress_token");
  if (entry.hash.includes("progress_token")) entry.hash = "";
  root.history.replaceState(null, "", entry.href);
  const context = entry.searchParams.get("context") === "canvas" ? "canvas" : "web";
  function failure() {
    const doc = root.document;
    doc.body.replaceChildren();
    const message = doc.createElement("p");
    message.setAttribute("role", "alert");
    message.textContent = "This course page could not be loaded. Please return to Canvas Modules or try again later.";
    doc.body.appendChild(message);
  }
  async function load() {
    const response = await root.fetch(new URL("config.json", adapterBase), { cache: "no-store", credentials: "omit" });
    if (!response.ok) throw new Error("Mirror configuration unavailable");
    const config = await response.json();
    if (new URL(config.sharedBaseUrl).origin !== entry.origin || new URL(config.mirrorBaseUrl).origin !== entry.origin) throw new Error("Invalid mirror origin");
    const page = entry.searchParams.get("page") || "home.html";
    pageUrl(page, config, context);
    const sourceUrl = new URL(page, config.sharedBaseUrl).href;
    const source = await root.fetch(sourceUrl, { cache: "no-store", credentials: "omit", redirect: "error" });
    if (!source.ok) throw new Error("Shared course content unavailable");
    const original = await source.text();
    // The source renderer already uses native Canvas completion. A future LTI
    // change requires review instead of accidentally reusing CTI progress/auth.
    if (/canvas-progress-lti\.netlify\.app|canvas_progress_token|progress_token/.test(original)) throw new Error("Source progress integration needs review");
    const parsed = new root.DOMParser().parseFromString(remapText(original, config), "text/html");
    parsed.querySelectorAll("base").forEach(node => node.remove());
    const base = parsed.createElement("base");
    base.href = sourceUrl;
    parsed.head.prepend(base);
    parsed.body.dataset.courseMirrorSource = sourceUrl;
    parsed.body.dataset.courseMirrorDestination = config.destinationCanvasUrl;
    parsed.querySelectorAll("[data-canvas-module-item-id]").forEach(node => {
      const sourceId = node.getAttribute("data-canvas-module-item-id");
      const destinationId = config.mapping.module_items[sourceId];
      if (destinationId === undefined) throw new Error("Unmapped module item metadata");
      node.setAttribute("data-canvas-module-item-id", destinationId);
    });
    function rewrite(link) {
      for (const attr of ["href", "data-canvas-href"]) {
        const value = link.getAttribute(attr);
        if (!value) continue;
        const next = hostedLink(value, sourceUrl, config, context);
        if (next !== value) link.setAttribute(attr, next);
      }
    }
    parsed.querySelectorAll("a").forEach(rewrite);
    // Scripts use the shared content's base URL for media, templates and JSON.
    // Native links embedded in their JSON/string literals were mapped above.
    root.document.open();
    root.document.write("<!DOCTYPE html>" + parsed.documentElement.outerHTML);
    root.document.close();
    const doc = root.document;
    function safeRewrite(link) {
      try { rewrite(link); }
      catch (_error) {
        link.removeAttribute("href");
        link.removeAttribute("data-canvas-href");
        link.setAttribute("aria-disabled", "true");
        link.title = "This new course item needs a local Canvas sync.";
      }
    }
    doc.querySelectorAll("a").forEach(safeRewrite);
    // Scheduled homepages and interactive pages may update links after load.
    const observer = new root.MutationObserver(records => {
      for (const record of records) {
        if (record.type === "attributes" && record.target.matches("a")) safeRewrite(record.target);
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches("a")) safeRewrite(node);
          node.querySelectorAll("a").forEach(safeRewrite);
        }
      }
    });
    observer.observe(doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["href", "data-canvas-href"] });
    doc.addEventListener("click", event => {
      const link = event.target.closest("a");
      if (!link) return;
      safeRewrite(link);
      if (link.getAttribute("aria-disabled") === "true") event.preventDefault();
    }, true);
  }
  load().catch(failure);
})(typeof window !== "undefined" ? window : globalThis);
