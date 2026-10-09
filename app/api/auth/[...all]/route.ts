import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";

const handler = toNextJsHandler(auth);

// NextRequest#url rewrites the first loopback host anywhere in the URL to
// "localhost", query string included. Codex / ChatGPT Work send
// redirect_uri=http://127.0.0.1:PORT/callback, so the authorization code was
// bound to localhost:PORT and the token exchange (which sends 127.0.0.1)
// failed with "redirect_uri mismatch". The base Request keeps the URL as received.
const receivedUrl = Object.getOwnPropertyDescriptor(Request.prototype, "url")!.get!;

function asReceived(request: Request) {
  let url: string;
  try {
    url = receivedUrl.call(request);
  } catch {
    return request;
  }
  if (url === request.url) return request;
  return new Request(url, { method: request.method, headers: request.headers, signal: request.signal });
}

export const GET = (request: Request) => handler.GET(asReceived(request));
export const POST = handler.POST;
