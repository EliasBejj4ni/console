<script>
  import SabLogo from '$lib/images/sab-logo2.png';
</script>

<header>
  <div class="bg-white text-gray-800 py-2 px-4 flex justify-between items-center">
    <div class="flex items-center space-x-4">
      <img src={SabLogo} alt="SAB Logo" class="h-16"> 
    </div>
    <div class="text-right">
      <div class="text-lg font-semibold mb-1">sabuser</div>
      <div class="flex items-center">
        <button class="text-sm mr-2 hover:underline">My account</button>
        <span class="text-sm text-gray-600">|</span>
        <button class="text-sm ml-2 hover:underline">Log out</button>
      </div>
    </div>
  </div>
  <!-- Green Line -->
  <div style="height: 4px; background-color: #047600;"></div> 

<!-- Navigation Bar -->
<nav style="background-color: #97c00e; color: white;" class="py-1">
  <ul class="flex pl-4">
    <li><a href="" class="hover:underline">JetSab</a></li>
    <li class="ml-4"><a href="" class="hover:underline">Administration</a></li>
    <li class="ml-4"><a href="" class="hover:underline">Environment Management</a></li>
    <li class="ml-4"><a href="" class="hover:underline">Environment Display</a></li>
  </ul>
</nav>
</header>
