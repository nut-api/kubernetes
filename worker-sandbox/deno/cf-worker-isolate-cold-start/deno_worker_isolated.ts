// deno_worker_isolated.ts

const codeStorage = new Map<string, string>();
type WorkerEntry = {
  worker: Worker;
  lastUsed: number; // timestamp (ms)
};

const workerPool = new Map<string, WorkerEntry>();


// Save user script in memory
async function saveScript(id: string, code: string) {
  codeStorage.set(id, code);
  removeWorkerInPool(id); // remove old worker if exists
}

// Get or create a worker for the given ID
function getOrCreateWorker(id: string, code: string): Worker {
  let entry = workerPool.get(id);
  if (entry) {
    entry.lastUsed = Date.now();
    return entry.worker;
  }

  // Can get code from any source, here we assume it's already in memory

  // create worker blob with the code, as you do now
  const worker = createWorkerFromCode(code);
  console.log(`Created new worker for '${id}'`);
  
  // Store the worker in the pool
  workerPool.set(id, {
    worker,
    lastUsed: Date.now(),
  });
  console.log("Number of workers:", workerPool.size);

  return worker;
}

// Create a Web Worker from the provided code
// This allows the worker to import the code dynamically
function createWorkerFromCode(code: string): Worker {

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

        // Read body as ArrayBuffer
        const body = await response.arrayBuffer();
        const headers = [...response.headers.entries()];
      
        self.postMessage(
          {
            response: {
              status: response.status,
              statusText: response.statusText,
              headers,
              body: body,
            },
          },
          [body] // Transfer the body buffer, ownership of the memory is moved — no copying!
        );
      } catch (err) {
        self.postMessage({ status: 500, body: "Worker error: " + err.toString() });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: "application/javascript" });
  const worker = new Worker(URL.createObjectURL(blob), {
    type: "module",
    deno: {
      permissions: {
        env: false,
        hrtime: false,
        net: "inherit",
        ffi: false,
        read: false,
        run: false,
        write: false,
      },
  },
  });
  return worker;
}


// Run user code inside a V8-isolated Web Worker
async function runIsolatedWorker(id: string, request: Request): Promise<Response> {
  // Check if the worker code is available
  const code = codeStorage.get(id);
  if (!code) return new Response(`No worker uploaded for '${id}'`, { status: 404 });

  const worker = getOrCreateWorker(id, code);

  return new Promise((resolve) => {
    const requestInfo: any = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    };

    worker.onmessage = (e) => {
      const { response } = e.data;

      const res = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
      resolve(res);
    };

    worker.onerror = (e) => {
      resolve(new Response("Worker crashed: " + e.message, { status: 500 }));
    };

    worker.postMessage({ requestInfo });

  });
}

// Remove a worker from the pool and terminate it
function removeWorkerInPool(id: string) {
  const entry = workerPool.get(id);
  if (entry) {
    entry.worker.terminate();
    workerPool.delete(id);
    console.log(`Worker '${id}' removed`);
    console.log("Remaining workers:", workerPool.size);
  }
}

// Idle timeout for workers (1 minutes)
// After this time, the worker will be removed from the pool if not used
const IDLE_TIMEOUT = 1 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of workerPool.entries()) {
    if (now - entry.lastUsed > IDLE_TIMEOUT) {
      removeWorkerInPool(id);
    }
  }
}, IDLE_TIMEOUT / 2);

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

  // Forward the request to the worker without worker ID in the path
  const forwardedRequest = new Request(newUrl.toString(), request);
  return await runIsolatedWorker(id, forwardedRequest);
});
