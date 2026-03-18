import { NextRequest, NextResponse } from 'next/server';

// API_BACKEND_URL или API_URL (для docker-compose). Дефолт bot_api — имя сервиса в bridge-сети Docker.
// Для локальной разработки на хосте явно задайте API_BACKEND_URL=http://localhost:8000
const API_BACKEND_URL =
  process.env.API_BACKEND_URL ||
  process.env.API_URL ||
  'http://bot_api:8000';

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

function normalizeJsonBody(rawBody: string): string {
  try {
    let parsedBody: unknown = JSON.parse(rawBody);

    // Some clients may double-encode JSON payloads (`"{\"key\":\"value\"}"`).
    // Unwrap nested JSON strings a few times to recover the actual object.
    for (let i = 0; i < 3; i += 1) {
      if (typeof parsedBody !== 'string') break;
      try {
        parsedBody = JSON.parse(parsedBody);
      } catch {
        break;
      }
    }
    return JSON.stringify(parsedBody);
  } catch {
    return rawBody;
  }
}

async function proxy(
  req: NextRequest,
  path: string[] | undefined,
  method: string
): Promise<NextResponse> {
  const url = buildBackendUrl(path, req.nextUrl.searchParams);
  const headers = getForwardHeaders(req);
  const contentType = headers['content-type'] ?? 'application/json';

  const init: RequestInit = {
    method,
    headers: {
      ...headers,
      'Content-Type': contentType,
    },
  };

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const rawBody = await req.text();
      if (rawBody) {
        const isJson = contentType.toLowerCase().includes('application/json');
        const body = isJson ? normalizeJsonBody(rawBody) : rawBody;
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
    console.error('[API Proxy]', err);
    return NextResponse.json(
      { detail: 'Backend unavailable' },
      { status: 502 }
    );
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
