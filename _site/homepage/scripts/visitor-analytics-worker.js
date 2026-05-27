export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(null, 204);
    }

    if (url.pathname === "/visit" && request.method === "POST") {
      const country = request.headers.get("CF-IPCountry") || "ZZ";
      const key = `country:${country}`;
      const current = Number((await env.VISITOR_STATS.get(key)) || 0);
      await env.VISITOR_STATS.put(key, String(current + 1));
      return withCors({ ok: true, country });
    }

    if (url.pathname === "/stats" && request.method === "GET") {
      const countries = {};
      const list = await env.VISITOR_STATS.list({ prefix: "country:" });

      await Promise.all(
        list.keys.map(async (item) => {
          const code = item.name.replace("country:", "");
          countries[code] = Number((await env.VISITOR_STATS.get(item.name)) || 0);
        })
      );

      return withCors({ countries });
    }

    return withCors({ error: "Not found" }, 404);
  }
};

function withCors(body, status = 200) {
  return new Response(body ? JSON.stringify(body) : null, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
