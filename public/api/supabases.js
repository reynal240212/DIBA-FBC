 import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuración de Supabase (sin cambios)
const supabaseUrl = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';
const supabase = createClient(supabaseUrl, supabaseKey);

  // ===============================
  // Cargar jugadores
  // ===============================
  async function cargarJugadores() {
    const { data, error } = await supabaseClient
      .from("jugadores")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error cargando jugadores:", error);
      return [];
    }
    return data;
  }

  // ===============================
  // Crear planilla
  // ===============================
  async function crearPlanilla(categoria, fecha) {
    const { data, error } = await supabaseClient
      .from("planillas")
      .insert([{ categoria, fecha }])
      .select()
      .single();

    if (error) {
      console.error("Error creando planilla:", error);
      return null;
    }
    return data;
  }

  // ===============================
  // Guardar registro de planilla
  // ===============================
  async function guardarRegistro(planillaId, jugadorId, pago, asistencia, observacion) {
    const { data, error } = await supabaseClient
      .from("planilla_registros")
      .upsert([
        {
          planilla_id: planillaId,
          jugador_id: jugadorId,
          pago,
          asistencia,
          observacion
        }
      ], { onConflict: ["planilla_id", "jugador_id"] });

    if (error) {
      console.error("Error guardando registro:", error);
    }
    return data;
  }