<script lang="ts">
	import { page } from '$app/stores';
	import Landing from '$lib/images/console_landing.jpg';
	import { goto } from '$app/navigation';
	import { SignOut } from '@auth/sveltekit/components';

	console.log($page.data.access_token);

	let sessionData = $page.data.session;

	// @ts-ignore
	let roles = sessionData?.roles ?? [];

	// @ts-ignore
	let refreshToken = sessionData?.refreshToken ?? '';

	// @ts-ignore
	let accessToken = sessionData?.access_token ?? '';

	let userName = sessionData?.user?.name ?? 'Unknown';

	// @ts-ignore
	$: if ($page.data.session && $page.data.session.access_token) {
		// @ts-ignore
		roles = $page.data.session?.roles;
	}

	function reloadPage() {
		window.location.reload();
	}

	async function refreshTokenFunction() {
		const params = new URLSearchParams({
			grant_type: 'refresh_token',
			client_id: 'console',
			client_secret: 'pu65BsPrjVgOD16WE98VlQOlbTNTLlKq',
			refresh_token: refreshToken
		});

		try {
			const response = await fetch(
				`http://localhost:8081/realms/console/protocol/openid-connect/token`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: params.toString()
				}
			);

            reloadPage();
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
			console.error('Error refreshing token:', error);
			return null;
		}
	}

	async function handleSignOut() {

    const response = await fetch('/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refreshToken })
    });

    if (response.ok) {
        console.log('Logged out successfully, redirecting...');
        goto('/login');
    } else {
        const { error } = await response.json();
        console.error('Error signing out:', error);
    }
}

</script>

<div class="min-h-screen bg-cover bg-center" style="background-image: url({Landing})">
    <div class="p-10 text-center text-white">
        <h1 class="mb-4 text-5xl font-bold">Home Page</h1>

        <div class="mx-auto max-w-2xl">
            <h2 class="mb-2 text-3xl font-semibold">You are logged in as {userName}</h2>
            <p class="mb-4 text-xl">Roles: {roles.join(', ')}</p>
			<SignOut>
				<div
					slot="submitButton"
					class="rounded bg-blue-600 px-4 py-2 font-bold text-white shadow-lg transition duration-300 ease-in-out hover:bg-blue-700"
					on:click={handleSignOut}
				>
					Sign out
				</div>
			</SignOut>
            <button
                on:click={() => {
                    refreshTokenFunction();
                }}
                class="rounded bg-blue-600 px-4 py-2 font-bold text-white shadow-lg transition duration-300 ease-in-out hover:bg-blue-700"
            >
                Get Refresh Token
            </button>
        </div>
    </div>
</div>

