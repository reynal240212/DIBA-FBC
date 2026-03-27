/**
 * DIBA FBC - Script de Build para Vercel
 * 
 * Este script se ejecuta automáticamente en cada despliegue de Vercel.
 * Lee las variables de entorno (SUPABASE_URL, SUPABASE_ANON_KEY) y
 * genera el archivo public/scripts/config.js con las credenciales reales.
 * 
 * Así las credenciales NUNCA están en el código fuente, sino en Vercel.
 */

const fs = require('fs-extra');
const path = require('path');

console.log('🔍 Iniciando generación de config.js...');

// Leer variables de entorno de Vercel
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- Verificación de Entorno ---');
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Detectada (length: ' + SUPABASE_URL.length + ')' : '❌ NO DETECTADA');
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Detectada (length: ' + SUPABASE_ANON_KEY.length + ')' : '❌ NO DETECTADA');

// Validar que las variables existen
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('\n❌ ERROR CRÍTICO: Las variables de entorno son requeridas para el build.');
    console.error('👉 Ve a Vercel: Settings → Environment Variables e ingresa:');
    console.error('   1. SUPABASE_URL');
    console.error('   2. SUPABASE_ANON_KEY');
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

// Asegurar que el directorio existe con fs-extra
fs.ensureDirSync(path.dirname(outputPath));

// Escribir el archivo con fs-extra
fs.writeFileSync(outputPath, configContent, 'utf8');

console.log('✅ config.js generado correctamente desde variables de entorno de Vercel.');
