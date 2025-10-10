# Deno simple run code from request
```
deno run --allow-net server.ts

curl -X POST http://localhost:8080 \
  -d "return 'Hello from user script';"

```

# Deno upload and run code
```
deno run --allow-net sandbox.ts

curl -X POST http://localhost:8080/deploy/hello \
  -d "return 'Hello from user script';"

curl http://localhost:8080/run/hello
```

or post with postman

url: http://localhost:8080/deploy/hello
body:
```
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("world"));
```
```
curl http://localhost:8080/run/hello
```


# Deno cloudflare worker style code

```
deno run --allow-net deno_worker.ts
```
```
curl -X POST http://localhost:8000/upload/myworker \
  --data-binary @- <<EOF
export default {
  async fetch(request) {
    return new Response("🌈 Hello from memory!");
  }
}
EOF

curl http://localhost:8000/myworker
# Output: 🌈 Hello from memory!

```

# Deno cloudflare worker style code with v8 isolate per script request.

```
deno run --allow-net worker_iso.ts
```
```
curl -X POST http://localhost:8000/upload/myworker \
  --data-binary @- <<EOF
export default {
  async fetch(request) {
    return new Response("🌈 Hello from memory!");
  }
}
EOF

curl http://localhost:8000/myworker
# Output: 🌈 Hello from memory!

```


# Code explain

| Line                      | From   | To     | Purpose                                  |
| ------------------------- | ------ | ------ | ---------------------------------------- |
| `worker.postMessage(...)` | Host   | Worker | Sends request to worker to start work    |
| `self.onmessage`          | Worker | -      | Handles that request in isolated context |
| `self.postMessage(...)`   | Worker | Host   | Sends result back from user code         |
| `worker.onmessage = ...`  | Host   | -      | Receives result and responds to client   |

timeline 

[1] Host creates Worker
[2] Host sets `worker.onmessage = ...`     ✅ safe and ready
[3] Host calls `worker.postMessage(...)`   📨 sends to Worker

   ... inside Worker ...

[4] Worker receives message in `self.onmessage`
[5] Worker executes user script
[6] Worker sends result via `self.postMessage(...)`

   ... back in Host ...

[7] Host receives message → `worker.onmessage` is triggered
