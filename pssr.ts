import { Application } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import type { Context } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import { encode } from "https://deno.land/std@0.73.0/encoding/utf8.ts";

const app = new Application();
app.use($progressiveRendering);
console.log("http://localhost:8080");
await app.listen({ port: 8080 });

async function $progressiveRendering(
  context: Context,
  next: () => Promise<void>
) {
  const xmlChunks: Array<string> = [
    "<html><body>",
    "<h1>Hell0 world</h1>",
    "<h2>Hello world</h2>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "</body></html>",
  ];

  const reader: Deno.Reader = {
    async read(p: Uint8Array) {
      if (!xmlChunks.length) {
        return null;
      } else {
        const chunk = encode(xmlChunks.shift());
        //Should sent a chunk each 100ms
        await sleep(100);
        p.set(chunk);
        return chunk.length;
      }
    },
  };

  async function sleep(ms: number) {
    return new Promise((resolve) => {
      const waitT = setTimeout(() => {
        clearTimeout(waitT);
        resolve();
      }, ms);
    });
  }
  context.response.status = 200;
  context.response.headers = new Headers({
    "Cache-Control": "no-cache",
    "Content-Type": "text/html; charset=utf-8",
    Connection: "keep-alive",
    "X-Content-Type-Options": "nosniff",
    "Transfer-Encoding": "chunked",
  });
  context.response.body = reader;
}
