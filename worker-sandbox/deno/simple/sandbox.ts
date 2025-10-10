// deno_script_platform.ts
const scripts = new Map<string, string>();

Deno.serve({ port: 8080 }, async (req) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (req.method === "POST" && pathParts[0] === "deploy" && pathParts[1]) {
    const name = pathParts[1];
    const code = await req.text();
    scripts.set(name, code);
    return new Response(`Deployed '${name}'`, { status: 200 });
  }

  if (req.method === "GET" && pathParts[0] === "run" && pathParts[1]) {
    const name = pathParts[1];
    const code = scripts.get(name);
    if (!code) return new Response("Script not found", { status: 404 });

    try {
      const result = await runInWorker(code);
      return new Response(result, { status: 200 });
    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  }

  return new Response("Not found", { status: 404 });
});

async function runInWorker(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob(
      [`
        self.onmessage = async (e) => {
          try {
            let result = await (async () => { ${code} })();
            self.postMessage(result?.toString());
          } catch (err) {
            self.postMessage("Error: " + err.message);
          }
        }
      `],
      { type: "application/javascript" }
    );
    
    // This creates a brand new V8 isolate, separated from the main app.
    const worker = new Worker(URL.createObjectURL(blob), { type: "module" });

    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
    };
    worker.onerror = (e) => {
      reject(e.message);
      worker.terminate();
    };

    worker.postMessage(null); // kick off
  });
}
