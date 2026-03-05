const url = 'https://wdnlqfiwuocmmcdowjyw.supabase.co/auth/v1/signup';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';

async function createAdmin() {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'director_tecnico@diba.com',
            password: 'Dt1968',
            data: {
                role: 'admin',
                full_name: 'Director Técnico'
            }
        })
    });

    const data = await res.json();
    console.log(data);
}

createAdmin();
