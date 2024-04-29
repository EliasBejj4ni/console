<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
    import { page } from '$app/stores';
    import { jwtDecode } from 'jwt-decode';
	import Landing from "$lib/images/console_landing.jpg";
    console.log($page.data.session);
    let roles: string[] = [];

$: if ($page.data.session && $page.data.session.access_token) {
 const decoded: any = jwtDecode($page.data.session.access_token);
 if (decoded && decoded.realm_access && Array.isArray(decoded.realm_access.roles)) {
     roles = decoded.realm_access.roles;
 }
 console.log('User Roles:', roles);
}
</script>

<div class="hero min-h-screen bg-cover bg-center" style="background-image: url({Landing})">
    <div class="text-center text-white p-10">
        <h1 class="text-4xl font-bold mb-3">About Page</h1>
        <h2 class="text-3xl font-semibold">About this app</h2>

        <div class="max-w-4xl mx-auto text-lg py-6">
            <p>
                This is a <a href="https://kit.svelte.dev" class="text-blue-500 hover:text-blue-700 underline">SvelteKit</a> app. You can make your own by typing the
                following into your command line and following the prompts:
            </p>

            <pre class="bg-gray-800 text-white p-3 rounded-lg font-mono overflow-x-auto">npm create svelte@latest</pre>

            <p>
                The page you're looking at is purely static HTML, with no client-side interactivity needed.
                Because of that, we don't need to load any JavaScript. Try viewing the page's source, or opening
                the devtools network panel and reloading.
            </p>
            
        </div>

        <div>
            {#if $page.data.session}
            <button on:click={() => signOut()} class="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded text-white font-bold shadow-lg">sign out</button>
            {/if}
        </div>
    </div>
</div>



