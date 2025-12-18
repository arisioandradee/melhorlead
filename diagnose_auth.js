
import fs from 'fs';
import path from 'path';

async function diagnose() {
    console.log("Starting diagnosis...");
    
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env file not found!");
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    });

    const url = env['VITE_SUPABASE_URL'];
    const key = env['VITE_SUPABASE_ANON_KEY'];

    if (!url) console.error("❌ VITE_SUPABASE_URL is missing");
    else console.log(`✅ VITE_SUPABASE_URL found: ${url}`);

    if (!key) console.error("❌ VITE_SUPABASE_ANON_KEY is missing");
    else {
        const keyParts = key.split('.');
        if (keyParts.length === 3) {
            console.log("✅ VITE_SUPABASE_ANON_KEY appears to be a valid JWT format (3 parts).");
            console.log(`Key prefix: ${key.substring(0, 10)}...`);
        } else {
            console.error("❌ VITE_SUPABASE_ANON_KEY does NOT look like a JWT (expected 3 parts for Supabase keys).");
            console.log(`Actual format has ${keyParts.length} parts.`);
        }
    }

    if (url && key) {
        console.log("\nTesting connection to Supabase...");
        // Test auth endpoint
        try {
            const response = await fetch(`${url}/auth/v1/health`);
            console.log(`Auth Health Check Status: ${response.status} ${response.statusText}`);
            // /auth/v1/health usually returns 200 OK
        } catch (e) {
            console.error("Query failed:", e.message);
        }

        // Test with key
        try {
            console.log("Testing POST to signup with current key (expecting 400 or 422 if key works, 401 if invalid)...");
             const response = await fetch(`${url}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'apikey': key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: 'test_diagnosis@example.com', password: 'password123' })
            });

             console.log(`Signup Request Status: ${response.status} ${response.statusText}`);
             if (response.status === 401) {
                 console.error("❌ 401 Unauthorized - The API Key is invalid or rejected by the server.");
             } else if (response.status === 200 || response.status === 400 || response.status === 422) {
                 console.log("✅ Key accepted by server (Auth logic reached).");
             }
        } catch (e) {
            console.error("Request failed:", e.message);
        }
    }
}

diagnose();
