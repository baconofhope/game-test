import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const rootDir = dirname(__filename);
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function generateImage(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OPENAI_API_KEY is not set" };
  }

  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1024x1024"
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    return { error: payload?.error?.message || "OpenAI image generation failed" };
  }

  const image = payload?.data?.[0];
  if (image?.url) {
    return { imageUrl: image.url };
  }

  if (image?.b64_json) {
    return { imageUrl: `data:image/png;base64,${image.b64_json}` };
  }

  return { error: "OpenAI did not return an image URL or base64 image" };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method === "POST" && url.pathname === "/api/generate-image") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const prompt = typeof parsed.prompt === "string" ? parsed.prompt.trim() : "";
        if (!prompt) {
          return json(res, 400, { error: "Prompt is required" });
        }

        const result = await generateImage(prompt);
        if (result.error) {
          return json(res, 502, { error: result.error });
        }

        return json(res, 200, { imageUrl: result.imageUrl });
      } catch {
        return json(res, 400, { error: "Invalid JSON body" });
      }
    });
    return;
  }

  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = pathname.replace(/\.\./g, "");
  const filePath = join(rootDir, safePath);

  try {
    const content = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Prompt Match Party listening on http://localhost:${port}`);
});
