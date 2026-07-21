export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const githubUrl = new URL("https://github.com/login/oauth/authorize");
      githubUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      githubUrl.searchParams.set("scope", "repo,user");
      githubUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
      return Response.redirect(githubUrl.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response("Erro na autenticacao: " + tokenData.error_description, { status: 400 });
      }

      const token = tokenData.access_token;
      const payload = JSON.stringify({ token: token, provider: "github" });

      const html = "<!doctype html><html><body><script>" +
        "(function() {" +
        "  function receiveMessage(e) {" +
        "    window.opener.postMessage(" +
        "      'authorization:github:success:" + payload.replace(/'/g, "\\'") + "'," +
        "      e.origin" +
        "    );" +
        "    window.removeEventListener('message', receiveMessage, false);" +
        "  }" +
        "  window.addEventListener('message', receiveMessage, false);" +
        "  window.opener.postMessage('authorizing:github', '*');" +
        "})();" +
        "</script></body></html>";

      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    return env.ASSETS.fetch(request);
  },
};
