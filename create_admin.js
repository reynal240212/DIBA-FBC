const url = process.env.SUPABASE_URL + '/auth/v1/signup';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
