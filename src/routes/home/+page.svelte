<script lang="ts">
    import { signOut } from '@auth/sveltekit/client';
    import { page } from '$app/stores';
    import Landing from "$lib/images/console_landing.jpg";
    import { goto } from '$app/navigation';

    console.log($page.data.access_token);
    let roles: string[] = [];

    // @ts-ignore
    $: if ($page.data.session && $page.data.session.access_token) {
        // @ts-ignore 
        roles = $page.data.session?.roles;
    }
    async function handleSignOut() {
        try {
            console.log('Signing out...');
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }
    //@ts-ignore
    let name = $page.data.session.user?.name;

     const clientId = import.meta.env.AUTH_KEYCLOAK_ID;
     console.log(clientId,">>>>>>>>>>>>>>>>>>");

    async function refreshToken() {
    console.log("refresh token function called");
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: 'console',
        client_secret: 'c1uiu7kHmzKwunMpSKF598Ls2uo0EDKL',
        refresh_token: "eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI2ODJlNDNlMS00MzQ4LTQ1NjYtOWJkYi0wNTU0YzdjNTI4OWYifQ.eyJleHAiOjE3MTQzODE3OTIsImlhdCI6MTcxNDM3OTk5MiwianRpIjoiOWQ1NDhhNmYtYjgzOS00ODExLTg4MDAtNjI4ZmNjMWQwOGJhIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgxL3JlYWxtcy9jb25zb2xlIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgxL3JlYWxtcy9jb25zb2xlIiwic3ViIjoiN2Y0Y2E5MDMtNzZkNS00ZjBiLWJiMzctYzdjODcyZGNlOGNjIiwidHlwIjoiUmVmcmVzaCIsImF6cCI6ImNvbnNvbGUiLCJzZXNzaW9uX3N0YXRlIjoiMzQ3MWZjYTYtNzc3Mi00ZjdkLWFhOGQtMjE0NGQ3NTk5MzQ3Iiwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiMzQ3MWZjYTYtNzc3Mi00ZjdkLWFhOGQtMjE0NGQ3NTk5MzQ3In0.1vSbeZV_6GyaYzuirOvBcqi5_gOcaFv8JhFn-jLRyhXYDUmpTnedIoh75fCsY8m4ggpM1NZlQ_9DMOeDUN45iQ"  });

    try {
        const response = await fetch(`http://localhost:8081/realms/console/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Refreshed token:', data);

        localStorage.setItem('accessToken', data.access_token);
        if (data.refresh_token) { 
            localStorage.setItem('refreshToken', data.refresh_token);
        }
        return data;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return null;
    }
}

</script>

<div class="min-h-screen bg-cover bg-center" style="background-image: url({Landing})">
    <div class="text-center text-white p-10">
        <h1 class="text-5xl font-bold mb-4">Home Page</h1>

        <div class="max-w-2xl mx-auto">
            <h2 class="text-3xl font-semibold mb-2">You are logged in as {name}</h2>
            <p class="text-xl mb-4">Roles: {roles.join(', ')}</p>
            <button on:click={() => { console.log('Button clicked'); handleSignOut(); }} class="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded text-white font-bold shadow-lg transition duration-300 ease-in-out">
                Sign out</button>
                <button on:click={() => refreshToken()}>Refresh Token</button>       
        </div>
        
    </div>
</div>
