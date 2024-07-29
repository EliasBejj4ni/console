<script lang="ts">
  import client from '$lib/apolloClient';
  import { GET_ENV } from '$lib/queries';
  import { DELETE_ENV } from '$lib/mutations';
  import type { Environment } from '$lib/interfaces';
  import { onMount } from 'svelte';
  import { writable, type Writable, get } from 'svelte/store';
  import * as Popover from "$lib/components/ui/popover";
  import { Progress } from '$lib/components/ui/progress';

  // State variables
  export const environments = writable<Environment[]>([]);
  export const selectedEnvironmentId = writable<number | null>(null);

  // Function to load environments
  export const loadEnvironments = async () => {
    try {
      const result = await client.query({
        query: GET_ENV
      });
      environments.set(result.data.console_environment);
    } catch (error) {
      console.error('Error loading environments:', error);
    }
  };

  // Function to select an environment
  export const selectEnvironment = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const env_oid = target.value ? parseInt(target.value) : null;
    selectedEnvironmentId.set(env_oid);
  };

  onMount(() => {
    loadEnvironments();
  });

  let successMessage = writable('');
  let showProgressPopover = writable(false);
  let progressValue = writable(0);

  const deleteEnvironment = async () => {
    const envId = get(selectedEnvironmentId);
    if (envId !== null) {
      const confirmDeletion = confirm('Are you sure you want to delete this environment?');
      if (confirmDeletion) {
        showProgressPopover.set(true);
        progressValue.set(0);
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          progressValue.set(50);
          
          const result = await client.mutate({
            mutation: DELETE_ENV,
            variables: { env_oid: envId }
          });
          await loadEnvironments();
          environments.update(envs => envs.filter(env => env.env_oid !== envId));
          selectedEnvironmentId.set(null);
          
          progressValue.set(100);
          successMessage.set('Environment deleted successfully.');
          console.log('Deleted environment:', result);
        } catch (error) {
          console.error('Error deleting environment:', error);
          successMessage.set('Error deleting environment.');
        }
      }
    }
  };
</script>

<div class="p-4 bg-white dark:bg-gray-800">
  <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Delete Environment</h2>
  <div class="mt-4">
    <label for="environment-selector" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Select Environment to Delete:</label>
    <select
      id="environment-selector"
      on:change={selectEnvironment}
      class="px-3 py-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
    >
      <option value={null}>-- Select an Environment --</option>
      {#each $environments as environment (environment.env_oid)}
        <option value={environment.env_oid}>{environment.env_name}</option>
      {/each}
    </select>
  </div>
  <button 
    on:click={deleteEnvironment} 
    disabled={!$selectedEnvironmentId} 
    class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
    Delete
  </button>

  {#if $showProgressPopover}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="relative p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-3xl w-full max-h-screen overflow-y-auto">
      <button
        class="absolute top-3 right-3 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
        on:click={() => showProgressPopover.set(false)}
      >
        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 class="text-xl font-bold dark:text-gray-300 mb-4">
        {#if $progressValue < 100}
          Deleting Environment...
        {:else}
          Deleting Environment Done!
        {/if}
      </h2>
      <Progress max={100} value={$progressValue} />
      {#if $successMessage}
        <div class="mt-4 text-lg text-gray-800 dark:text-gray-300">{$successMessage}</div>
      {/if}
    </div>
  </div>
{/if}
</div>