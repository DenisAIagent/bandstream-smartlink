import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

/**
 * Garde anti-SSRF : refuse les hôtes loopback, link-local, privés et la
 * métadonnée cloud (169.254.169.254). À utiliser avant tout fetch côté
 * serveur d'une URL influençable par l'utilisateur ou un tiers.
 */
function isBlockedIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 0) return true;
    return false;
  }
  // IPv6
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true; // loopback
  if (lower.startsWith('fe80')) return true; // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local
  // IPv4-mapped (::ffff:a.b.c.d)
  const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIp(mapped[1]);
  return false;
}

/**
 * Fetch sécurisé : https uniquement, hôte non privé, timeout et taille
 * de réponse plafonnée. Renvoie un Buffer (usage images/médias).
 */
export async function safeFetchBuffer(
  rawUrl: string,
  {
    timeoutMs = 8000,
    maxBytes = 12 * 1024 * 1024,
  }: { timeoutMs?: number; maxBytes?: number } = {}
): Promise<Buffer> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL');
  }

  if (url.protocol !== 'https:') {
    throw new Error('Only https URLs are allowed');
  }

  // Résolution DNS + filtrage des plages internes (anti SSRF / rebinding basique)
  const host = url.hostname;
  if (isIP(host)) {
    if (isBlockedIp(host)) throw new Error('Blocked host');
  } else {
    const records = await lookup(host, { all: true });
    if (records.length === 0) throw new Error('Host resolution failed');
    for (const r of records) {
      if (isBlockedIp(r.address)) throw new Error('Blocked host');
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'error' });
    if (!res.ok) {
      throw new Error(`Upstream responded ${res.status}`);
    }
    const length = Number(res.headers.get('content-length') ?? 0);
    if (length && length > maxBytes) {
      throw new Error('Response too large');
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > maxBytes) {
      throw new Error('Response too large');
    }
    return buf;
  } finally {
    clearTimeout(timer);
  }
}
