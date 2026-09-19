function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name} (voir .env.example)`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

export function assertServerEnv() {
  required('SUPABASE_URL');
  required('SUPABASE_SERVICE_ROLE_KEY');
}
