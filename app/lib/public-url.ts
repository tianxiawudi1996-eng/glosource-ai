import { BlockList, isIP } from 'node:net';

export const GLOSOURCE_BOT_USER_AGENT = 'Mozilla/5.0 (compatible; GloSourceBot/1.0; +https://glosourceai.com)';

export interface PublicHttpUrl {
  displayUrl: string;
  requestUrl: string;
}

const NON_PUBLIC_IPS = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
  ['224.0.0.0', 4], ['240.0.0.0', 4],
] as const) {
  NON_PUBLIC_IPS.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
  ['::', 128], ['::1', 128], ['::ffff:0:0', 96], ['100::', 64],
  ['2001:db8::', 32], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8],
] as const) {
  NON_PUBLIC_IPS.addSubnet(network, prefix, 'ipv6');
}

export function isPublicIpAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !NON_PUBLIC_IPS.check(address, 'ipv4');
  if (family === 6) return !NON_PUBLIC_IPS.check(address, 'ipv6');
  return false;
}

export function parsePublicHttpUrl(value: string): PublicHttpUrl | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;

    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
    if (!hostname) return null;
    if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) return null;
    if (isIP(hostname) !== 0) return null;

    const displayUrl = url.toString();
    url.hash = '';
    return { displayUrl, requestUrl: url.toString() };
  } catch {
    return null;
  }
}
