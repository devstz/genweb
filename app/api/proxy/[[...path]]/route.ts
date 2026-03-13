import { NextRequest, NextResponse } from 'next/server';

const API_BACKEND_URL = process.env.API_URL || 'http://bot_api:8000';

const FORWARD_HEADERS = ['authorization', 'content-type'] as const;

function buildBackendUrl(path: string[] | undefined, searchParams: URLSearchParams): string {
  const pathStr = path?.length ? path.join('/') : '';
  const base = API_BACKEND_URL.replace(/\/$/, '');
  const pathPart = pathStr ? `/${pathStr}` : '';
  const query = searchParams.toString();
  return `${base}${pathPart}${query ? `?${query}` : ''}`;
}

function getForwardHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const name of FORWARD_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
}

async function proxy(
  req: NextRequest,
  path: string[] | undefined,
  method: string
): Promise<NextResponse> {
  const url = buildBackendUrl(path, req.nextUrl.searchParams);
  const headers = getForwardHeaders(req);

  const init: RequestInit = {
    method,
    headers: {
      ...headers,
      'Content-Type': headers['content-type'] ?? 'application/json',
    },
  };

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const body = await req.text();
      if (body) {
        (init as RequestInit & { body: string }).body = body;
      }
    } catch {
      // ignore empty body
    }
  }

  try {
    const res = await fetch(url, init);
    const data = await res.text();
    const contentType = res.headers.get('content-type') ?? 'application/json';
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    const cause = err instanceof Error ? err.cause : null;
    const code = cause && typeof cause === 'object' && 'code' in cause ? (cause as { code?: string }).code : null;
    console.error('[API Proxy] fetch failed', { url, code, error: err });
    const message =
      code === 'ECONNREFUSED'
        ? `Backend unreachable at ${API_BACKEND_URL}. Is the server running? Check API_BACKEND_URL in .env.local`
        : 'Backend unavailable';
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path, 'GET');
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path, 'POST');
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path, 'PUT');
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path, 'PATCH');
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path, 'DELETE');
}
