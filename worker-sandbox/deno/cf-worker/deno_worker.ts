// deno_worker.ts

// Store raw code and compiled workers in memory
const codeStorage = new Map<string, string>();
const workers = new Map<string, { fetch: (req: Request) => Promise<Response> }>();

// Save script to memory
async function saveScript(id: string, code: string) {
  codeStorage.set(id, code);
  workers.delete(id); // Force reload next time
}

// Dynamically load a worker from memory
async function loadWorker(id: string) {
  const code = codeStorage.get(id);
  if (!code) throw new Error(`No script stored for worker '${id}'`);

  // Create a Blob URL from code
  const blob = new Blob([code], { type: "application/javascript" });
  const blobUrl = URL.createObjectURL(blob);
  const mod = await import(blobUrl + `#${Date.now()}`); // cache-bust

  const worker = mod.default;
  if (!worker || typeof worker.fetch !== "function") {
    throw new Error("Worker must export default { fetch(request) {...} }");
  }

  workers.set(id, worker);
  return worker;
}

// Handle incoming request using a stored worker
async function handleWithWorker(id: string, request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length === 0) {
    return new Response("Worker ID not specified", { status: 400 });
  }

  const workerId = pathParts[0];

  // Remove the worker ID from the path
  const subPath = "/" + pathParts.slice(1).join("/");
  const forwardedUrl = new URL(request.url);
  forwardedUrl.pathname = subPath || "/";

  if (!workers.has(workerId)) {
    await loadWorker(workerId);
  }

  const worker = workers.get(workerId)!;

  const forwardedRequest = new Request(forwardedUrl.toString(), request);
  return await worker.fetch(forwardedRequest);
}

// HTTP server entrypoint
Deno.serve(async (request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (request.method === "POST" && pathParts[0] === "upload") {
    const id = pathParts[1];
    const code = await request.text();
    try {
      await saveScript(id, code);
      return new Response(`Uploaded script '${id}'`, { status: 200 });
    } catch (e) {
      return new Response(`Error saving script: ${e}`, { status: 500 });
    }
  }

  const id = pathParts[0];
  if (!id) return new Response("Worker ID not specified", { status: 400 });

  try {
    return await handleWithWorker(id, request);
  } catch (e) {
    return new Response(`Error running worker '${id}': ${e}`, { status: 500 });
  }
});
