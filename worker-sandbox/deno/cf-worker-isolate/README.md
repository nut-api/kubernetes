# Deno Isolated V8 Worker Runtime

This project provides a simple server in Deno that lets you **upload JavaScript worker scripts dynamically** and run them isolated inside V8-powered Web Workers per request, similar to Cloudflare Workers.

---

## Features

- Upload user worker scripts via HTTP `POST /upload/{id}`
- Runs each request inside a **fresh isolated Worker** context
- Supports full async `export default { async fetch(request) { ... } }` handlers
- Automatically forwards requests to uploaded workers based on path prefix
- Returns worker-generated HTTP responses to the client
- Stores uploaded scripts in-memory (no persistence)

---

## Usage

### Run the server

```bash
deno run --allow-net --unstable-worker-options deno_worker_isolated.ts
Upload a worker script
Send a POST request with your JavaScript code to /upload/{workerId}.

Example:

curl -X POST http://localhost:8000/upload/hello-worker --data-binary @user-script.js
Where user-script.js is your worker script, for example:

```
user-scirpt.js
```js
export default {
  async fetch(request) {
    return new Response(`Hello from worker! You requested: ${request.url}`, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  },
};
```
Call the uploaded worker
Request any path starting with the worker ID, e.g.:
```bash
curl http://localhost:8000/hello-worker/
This request is forwarded to the hello-worker script, with the remaining path and query preserved.
```
