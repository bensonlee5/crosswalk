/** Use Vite's deployment base, including a GitHub project Pages subdirectory. */
export function assetUrl(path: string): string {
  if (!path || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return path;
  const base = import.meta.env?.BASE_URL || '/';
  if (base !== '/' && path.startsWith(base)) return path;
  return base + path.replace(/^\/+/, '');
}
export function homeUrl(room?: string): string {
  const url = new URL(import.meta.env?.BASE_URL || '/', window.location.origin);
  if (room) url.searchParams.set('room', room);
  return url.href;
}
