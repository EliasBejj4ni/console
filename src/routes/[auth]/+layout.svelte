<script>
  import Header from "$lib/Header.svelte";
  import Footer from '$lib/Footer.svelte';
  import Sidebar from '$lib/Sidebar.svelte';
  import { onMount } from 'svelte';
</script>

<div class="flex flex-col min-h-screen">
  <Header />
  <div class="flex-grow flex">
    <main class="w-full pt-16 flex-grow">
      <slot />
    </main>
  </div>
  <Footer />
</div>
