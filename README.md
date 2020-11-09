# denoSSRTest
Test Progressive Rendering With deno.land/Oak

It should Serve a HTML chunk each 100ms but request take 1200ms and everything appear.
```sh
deno run --allow-net pssr.ts
```
Result

![this](https://media.giphy.com/media/uaDK9Mps4ItQCYbXtl/giphy.gif)

Expected => [node version](https://github.com/OverGlass/nodeSSRTest)

![this](https://media.giphy.com/media/v3Mu2PKxaE0XxFSfy0/giphy.gif)

