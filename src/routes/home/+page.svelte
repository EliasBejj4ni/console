<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import Landing from '$lib/images/console_landing.jpg';
	import { goto } from '$app/navigation';

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

	async function handleSignOut() {
		try {
			console.log('Signing out...');

			const params = new URLSearchParams({
				client_id: 'console',
				client_secret: 'c1uiu7kHmzKwunMpSKF598Ls2uo0EDKL',
				refresh_token: refreshToken
			});
			
			const response = await fetch(
				`http://localhost:8081/realms/console/protocol/openid-connect/logout`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: params.toString()
				}
			);
            await signOut();
			if (!response.ok) {
				throw new Error(`HTTP error during logout! Status: ${response.status}`);
			}

			console.log('Logged out successfully.');
			goto('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	}

	async function refreshTokenFunction() {
		const params = new URLSearchParams({
			grant_type: 'refresh_token',
			client_id: 'console',
			client_secret: 'c1uiu7kHmzKwunMpSKF598Ls2uo0EDKL',
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

</script>

<div class="min-h-screen bg-cover bg-center" style="background-image: url({Landing})">
	<div class="p-10 text-center text-white">
		<h1 class="mb-4 text-5xl font-bold">Home Page</h1>

		<div class="mx-auto max-w-2xl">
			<h2 class="mb-2 text-3xl font-semibold">You are logged in as {userName}</h2>
			<p class="mb-4 text-xl">Roles: {roles.join(', ')}</p>
			<button
				on:click={() => {
					console.log('Button clicked');
					handleSignOut();
				}}
				class="rounded bg-blue-600 px-4 py-2 font-bold text-white shadow-lg transition duration-300 ease-in-out hover:bg-blue-700"
			>
				Sign out
			</button>
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
