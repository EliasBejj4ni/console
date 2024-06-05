<script lang="ts">
    import * as Card from '$lib/components/ui/card';
    import { SignIn, SignOut } from "@auth/sveltekit/components";
    import { page } from '$app/stores';
    import Landing from '$lib/images/console_landing.jpg';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    export let message: string;

    export const load = ({ url }: any) => {
        const message = url.searchParams.get('message');
        return { props: { message } };
    };

    console.log($page.data);

    onMount(() => {
        if ($page.data.session && $page.data.session.user) {
            goto('/auth/home');
        }
    });
</script>

<div class="hero min-h-screen" style="background-image: url({Landing})">
    <div class="p-24 text-center"> 
        <h1 class="text-3xl font-bold text-white mb-6">Console</h1> 
        <Card.Root class="mx-auto max-w-sm overflow-hidden rounded-lg shadow-lg dark:bg-gray-800">
            <Card.Header>
                <Card.Title class="text-xl font-bold text-center text-gray-900 dark:text-gray-100">Sign In</Card.Title>
                <Card.Description class="text-center text-gray-600 dark:text-gray-400">Please enter your credentials</Card.Description>
            </Card.Header>
            <Card.Content>
                {#if $page.data.session}
                    <p>You are already signed in.</p>
                   
                {:else}
                    <form class="mb-4 bg-white rounded px-8 pt-6 pb-8 dark:bg-gray-700">
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" for="login-email">
                                Email:
                            </label>
                            <input id="login-email" type="email" name="email"
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Type email" required />
                        </div>
                        <SignIn provider="keycloak" class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            <button type="submit" >
                                Sign in with Keycloak
                              </button>
                        </SignIn>
                    </form>
                {/if}
            </Card.Content>
            <Card.Footer>
            </Card.Footer>
        </Card.Root>
    </div>
</div>