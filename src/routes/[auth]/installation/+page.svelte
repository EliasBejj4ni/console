<script lang="ts">
import { writable, type Writable, get } from 'svelte/store';
import client from '$lib/apolloClient';
import { GET_ENV, GET_INSTALLATION_INFO } from '$lib/queries';
import { UPDATE_COMPONENT, UPDATE_INSTALLATION_CONFIGURATION, UPDATE_THREAD_NUMBER } from '$lib/mutations';
import { onMount } from 'svelte';
import type { Environment, InstallationInfo, Component } from '$lib/interfaces';

let threadNumbers: Writable<Record<string, number>> = writable({});
let environments: Writable<Environment[]> = writable([]);
let selectedEnvironmentId: Writable<number | null> = writable(null);
let installationInfo: Writable<InstallationInfo | null> = writable(null);
let serverType = writable('');
let components: Writable<Component[]> = writable([]);
let envName: Writable<string> = writable('');

const loadEnvironments = async () => {
  try {
    const result = await client.query({
      query: GET_ENV
    });
    environments.set(result.data.console_environment);
  } catch (error) {
    console.error('Error loading environments:', error);
  }
};

onMount(() => {
  loadEnvironments();
});

const loadInstallationInfo = async (env_oid: number) => {
  try {
    const result = await client.query({
      query: GET_INSTALLATION_INFO,
      variables: { env_oid }
    });
    if (result.data.console_installationconfiguration.length > 0) {
      const installationData = result.data.console_installationconfiguration[0];
      installationInfo.set(installationData);
      serverType.set(installationData.environment.host_type);
      const allComponents = installationData.applicationparameters.flatMap(appparam => appparam.components);
      components.set(allComponents);
      envName.set(installationData.environment.env_name);

      let newThreadNumbers = {};
      installationData.applicationparameters.forEach(appparam => {
        newThreadNumbers[appparam.infra_type] = appparam.thread_number;
      });
      threadNumbers.set(newThreadNumbers);
    } else {
      installationInfo.set(null);
      serverType.set('');
      components.set([]);
      envName.set('');
      threadNumbers.set({});
    }
  } catch (error) {
    console.error('Error loading installation info:', error);
  }
};

const selectEnvironment = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const env_oid = target.value ? parseInt(target.value) : null;
  selectedEnvironmentId.set(env_oid);
  if (env_oid !== null) {
    await loadInstallationInfo(env_oid);
  } else {
    installationInfo.set(null);
    serverType.set('');
    components.set([]);
    envName.set('');
  }
};

const updateComponent = (component_oid: number, event: Event) => {
  const target = event.target as HTMLSelectElement; // Safe casting here
  const newValue = target.value;
  components.update(compList => {
    const updatedComponents = compList.map(comp => {
      if (comp.component_oid === component_oid) {
        return { ...comp, value: newValue };
      }
      return comp;
    });
    return updatedComponents;
  });
};

const updateThreadNumber = (infraType: string, newThreadNumber: number) => {
  threadNumbers.update(current => {
    const updated = { ...current };
    updated[infraType] = newThreadNumber;
    return updated;
  });
};

const saveChanges = async () => {
  const updatedComponents = get(components);
  const integration_thread_number = get(installationInfo)?.integration_thread_number ?? 1;
  const currentThreadNumbers = get(threadNumbers);
  const installationData = get(installationInfo);
  try {

    if (installationData) {
    const { applicationparameters } = installationData;
    for (const appparam of applicationparameters) {
        const newThreadNumber = currentThreadNumbers[appparam.infra_type];
        if (newThreadNumber !== undefined && newThreadNumber !== appparam.thread_number) {
          await client.mutate({
            mutation: UPDATE_THREAD_NUMBER,
            variables: {
              appparam_oid: appparam.appparam_oid,
              thread_number: newThreadNumber
            }
          });
        }
      }
    }
    // Update components
    for (const component of updatedComponents) {
      await client.mutate({
        mutation: UPDATE_COMPONENT,
        variables: {
          component_oid: component.component_oid,
          value: component.value
        }
      });
    }

    // Reflect changes in the local state
    installationInfo.update(info => {
      if (info) {
        return { ...info, integration_thread_number };
      }
      return info;
    });

    components.update(compList => {
      const updatedCompList = compList.map(comp => {
        const updatedComponent = updatedComponents.find(c => c.component_oid === comp.component_oid);
        return updatedComponent ? { ...comp, value: updatedComponent.value } : comp;
      });
      return updatedCompList;
    });
  
    console.log('Save successful');
  } catch (error) {
    console.error('Error saving changes:', error);
  }
};

