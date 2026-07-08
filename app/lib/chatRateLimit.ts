export function chatRateLimitKeys(userId: string, ip: string): string[] {
  return [
    `glosource:rl:chat:minute:user:${userId}`,
    `glosource:rl:chat:minute:ip:${ip}`,
    `glosource:rl:chat:day:user:${userId}`,
    `glosource:rl:chat:day:ip:${ip}`,
  ];
}
