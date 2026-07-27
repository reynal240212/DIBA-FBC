const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const jugadores = [
  { nombre: 'JAMED', apellidos: 'AMARANTO', categoria: '2014/15/16' },
  { nombre: 'DEMIAN', apellidos: 'PEDROZA', categoria: '2014/15/16' },
  { nombre: 'STIVEN', apellidos: 'CABARCA', categoria: '2012' },
  { nombre: 'YOJAINER', apellidos: 'VILLALOBOS', categoria: '2012' },
  { nombre: 'ISRAEL', apellidos: 'BARRIOS', categoria: '2014/15/16' },
  { nombre: 'REY DAVID', apellidos: '', categoria: '2014/15/16' },
  { nombre: 'ENELDO', apellidos: 'TORREGROSA', categoria: '2014/15/16' },
  { nombre: 'PEDROZA', apellidos: 'SNEYDER', categoria: '2014/15/16' },
  { nombre: 'GERONIMO', apellidos: 'RIVERA', categoria: '2014/15/16' },
  { nombre: 'TIAGO', apellidos: 'PRINS', categoria: '2014/15/16' },
  { nombre: 'DANY', apellidos: 'TAPIAS', categoria: '2013' },
  { nombre: 'CES CRISTIANO', apellidos: '', categoria: '2013' },
  { nombre: 'BRAYAN', apellidos: 'FERNANDEZ', categoria: '2013' },
];

async function main() {
  // Sign in as admin
  console.log('🔐 Iniciando sesión como admin...');
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'director_tecnico@diba.com',
    password: 'Dt1968',
  });

  if (authError) {
    console.error('❌ Error de autenticación:', authError.message);
    return;
  }
  console.log('✅ Sesión activa:', auth.user.email);

  // Get existing numbers
  const { data: existing } = await supabase.from('identificacion').select('numero');
  const existingNums = new Set((existing || []).map(j => parseInt(j.numero)).filter(n => !isNaN(n)));
  let nextNum = 1;
  while (existingNums.has(nextNum)) nextNum++;

  const inserts = jugadores.map(j => {
    while (existingNums.has(nextNum)) nextNum++;
    const numero = String(nextNum);
    existingNums.add(nextNum);
    nextNum++;
    return {
      numero,
      nombre: j.nombre,
      apellidos: j.apellidos,
      categoria: j.categoria,
      sexo: 'M',
    };
  });

  console.log(`\n🚀 Insertando ${inserts.length} jugadores...`);

  const { data, error } = await supabase
    .from('identificacion')
    .insert(inserts)
    .select('numero, nombre, apellidos, categoria');

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error.details);
    return;
  }

  console.log(`\n✅ ¡${data.length} jugadores agregados!\n`);
  data.forEach(j => {
    console.log(`   ${j.numero} → ${j.nombre} ${j.apellidos} [${j.categoria}]`);
  });

  // Also log to jugadores table
  const jugadoresLog = data.map(j => ({
    nombre: `${j.nombre} ${j.apellidos}`.trim(),
    categoria: j.categoria,
    status: 'Activo',
    fecha_registro: new Date().toISOString(),
  }));

  const { error: logError } = await supabase.from('jugadores').insert(jugadoresLog);
  if (logError) {
    console.warn('⚠️ No se pudo registrar en tabla jugadores:', logError.message);
  } else {
    console.log(`📋 ${data.length} registros en tabla jugadores (dashboard)`);
  }

  console.log('\n🎉 ¡Listo!');
}

main();
