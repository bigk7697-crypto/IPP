export type Role = 'user' | 'admin';
export type Status = 'draft' | 'published' | 'archived';

export interface ApiError {
  code:
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'VALIDATION_ERROR'
    | 'INTERNAL_ERROR';
  message: string;
  details?: unknown;
}

export interface AuthUser {
  id: string;
  email?: string;
  role: Role;
}
