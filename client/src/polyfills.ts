// Polyfills for browser compatibility
if (typeof globalThis === 'undefined') {
  (globalThis as any) = global || window;
}

// Ensure web APIs are available on globalThis
if (typeof globalThis.Request === 'undefined' && typeof Request !== 'undefined') {
  globalThis.Request = Request;
}

if (typeof globalThis.Response === 'undefined' && typeof Response !== 'undefined') {
  globalThis.Response = Response;
}

if (typeof globalThis.fetch === 'undefined' && typeof fetch !== 'undefined') {
  globalThis.fetch = fetch;
}

if (typeof globalThis.Headers === 'undefined' && typeof Headers !== 'undefined') {
  globalThis.Headers = Headers;
}

if (typeof globalThis.FormData === 'undefined' && typeof FormData !== 'undefined') {
  globalThis.FormData = FormData;
}

if (typeof globalThis.URL === 'undefined' && typeof URL !== 'undefined') {
  globalThis.URL = URL;
}

if (typeof globalThis.URLSearchParams === 'undefined' && typeof URLSearchParams !== 'undefined') {
  globalThis.URLSearchParams = URLSearchParams;
}

if (typeof globalThis.WebSocket === 'undefined' && typeof WebSocket !== 'undefined') {
  globalThis.WebSocket = WebSocket;
}

if (typeof globalThis.EventSource === 'undefined' && typeof EventSource !== 'undefined') {
  globalThis.EventSource = EventSource;
}

// Node.js process polyfills
if (typeof globalThis.process === 'undefined') {
  (globalThis as any).process = {
    env: {},
    browser: true,
    version: 'v16.0.0',
    nextTick: (fn: Function) => setTimeout(fn, 0),
    hrtime: () => [0, 0],
    cwd: () => '/',
    platform: 'browser',
    arch: 'web',
    versions: { node: '16.0.0' }
  };
}

// Ensure global is available
if (typeof globalThis.global === 'undefined') {
  (globalThis as any).global = globalThis;
}

// Buffer polyfill for Node.js compatibility
if (typeof globalThis.Buffer === 'undefined') {
  (globalThis as any).Buffer = {
    from: (data: any) => new Uint8Array(data),
    alloc: (size: number) => new Uint8Array(size),
    isBuffer: () => false
  };
}

// Additional Node.js globals that might be expected
if (typeof globalThis.setImmediate === 'undefined') {
  (globalThis as any).setImmediate = (fn: Function) => setTimeout(fn, 0);
}

if (typeof globalThis.clearImmediate === 'undefined') {
  (globalThis as any).clearImmediate = (id: number) => clearTimeout(id);
}

// Ensure crypto is available
if (typeof globalThis.crypto === 'undefined' && typeof crypto !== 'undefined') {
  globalThis.crypto = crypto;
}

// Ensure TextEncoder/TextDecoder are available
if (typeof globalThis.TextEncoder === 'undefined' && typeof TextEncoder !== 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined' && typeof TextDecoder !== 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}