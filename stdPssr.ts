import { serve, ServerRequest } from "./../deno/std/http/server.ts";
import { encode } from "https://deno.land/std@0.73.0/encoding/utf8.ts";
const s = serve({ port: 8000 });
console.log("http://localhost:8000/");

for await (const req of s) {
  $progressiveRendering(req);
}

async function $progressiveRendering(req: ServerRequest) {
  const xmlChunks = [
    "<html><body>",
    "<h1>Hello world 1</h1>",
    "<h2>Hello world 2</h2>",
    "<h3>Hello world 3</h3>",
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
  req.respond({
    body: reader,
    status: 200,
    headers: new Headers({
      "Cache-Control": "no-cache",
      "Content-Type": "text/html; charset=utf-8",
      Connection: "keep-alive",
      "X-Content-Type-Options": "nosniff",
      "Transfer-Encoding": "chunked",
    }),
  });
}
