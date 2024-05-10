<script>
  import Header from "$lib/Header.svelte";
  import Footer from '$lib/Footer.svelte';
  import Sidebar from '$lib/Sidebar.svelte';
</script>

<div class="flex flex-col min-h-screen">
  <Header />
  <div class="flex flex-grow">
    <div class="w-64">
      <Sidebar />
    </div>
    <main class="flex-grow">
      <slot />
    </main>
  </div>
  <Footer />
</div>