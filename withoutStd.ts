import { encode } from "https://deno.land/std@0.73.0/encoding/utf8.ts";
import { delay } from "https://deno.land/std@0.73.0/async/delay.ts";
const s = Deno.listen({ port: 8000 });
console.log("http://localhost:8000/");

for await (const conn of s) {
  $progressiveRendering(conn);
}

async function $progressiveRendering(conn: Deno.Conn) {
  const headers = [
    "HTTP/1.1 200 OK",
    "cache-Control : no-cache",
    "content-type : text/html; charset=utf-8",
    "connection: close",
    "Transfer-Encoding :chunked",
  ];
  const xmlChunks = [
    "<h1>Hello world 1</h1>",
    "<h2>Hello world 2</h2>",
    "<h3>Hello world 3</h3>",
  ];

  const openHTML = "<html><body>";
  const closeHTML = "</body></html>";

  const sendMethods = {
    sendFirstChunk: async () => {
      await writeAndEncodeString(
        [...headers, "", chunk(openHTML + "\n")].join("\r\n")
      );
    },
    sendXmlChunks: async () => {
      for await (const s of xmlChunks) {
        await delay(1000);
        await writeAndEncodeString(chunk(s + "\n"));
      }
    },
    sendLastChunk: async () => {
      await writeAndEncodeString(chunk(closeHTML + "\n"));
      await writeAndEncodeString(chunk(""));
      conn.closeWrite();
    },
  };

  for await (const method of Object.values(sendMethods)) {
    await method();
  }

  async function writeAndEncodeString(el: string) {
    return await conn.write(encode(el));
  }

  function chunk(s: string) {
    return `${s.length.toString(16)}\r\n${s}\r\n`;
  }
}
