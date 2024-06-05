<script lang="ts">
  import { NavbarMenu, HoveredLink, MenuItem, ProductItem } from '$lib/components/ui/NavbarMenu';
  let active: string | null = null;
</script>


<header class="relative">
  <div class={'fixed inset-x-0 top-0 z-50 mx-auto max-w'}>
    <NavbarMenu  > 
      <a href="/auth/home" class="text-black transition-colors duration-300 dark:text-white">Home</a>

      <div class="flex items-center"> 
        <MenuItem {active} item="Administration ▼" >
          <div class="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/auth/cons">Environment Management</HoveredLink>
          </div>
        </MenuItem>
      </div>
    </NavbarMenu>
    
  </div>
</header>
