import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Player = {
  numero: string;
  nombre: string;
  apellidos: string;
  categoria: string | null;
  face_token: string | null;
  foto_url: string | null;
};

export type Attendance = {
  id?: number;
  identificacion_numero: string;
  fecha: string;
  asistio: boolean;
  fuente: string;
  created_at?: string;
};
