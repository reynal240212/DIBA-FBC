/**
 * DIBA FBC - Script de Build para Vercel
 * 
 * Este script se ejecuta automáticamente en cada despliegue de Vercel.
 * Lee las variables de entorno (SUPABASE_URL, SUPABASE_ANON_KEY) y
 * genera el archivo public/scripts/config.js con las credenciales reales.
 * 
 * Así las credenciales NUNCA están en el código fuente, sino en Vercel.
 */

const fs = require('fs');
const path = require('path');

// Leer variables de entorno de Vercel
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Validar que las variables existen
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ ERROR: Las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY son requeridas.');
    console.error('   Agrégalas en Vercel: Settings → Environment Variables');
    process.exit(1);
}

// Generar el contenido del archivo config.js
const configContent = `// ============================================================
//  DIBA FBC - Configuración generada automáticamente
//  ⚠️  NO edites este archivo manualmente.
//  Las credenciales se configuran en Vercel → Environment Variables.
// ============================================================

window.DIBA_CONFIG = {
  SUPABASE_URL: '${SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${SUPABASE_ANON_KEY}'
};
`;

// Ruta de salida
const outputPath = path.join(__dirname, 'public', 'scripts', 'config.js');

// Crear directorio si no existe
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// Escribir el archivo
fs.writeFileSync(outputPath, configContent, 'utf8');

console.log('✅ config.js generado correctamente desde variables de entorno de Vercel.');
