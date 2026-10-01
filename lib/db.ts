import { env } from 'cloudflare:workers';
export function db(){const d=(env as unknown as {DB:D1Database}).DB;if(!d)throw Error('Room storage is temporarily unavailable. Please try again.');return d;}
