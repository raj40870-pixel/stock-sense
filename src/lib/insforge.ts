import { createClient } from '@insforge/sdk';

const meta = import.meta as any;
const proc = typeof process !== 'undefined' ? (process as any) : undefined;

const baseUrl =
  meta?.env?.VITE_INSFORGE_URL ||
  proc?.env?.VITE_INSFORGE_URL ||
  'https://f2u4f3ww.us-east.insforge.app';

const anonKey =
  meta?.env?.VITE_INSFORGE_ANON_KEY ||
  proc?.env?.VITE_INSFORGE_ANON_KEY ||
  'anon_74a831a8feaa30107ca5e6731085e4a086c4874e56121492516ecf12aabd8030';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
