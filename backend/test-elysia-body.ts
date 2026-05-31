import { Elysia } from 'elysia';
new Elysia()
  .post('/test', async ({ request }) => {
    const text = await request.text();
    return { size: text.length };
  })
  .listen({ port: 8001, maxRequestBodySize: 200 * 1024 * 1024 });
console.log('Server running');
