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
    "connection: keep-alive",
    "Transfer-Encoding : chunked",
  ];
  const xmlChunks = [
    "<h1>Hello world 1</h1>",
    `<h2>There is a fake latency of 1second on each chunk</h2>
    <button id="testScript">reactivity before html fully loaded</button>
    <script>
        const button = document.querySelector("#testScript")
        const h2 = document.querySelector("h2")
        button.addEventListener("click", transform)
        function transform(e) {
            h2.innerText = "Still loading, but we have reactvity :)"
        }
    </script>
    `,
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Hello world</h3>",
    "<h3>Welcome to Progressive Server Side Rendering !</h3>",
  ];

  const openHTMLtags = "<html><body>";
  const closeHTMLtags = "</body></html>";

  const sendMethods = {
    sendFirstChunk: async () => {
      await writeAndEncodeString(
        [...headers, "", chunk(openHTMLtags)].join("\r\n")
      );
    },
    sendXmlChunks: async () => {
      for await (const s of xmlChunks) {
        await delay(1000);
        await writeAndEncodeString(chunk(s));
      }
    },
    sendLastChunk: async () => {
      await writeAndEncodeString(chunk(closeHTMLtags));
      await writeAndEncodeString(chunk(""));
      conn.closeWrite();
    },
  };
  try {
    for await (const method of Object.values(sendMethods)) {
      await method();
    }
  } catch (e) {
    console.log(e);
  }

  async function writeAndEncodeString(el: string) {
    return await conn.write(encode(el));
  }

  function chunk(s: string) {
    return `${s.length.toString(16)}\r\n${s}\r\n`;
  }
}