onMount(() => {
 loadInstallationInfo(get(selectedEnvironmentId) ?? 0);
});

</script>

  <div class="bg-white dark:bg-gray-800 p-4">
        <div class="bg-white dark:bg-gray-800 p-4">
          <div class="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
            <div class="flex items-center space-x-2 flex-grow">
              <label for="environment-selector" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Environment:
              </label>
              <select
              id="environment-selector"
              on:change={selectEnvironment}
              bind:value={$selectedEnvironmentId}
              class="px-3 py-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            >
              <option value={null}>-- Select an Environment --</option>
              {#each $environments as environment}
                <option value={environment.env_oid}>{environment.env_name}</option>
              {/each}
            </select>
            </div>
          </div>
    </div>

    {#if $installationInfo}

      <!-- General Section -->
      <div class="space-y-4 py-4">
        <h1 class="text-xl font-bold text-[#FFAA33]">General</h1>
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Name:</label>
          <input type="text" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" value={$envName} readonly>
        </div>
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Default behavior:</label>
          <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" >
            <option></option>
          </select>
        </div>
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Installation resources:</label>
          <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" >
            <option></option>
          </select>
        </div>
      </div>

      <!-- SAB Digital Exchange Section -->
      <div class="space-y-4 py-4">
        <h1 class="text-xl font-bold text-[#FFAA33]">SAB Digital Exchange</h1>
        <div class="overflow-x-auto mb-6">
          <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
          <div class="flex items-center mb-4">
            <input
            id="thread-max-number-SDE"
            type="number"
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            bind:value={$threadNumbers['SDE']}
            on:input={(e) => updateThreadNumber('SDE', parseInt(e.target.value))}
            min="1"
          /> </div>
          <h2 class="text-lg font-bold mb-2">Components</h2>
          <div class="flex flex-wrap gap-4">
            {#each $installationInfo.applicationparameters as appparam (appparam.appparam_oid)}
              {#if appparam.infra_type === 'SDE'}
                {#each appparam.components as component (component.component_oid)}
                  <div class="flex items-center">
                     <label for={component.type} class="mr-2">{component.type}:</label>
                     <select
                     id={component.type}
                     class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                     value={component.value}
                     on:change={(e) => updateComponent(component.component_oid, e)}
                   >
                     <option value="Automatic installation">Automatic installation</option>
                     <option value="Ignore">Ignore</option>
                     <option value="Manual installation">Manual installation</option>
                   </select>
                  </div>
                {/each}
              {/if}
            {/each}
          </div>
        </div>
      </div>
  
      <!-- Host Section -->
      <div class="space-y-4 py-4">
      <h1 class="text-xl font-bold text-[#FFAA33]">Host</h1>
      <div class="overflow-x-auto mb-6">
        <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
        <div class="flex items-center mb-4">
          <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
          <input
          id="thread-max-number-host"
          type="number"
          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
          bind:value={$threadNumbers['Host']}
          on:input={(e) => updateThreadNumber('Host', parseInt(e.target.value))}
          min="1"
        />  </div>
        <h2 class="text-lg font-bold mb-2">Components</h2>
        <div class="grid grid-cols-3 gap-4">
          {#each $installationInfo.applicationparameters as appparam (appparam.appparam_oid)}
            {#if appparam.infra_type === 'Host'}
              {#each appparam.components as component (component.component_oid)}
                <div class="flex items-center">
                   <label for={component.type} class="mr-2">{component.type}:</label>
            <select
              id={component.type}
              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              value={component.value}
              on:change={(e) => updateComponent(component.component_oid, e)}
            >
              <option value="Automatic installation">Automatic installation</option>
              <option value="Ignore">Ignore</option>
              <option value="Manual installation">Manual installation</option>
            </select>
                </div>
              {/each}
            {/if}
          {/each}
        </div>
      </div>
      </div>
    
      <!-- FlowMind Server Section -->
      <div class="space-y-4 py-4">
        <h1 class="text-xl font-bold text-[#FFAA33]">FlowMind Server</h1>
        <div class="overflow-x-auto mb-6">
          <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
          <div class="flex items-center mb-4">
            <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
            <input
            id="thread-max-number-flowmind"
            type="number"
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            bind:value={$threadNumbers['FlowmindServer']}
            on:input={(e) => updateThreadNumber('FlowmindServer', parseInt(e.target.value))}
            min="1"
          /> </div>
          <h2 class="text-lg font-bold mb-2">Components</h2>
          <div class="flex flex-wrap gap-4">
            {#each $installationInfo.applicationparameters as appparam (appparam.appparam_oid)}
            {#if appparam.infra_type === 'FlowmindServer'}
              {#each appparam.components as component (component.component_oid)}
                <div class="flex items-center">
                   <label for={component.type} class="mr-2">{component.type}:</label>
            <select
              id={component.type}
              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              value={component.value}
              on:change={(e) => updateComponent(component.component_oid, e)}
            >
              <option value="Automatic installation">Automatic installation</option>
              <option value="Ignore">Ignore</option>
              <option value="Manual installation">Manual installation</option>
            </select>
                </div>
              {/each}
            {/if}
          {/each}
          </div>
        </div>
      </div>
    
      <!-- Console Locale Section -->
      <div class="space-y-4 py-4">
        <h1 class="text-xl font-bold text-[#FFAA33]">Console Locale</h1>
        <div class="overflow-x-auto mb-6">
          <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
          <div class="flex items-center mb-4">
            <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
            <input
            id="thread-max-number-console"
            type="number"
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            bind:value={$threadNumbers['ConsoleLocale']}
            on:input={(e) => updateThreadNumber('ConsoleLocale', parseInt(e.target.value))}
            min="1"
          />   </div>
          <h2 class="text-lg font-bold mb-2">Components</h2>
          <div class="flex flex-wrap gap-4">
            {#each $installationInfo.applicationparameters as appparam (appparam.appparam_oid)}
            {#if appparam.infra_type === 'ConsoleLocale'}
              {#each appparam.components as component (component.component_oid)}
                <div class="flex items-center">
                   <label for={component.type} class="mr-2">{component.type}:</label>
            <select
              id={component.type}
              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              value={component.value}
              on:change={(e) => updateComponent(component.component_oid, e)}
            >
              <option value="Automatic installation">Automatic installation</option>
              <option value="Ignore">Ignore</option>
              <option value="Manual installation">Manual installation</option>
            </select>
                </div>
              {/each}
            {/if}
          {/each}
          </div>
        </div>
      </div>
    
      <!-- SAB Unix Section -->
      <div class="space-y-4 py-4">
        <h1 class="text-xl font-bold text-[#FFAA33]">SAB Unix</h1>
        <div class="overflow-x-auto mb-6">
          <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
          <div class="flex items-center mb-4">
            <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
            <input
            id="thread-max-number-sabunix"
            type="number"
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            bind:value={$threadNumbers['SabUnix']}
            on:input={(e) => updateThreadNumber('SabUnix', parseInt(e.target.value))}
            min="1"
          /> </div>
          <h2 class="text-lg font-bold mb-2">Components</h2>
          <div class="flex flex-wrap gap-4">
            {#each $installationInfo.applicationparameters as appparam (appparam.appparam_oid)}
            {#if appparam.infra_type === 'SabUnix'}
              {#each appparam.components as component (component.component_oid)}
                <div class="flex items-center">
                   <label for={component.type} class="mr-2">{component.type}:</label>
            <select
              id={component.type}
              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              value={component.value}
              on:change={(e) => updateComponent(component.component_oid, e)}
            >
              <option value="Automatic installation">Automatic installation</option>
              <option value="Ignore">Ignore</option>
              <option value="Manual installation">Manual installation</option>
            </select>
                </div>
              {/each}
            {/if}
          {/each}
          </div>
        </div>
      </div>
    
      <!-- Web Services Section -->
      <div class="space-y-4 py-4">
        <h1 class="text-xl font-bold text-[#FFAA33]">Web Services</h1>
        <div class="overflow-x-auto mb-6">
          <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
          <div class="flex items-center mb-4">
            <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
            <input
            id="thread-max-number-webservice"
            type="number"
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            bind:value={$threadNumbers['WebServices']}
            on:input={(e) => updateThreadNumber('WebServices', parseInt(e.target.value))}
            min="1"
          /> </div>
          <h2 class="text-lg font-bold mb-2">Components</h2>
          <div class="flex flex-wrap gap-4">
            {#each $installationInfo.applicationparameters as appparam (appparam.appparam_oid)}
            {#if appparam.infra_type === 'WebServices'}
              {#each appparam.components as component (component.component_oid)}
                <div class="flex items-center">
                   <label for={component.type} class="mr-2">{component.type}:</label>
            <select
              id={component.type}
              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              value={component.value}
              on:change={(e) => updateComponent(component.component_oid, e)}
            >
              <option value="Automatic installation">Automatic installation</option>
              <option value="Ignore">Ignore</option>
              <option value="Manual installation">Manual installation</option>
            </select>
                </div>
              {/each}
            {/if}
          {/each}
          </div>
        </div>
      </div>
    
      <!-- X3 Section -->
      <div class="space-y-4 py-4">
        <h1 class="text-xl font-bold text-[#FFAA33]">X3</h1>
        <div class="overflow-x-auto mb-6">
          <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
          <div class="flex items-center mb-4">
            <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
            <input
            id="thread-max-number-x3"
            type="number"
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            bind:value={$threadNumbers['X3']}
            on:input={(e) => updateThreadNumber('X3', parseInt(e.target.value))}
            min="1"
          />  </div>
          <h2 class="text-lg font-bold mb-2">Components</h2>
          <div class="flex flex-wrap gap-4">
            {#each $installationInfo.applicationparameters as appparam (appparam.appparam_oid)}
            {#if appparam.infra_type === 'X3'}
              {#each appparam.components as component (component.component_oid)}
                <div class="flex items-center">
                   <label for={component.type} class="mr-2">{component.type}:</label>
            <select
              id={component.type}
              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              value={component.value}
              on:change={(e) => updateComponent(component.component_oid, e)}
            >
              <option value="Automatic installation">Automatic installation</option>
              <option value="Ignore">Ignore</option>
              <option value="Manual installation">Manual installation</option>
            </select>
                </div>
              {/each}
            {/if}
          {/each}
          </div>
        </div>
      </div>
    
      <!-- X3S Section -->
      <div class="space-y-4 py-4">
          <h1 class="text-xl font-bold text-[#FFAA33]">X3S</h1>
          <div class="overflow-x-auto mb-6">
            <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
            <div class="flex items-center mb-4">
              <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
              <input
            id="thread-max-number-x3s"
            type="number"
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            bind:value={$threadNumbers['X3S']}
            on:input={(e) => updateThreadNumber('X3S', parseInt(e.target.value))}
            min="1"
          /></div>
            <h2 class="text-lg font-bold mb-2">Components</h2>
            <div class="grid grid-cols-3 gap-4">
              {#each $installationInfo.applicationparameters as appparam (appparam.appparam_oid)}
              {#if appparam.infra_type === 'X3S'}
                {#each appparam.components as component (component.component_oid)}
                  <div class="flex items-center">
                     <label for={component.type} class="mr-2">{component.type}:</label>
              <select
                id={component.type}
                class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                value={component.value}
                on:change={(e) => updateComponent(component.component_oid, e)}
              >
                <option value="Automatic installation">Automatic installation</option>
                <option value="Ignore">Ignore</option>
                <option value="Manual installation">Manual installation</option>
              </select>
                  </div>
                {/each}
              {/if}
            {/each}
            </div>
          </div>
        </div>
    
      <!-- YourPortalBanker Section -->
      <div class="space-y-4 py-4">
        <h1 class="text-xl font-bold text-[#FFAA33]">YourPortalBanker (Application)</h1>
        <div class="overflow-x-auto mb-6">
          <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
          <div class="flex items-center mb-4">
              <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
              <input
              id="thread-max-number-yourportalbanker"
              type="number"
              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              bind:value={$threadNumbers['YourPortalBanker']}
              on:input={(e) => updateThreadNumber('YourPortalBanker', parseInt(e.target.value))}
              min="1"
            /> </div>
            <h2 class="text-lg font-bold mb-2">Components</h2>
            <div class="flex flex-wrap gap-4">
              {#each $installationInfo.applicationparameters as appparam (appparam.appparam_oid)}
              {#if appparam.infra_type === 'YourPortalBanker'}
                {#each appparam.components as component (component.component_oid)}
                  <div class="flex items-center">
                     <label for={component.type} class="mr-2">{component.type}:</label>
              <select
                id={component.type}
                class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                value={component.value}
                on:change={(e) => updateComponent(component.component_oid, e)}
              >
                <option value="Automatic installation">Automatic installation</option>
                <option value="Ignore">Ignore</option>
                <option value="Manual installation">Manual installation</option>
              </select>
                  </div>
                {/each}
              {/if}
            {/each}
            </div>
            </div>
          </div>
  
      <!-- YourPortalCustomer Section -->
      <div class="space-y-4 py-4">
            <h1 class="text-xl font-bold text-[#FFAA33]">YourPortalCustomer (Application)</h1>
            <div class="overflow-x-auto mb-6">
              <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
              <div class="flex items-center mb-4">
                  <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
                  <input
                  id="thread-max-number-yourportalcustomer"
                  type="number"
                  class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                  bind:value={$threadNumbers['YourPortalCustomer']}
                  on:input={(e) => updateThreadNumber('YourPortalCustomer', parseInt(e.target.value))}
                  min="1"
                /> </div>
              <h2 class="text-lg font-bold mb-2">Components</h2>
              <div class="flex flex-wrap gap-4">
                {#each $installationInfo.applicationparameters as appparam (appparam.appparam_oid)}
                {#if appparam.infra_type === 'YourPortalCustomer'}
                  {#each appparam.components as component (component.component_oid)}
                    <div class="flex items-center">
                       <label for={component.type} class="mr-2">{component.type}:</label>
                <select
                  id={component.type}
                  class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                  value={component.value}
                  on:change={(e) => updateComponent(component.component_oid, e)}
                >
                  <option value="Automatic installation">Automatic installation</option>
                  <option value="Ignore">Ignore</option>
                  <option value="Manual installation">Manual installation</option>
                </select>
                    </div>
                  {/each}
                {/if}
              {/each}
              </div>
            </div>
      </div>
  
        <!-- Validate Cancel Section -->
      <div class="bg-white dark:bg-gray-800 p-4 mt-4">
            <div class="flex justify-start items-center space-x-4">
              <button  on:click={saveChanges} class="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm">
                Validate
              </button>
              <button class="bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                Cancel
              </button>
            </div>
      </div>
      {/if}
      </div>
  