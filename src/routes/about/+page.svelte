<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import { jwtDecode } from 'jwt-decode';
	import Landing from '$lib/images/console_landing.jpg';
	import { goto } from '$app/navigation';
	console.log($page.data.session);
    let sessionData = $page.data.session;
	let roles: string[] = [];
	// @ts-ignore
	let refreshToken = sessionData?.refreshToken ?? '';
	// @ts-ignore
	$: if ($page.data.session && $page.data.session.access_token) {
		// @ts-ignore
		const decoded: any = jwtDecode($page.data.session.access_token);
		if (decoded && decoded.realm_access && Array.isArray(decoded.realm_access.roles)) {
			roles = decoded.realm_access.roles;
		}
		console.log('User Roles:', roles);
	}

	async function handleSignOut() {
		try {
			console.log('Signing out...');

			const params = new URLSearchParams({
				client_id: 'console',
				client_secret: 'c1uiu7kHmzKwunMpSKF598Ls2uo0EDKL',
				refresh_token: refreshToken
			});
			await signOut();
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

			if (!response.ok) {
				throw new Error(`HTTP error during logout! Status: ${response.status}`);
			}

			console.log('Logged out successfully.');
			goto('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	}
</script>

<div class="hero min-h-screen bg-cover bg-center" style="background-image: url({Landing})">
	<div class="p-10 text-center text-white">
		<h1 class="mb-3 text-4xl font-bold">About Page</h1>
		<h2 class="text-3xl font-semibold">About this app</h2>

		<div class="mx-auto max-w-4xl py-6 text-lg">
			<p>
				This is a <a
					href="https://kit.svelte.dev"
					class="text-blue-500 underline hover:text-blue-700">SvelteKit</a
				> app. You can make your own by typing the following into your command line and following the
				prompts:
			</p>

			<pre
				class="overflow-x-auto rounded-lg bg-gray-800 p-3 font-mono text-white">npm create svelte@latest</pre>

			<p>
				The page you're looking at is purely static HTML, with no client-side interactivity needed.
				Because of that, we don't need to load any JavaScript. Try viewing the page's source, or
				opening the devtools network panel and reloading.
			</p>
		</div>

		<div>
			{#if $page.data.session}
				<button
					on:click={() => handleSignOut()}
					class="rounded bg-blue-600 px-4 py-2 font-bold text-white shadow-lg hover:bg-blue-700"
					>sign out</button
				>
			{/if}
		</div>
	</div>
</div>
