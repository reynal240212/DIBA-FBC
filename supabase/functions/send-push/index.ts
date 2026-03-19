import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import push from "https://esm.sh/web-push@3.6.6";

// Note: Config with environment variables in Supabase dashboard:
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:admin@diba.com)

Deno.serve(async (req: Request) => {
    // 1. Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 2. Auth Check (Admin Only)
        const authHeader = req.headers.get('Authorization')!;
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

        if (authError || !user || user.user_metadata?.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const { title, body, url, target } = await req.json();

        // 3. Fetch Subscriptions
        let query = supabase.from('push_subscriptions').select('*');
        
        // Target filtering logic (Simplified example)
        // If target is specific, we could join with profiles to filter by category
        if (target !== 'all') {
            // This requires a join with 'identificacion' or 'profiles' table 
            // For now, let's keep it simple or implement the join if needed
        }

        const { data: subs, error: subsError } = await query;
        if (subsError) throw subsError;

        // 4. Configure Web Push
        push.setVapidDetails(
            Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@diba.com',
            Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
            Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
        );

        // 5. Send Notifications
        const results = await Promise.allSettled(subs.map(async (sub: any) => {
            try {
                await push.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: sub.keys
                    },
                    JSON.stringify({ title, body, url })
                );
            } catch (err: any) {
                // Auto-cleanup expired subscriptions
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                }
                throw err;
            }
        }));

        const successCount = results.filter((r): r is PromiseFulfilledResult<void> => r.status === 'fulfilled').length;
        const failCount = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected').length;

        return new Response(JSON.stringify({ 
            message: 'Push broadcast complete', 
            success: successCount, 
            failed: failCount 
        }), { 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
    }
});
