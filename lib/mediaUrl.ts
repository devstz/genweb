/**
 * Build a same-origin URL for media that lives on the API (served under /media).
 * Next.js rewrites /api/proxy/* to the backend.
 */
export function toProxyMediaUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('data:')) return path;
    const p = path.startsWith('/') ? path : `/media/${path}`;
    return `/api/proxy${p}`;
}
