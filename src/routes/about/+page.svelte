<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import Landing from '$lib/images/console_landing.jpg';
	import { goto } from '$app/navigation';

	console.log($page.data.session);
    let sessionData = $page.data.session;

	// @ts-ignore
	let refreshToken = sessionData?.refreshToken ?? '';

	async function handleSignOut() {

    const response = await fetch('/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refreshToken })
    });
	
    if (response.ok) {
		await signOut();
        console.log('Logged out successfully, redirecting...');
        goto('/login');
    } else {
        const { error } = await response.json();
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
