<script lang="ts">
  import "../../app.pcss";
  import { ModeWatcher } from "mode-watcher";
  import { Button } from "$lib/components/ui/button/index.js";
  import { resetMode, setMode } from "mode-watcher";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import Sun from "svelte-radix/Sun.svelte";
  import Moon from "svelte-radix/Moon.svelte";
  import { page } from '$app/stores';

  let sessionData = $page.data.session;
  
</script>
<ModeWatcher />

<!-- {#if sessionData} -->
    <div class="hidden lg:flex navbar bg-base-100 w-full">
      <div class="navbar-start flex-1 px-4">
        <a class="btn btn-ghost normal-case text-xl" href="/auth/home">Console</a>
      </div>
      <div class="navbar-center flex-auto text-center">
        <ul class="menu menu-horizontal p-0 inline-flex justify-center flex-grow">
          <li class="mx-2">
            <a href="/auth/home" class="hover:text-blue-500 transition-colors">Home</a>
          </li>
          <li class="mx-2">
            <a href="/about" class="hover:text-blue-500 transition-colors">About</a>
          </li>
        </ul>
      </div>
      <div class="navbar-end flex-1 px-4 flex justify-end items-center">
        <a class="btn mr-2">logout</a>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild let:builder>
            <Button builders={[builder]} variant="outline" size="icon">
              <Sun
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <Moon
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              />
              <span class="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item on:click={() => setMode("light")}>
              Light</DropdownMenu.Item>
            <DropdownMenu.Item on:click={() => setMode("dark")}>Dark</DropdownMenu.Item>
            <DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
<!-- {/if} -->
