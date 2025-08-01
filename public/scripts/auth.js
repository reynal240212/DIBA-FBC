// auth.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://wdnlqfiwuocmmcdowjyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q"
);

export async function verificarSesion() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    alert("⚠️ Debes iniciar sesión.");
    window.location.href = "login.html";
  }
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (!error) window.location.href = "login.html";
}
//