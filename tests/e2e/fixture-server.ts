const BASE = new URL('../fixtures/html', import.meta.url).pathname;

const server = Bun.serve({
  port: 3456,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    const name = pathname.replace(/^\//, '') || 'article.html';
    const file = Bun.file(`${BASE}/${name}`);
    if (!(await file.exists())) return new Response('Not found', { status: 404 });
    return new Response(file);
  },
});

console.log(`Fixture server listening on http://localhost:${server.port}`);
