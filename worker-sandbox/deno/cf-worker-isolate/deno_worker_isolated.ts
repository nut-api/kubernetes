// deno_worker_isolated.ts

const codeStorage = new Map<string, string>();

// Save user script in memory
async function saveScript(id: string, code: string) {
  codeStorage.set(id, code);
}

// Run user code inside a V8-isolated Web Worker
async function runIsolatedWorker(id: string, request: Request): Promise<Response> {
  const code = codeStorage.get(id);
  if (!code) return new Response(`No worker uploaded for '${id}'`, { status: 404 });

  const encoder = new TextEncoder(); // defaults to utf-8
  const uint8Array = encoder.encode(code); // ✅ handles all characters
  const encodedWorkerCode = btoa(String.fromCharCode(...uint8Array));

  const workerCode = `
    self.onmessage = async (e) => {
      const { requestInfo } = e.data;
      const req = new Request(requestInfo.url, {
        method: requestInfo.method,
        headers: requestInfo.headers
      });
      try {
        const { default: handler } = await import("data:application/javascript;base64,${encodedWorkerCode}");
        const response = await handler.fetch(req);
        const text = await response.text();
        self.postMessage({ status: response.status, body: text });
      } catch (err) {
        self.postMessage({ status: 500, body: "Worker error: " + err.toString() });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: "application/javascript" });
  const worker = new Worker(URL.createObjectURL(blob), {
    type: "module",
    deno: {
      permissions: "none",
  },
  });

  return new Promise((resolve) => {
    const requestInfo: any = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    };

    request.text().then((body) => {
      requestInfo.body = body;

      worker.onmessage = (e) => {
        const { status, body } = e.data;
        resolve(new Response(body, { status }));
        worker.terminate();
      };

      worker.onerror = (e) => {
        resolve(new Response("Worker crashed: " + e.message, { status: 500 }));
        worker.terminate();
      };

      worker.postMessage({ requestInfo });
    });
  });
}

// Handle uploads and request forwarding
Deno.serve(async (request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (request.method === "POST" && pathParts[0] === "upload") {
    const id = pathParts[1];
    const code = await request.text();
    await saveScript(id, code);
    return new Response(`Uploaded worker '${id}'`);
  }

  if (pathParts.length === 0) {
    return new Response("Missing worker ID", { status: 400 });
  }

  const id = pathParts[0];
  const subPath = "/" + pathParts.slice(1).join("/");
  const newUrl = new URL(request.url);
  newUrl.pathname = subPath || "/";

  const forwardedRequest = new Request(newUrl.toString(), request);
  return await runIsolatedWorker(id, forwardedRequest);
});
