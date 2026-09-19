import type { ApiError } from '../types/index.js';

export function fail(code: ApiError['code'], message: string, details?: unknown, status = 400) {
  return { status, body: { success: false, error: { code, message, details } } };
}

export function ok<T>(data: T) {
  return { success: true, data };
}

export function paginationParams(query: any) {
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20) || 20));
  return { page, limit, from: (page - 1) * limit, to: (page - 1) * limit + limit - 1 };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
}
