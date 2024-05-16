<script>
    import Header from "$lib/Header.svelte";
    import Footer from '$lib/Footer.svelte';
    import Sidebar from '$lib/Sidebar.svelte';
    import { onMount } from 'svelte';
    
  </script>
  
  
    <Header /> 
    <div class="flex flex-grow">
      <main class="w-full pt-16">
        <slot />
      </main>
    </div>
    <Footer />
  