// server.ts
const port = 8080;
console.log(`Listening on http://localhost:${port}`);

Deno.serve({ port }, async (req) => {
  const userCode = await req.text(); // Assume POST with user JS code

  const result = await runInWorker(userCode);
  return new Response(result, { status: 200 });
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

