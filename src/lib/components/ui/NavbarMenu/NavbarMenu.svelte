<script lang="ts">
	import Logo from '$lib/images/logo2.png';
	import { ModeWatcher, resetMode, setMode } from "mode-watcher";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import Sun from "svelte-radix/Sun.svelte";
	import Moon from "svelte-radix/Moon.svelte";
	import { page } from '$app/stores';
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import UserLogo from '$lib/images/user.png';
	import { goto } from '$app/navigation';
	import { signOut } from '@auth/sveltekit/client';
	import LogOut from "lucide-svelte/icons/log-out";
	import User from "lucide-svelte/icons/user";
	import Settings from "lucide-svelte/icons/settings";
	
	
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

		await signOut();
		if (response.ok) {
			console.log('Logged out successfully, redirecting...');
			goto('/login');
		} else {
			const { error } = await response.json();
			console.error('Error signing out:', error);
		}
	}

	let isDropdownOpen = false;
	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
		console.log('Dropdown toggle clicked:', isDropdownOpen);
	}
</script>

<ModeWatcher />

<nav
	class="border-0 absolute inset-0 flex items-center justify-between px-8 py-8 shadow-input dark:border-white/[0.2] bg-white dark:bg-black"
>
	<img src={Logo} alt="Logo" class="h-10 mr-auto">
	<div class="flex-grow flex justify-center space-x-10">
		<slot />
	</div>
	<div class="flex space-x-4 items-center">
	<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder on:click={toggleDropdown}>
    <Button builders={[builder]} variant="outline">
      <User class="h-6 w-6 text-gray-700 dark:text-white" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-48 bg-white dark:bg-black shadow-md rounded-md">
	<DropdownMenu.Item class="flex items-center text-gray-800 dark:text-white">
		<Settings class="mr-2 h-4 w-4" />
		<span>Profile Settings</span>
	  </DropdownMenu.Item>
    <DropdownMenu.Item on:click={handleSignOut} class="flex items-center text-gray-800 dark:text-white">
      <LogOut class="mr-2 h-4 w-4" />
      <span>Log out</span>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} variant="outline" size="icon">
					<Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span class="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item on:click={() => setMode("light")}>Light</DropdownMenu.Item>
				<DropdownMenu.Item on:click={() => setMode("dark")}>Dark</DropdownMenu.Item>
				<DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</nav>
