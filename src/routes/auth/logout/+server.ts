export async function POST(request) {
    const { refreshToken } = await request.request.json(); 

    const params = new URLSearchParams({
        client_id: 'console', 
        client_secret: 'aFA7LFGwKa7J1WTa00xvJ99VUrsohVQ8', 
        refresh_token: refreshToken
    });

    try {
        const response = await fetch(`http://localhost:8081/realms/console/protocol/openid-connect/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error(`HTTP error during logout! Status: ${response.status}`);
        }

        return new Response(null, {
            status: 303,
            headers: {
                'Set-Cookie': 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
                'Location': '/'
            }
        });
    } catch (error) {
        console.error('Error signing out:', error);
        return new Response(JSON.stringify({ error: 'Failed to log out' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
