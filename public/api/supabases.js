  // 🔹 Configuración de Supabase
  const SUPABASE_URL = "https://TU_PROJECT_URL.supabase.co";
  const SUPABASE_KEY = "TU_PUBLIC_ANON_KEY";
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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