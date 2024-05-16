<script lang="ts">
    import * as Popover from "$lib/components/ui/popover";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import * as Table from "$lib/components/ui/table/index.js";
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import { GET_ENVIRONMENT, GET_ENVIRONMENTS_INFO, GET_ENVIRONMENT_INFO_BY_ID } from '$lib/queries';
    import client from '$lib/apolloClient';
    import { CREATE_ENVIRONMENT, DELETE_ENVIRONMENT_AND_INFO, UPDATE_ENVIRONMENT, CREATE_ENVIRONMENT_INFO, UPDATE_ENVIRONMENT_INFO } from '$lib/mutations';
    import { writable } from 'svelte/store';
    import { Button } from "$lib/components/ui/button/";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Tabs from "$lib/components/ui/tabs";

    interface Environment {
    id: number;
    environment_name: string;
}

    interface EnvironmentInfo {
        id: string;
        name: string;
        context: string;
        blockInstallations: boolean;
        probeName: string;
        probeType: string;
        probeAuthentication: string;
        environmentId: number | null;
}
    
    export let data: PageData;
    // let environments: any = data.props.environments; 
    let selectedPrismaEnvironmentId = writable<number | null>(null);
    let currentPrismaEnvironmentName = writable('');
    
    let popoverOpen: boolean = false;
    function togglePopover() {
        popoverOpen = !popoverOpen;
        if (popoverOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto'; 
        }
    }
    
    let hasuraEnvironments = writable<Environment[]>([]);
    
    let selectedEnvironmentId = writable<number | null>(null);
    let selectedDuplicateEnvId = writable<number | null>(null);
    let newEnvironmentName = writable('');
    let currentEnvironmentName = writable('');
    
    let environmentsInfo = writable<EnvironmentInfo[]>([]);
    let selectedInfo = writable<EnvironmentInfo>({
    id: '',
    name: '',
    context: '',
    blockInstallations: false,
    probeName: '',
    probeType: '',
    probeAuthentication: '',
    environmentId: null 
});
    
    onMount(async () => {
        try {
            const { data } = await client.query({
                query: GET_ENVIRONMENT
            });
            console.log(data.environment, ">>>>>>>>>>>>>>>>>>>>>>>>");
            hasuraEnvironments.set(data.environment);
        } catch (error) {
            console.error("Error fetching environments:", error);
        }
    });
    
    onMount(async () => {
        try {
            const { data } = await client.query({
                query: GET_ENVIRONMENTS_INFO
            });
            console.log("Fetched environments info:", data.environments_info);
            hasuraEnvironments.set(data.environments_info.map((item: any) => ({
                id: item.environment.id,
                environment_name: item.environment.environment_name
            })));
        } catch (error) {
            console.error("Error fetching environments info:", error);
        }
    });

    $: if ($selectedEnvironmentId) {
    console.log("Selected Environment ID changed:", $selectedEnvironmentId);
    loadEnvironmentInfo($selectedEnvironmentId);
}

    
async function loadEnvironmentInfo(environmentId: number) {
        console.log("Loading environment info for ID:", environmentId);
        try {
            const { data } = await client.query({
                query: GET_ENVIRONMENT_INFO_BY_ID,
                variables: { id: environmentId }
            });
            const foundInfo = data.environments_info.find((info: any) => info.environment_id === environmentId);
            console.log("Fetched environment info:", foundInfo);

            if (foundInfo) {
                selectedInfo.set({
                    ...foundInfo,
                    blockInstallations: foundInfo.block_installations,
                    environmentId: foundInfo.environment_id,
                    probeName: foundInfo.probe_name,
                    probeType: foundInfo.probe_type,
                    probeAuthentication: foundInfo.probe_authentication,
                });
            } else {
                selectedInfo.set({
                    id: '',
                    name: '',
                    context: '',
                    blockInstallations: false,
                    probeName: '',
                    probeType: '',
                    probeAuthentication: '',
                    environmentId: environmentId
                });
            }
        } catch (error) {
            console.error("Error fetching environment details:", error);
        }
    }
    
    let errorMessage = writable('');
    
    async function addEnvironment() {
    const name = $newEnvironmentName;
    if (!name || name.trim() === '') {
        console.error('Environment name is required.');
        errorMessage.set('Environment name is required.');
        return;
    }
    try {
        const { data } = await client.mutate({
            mutation: CREATE_ENVIRONMENT,
            variables: {
                environmentName: name
            }
        });
        console.log('Environment created:', data.insert_environment.returning);
        newEnvironmentName.set('');
        errorMessage.set('');

        const newEnvironment = data.insert_environment.returning[0];

        // Update the hasuraEnvironments store
        hasuraEnvironments.update(currentEnvironments => [...currentEnvironments, newEnvironment]);

        // Update selectedInfo with the new environment ID
        selectedInfo.update(info => ({
            ...info,
            environmentId: newEnvironment.id,
        }));

        selectedEnvironmentId.set(newEnvironment.id); // Set the selected environment ID

    } catch (error) {
        console.error('Error creating environment:', error);
        errorMessage.set('Failed to create environment.');
    }
}
    
async function saveEnvironmentInfo() {
    const info = $selectedInfo;

    console.log("Saving environment info:", {
        id: info.id,
        name: info.name,
        context: info.context,
        blockInstallations: info.blockInstallations,
        probe_name: info.probeName,
        probe_type: info.probeType,
        probe_authentication: info.probeAuthentication,
        environmentId: info.environmentId
    });

    if (info.id) {
        try {
            const { data } = await client.mutate({
                mutation: UPDATE_ENVIRONMENT_INFO,
                variables: {
                    id: info.id,
                    name: info.name,
                    context: info.context,
                    blockInstallations: info.blockInstallations || false,
                    probeName: info.probeName,
                    probeType: info.probeType,
                    probeAuthentication: info.probeAuthentication,
                }
            });
            console.log('Environment info updated:', data.update_environments_info_by_pk);
            // Update local state
            environmentsInfo.update(envs =>
                envs.map(env => env.id === info.id ? {...env, ...data.update_environments_info_by_pk} : env)
            );
        } catch (error) {
            console.error('Error updating environment info:', error);
        }
    } else {
        try {
            const { data } = await client.mutate({
                mutation: CREATE_ENVIRONMENT_INFO,
                variables: {
                    environmentId: info.environmentId, // Ensure environmentId is passed
                    name: info.name,
                    context: info.context,
                    blockInstallations: info.blockInstallations || false,
                    probeName: info.probeName,
                    probeType: info.probeType,
                    probeAuthentication: info.probeAuthentication
                }
            });
            console.log('Environment info created:', data.insert_environments_info.returning);
            // Update local state with new data
            environmentsInfo.update(envs => [...envs, ...data.insert_environments_info.returning]);
            selectedInfo.set(data.insert_environments_info.returning[0]);
        } catch (error) {
            console.error('Error creating environment info:', error);
        }
    }
}
async function deleteEnvironment() {
        const id = $selectedEnvironmentId;
        if (id) {
            try {
                await client.mutate({
                    mutation: DELETE_ENVIRONMENT_AND_INFO,
                    variables: { id },
                    update: (cache) => {
                        cache.evict({ id: cache.identify({
                            __typename: 'environment',
                            id
                        })});
                    }
                });
                
                hasuraEnvironments.update(currentEnvironments => {
                    return currentEnvironments.filter(env => env.id !== id);
                });
                selectedEnvironmentId.set(null);
            } catch (error) {
                console.error("Error deleting environment and its info:", error);
            }
        }
    }
    
async function updateEnvironment() {
    const id = $selectedEnvironmentId;
    const name = $currentEnvironmentName;
    if (id && name) {
        try {
            const { data } = await client.mutate({
                mutation: UPDATE_ENVIRONMENT,
                variables: { id, environmentName: name }
            });
            console.log('Environment updated:', data.update_environment_by_pk);
            hasuraEnvironments.update(currentEnvironments => {
                return currentEnvironments.map(env =>
                    env.id === id ? { ...env, environment_name: name } : env
                );
            });

            currentEnvironmentName.set('');
            selectedEnvironmentId.set(null);
        } catch (error) {
            console.error('Error updating environment:', error);
        }
    }
}
    
function selectEnvironment(event: Event) {
        const select = event.target as HTMLSelectElement;
        const id = parseInt(select.value, 10);
        selectedEnvironmentId.set(isNaN(id) ? null : id);
        if (!isNaN(id)) {
            loadEnvironmentInfo(id);
        } else {
            selectedInfo.set({
                id: '',
                name: '',
                context: '',
                blockInstallations: false,
                probeName: '',
                probeType: '',
                probeAuthentication: '',
                environmentId: null
            });
        }
    }
    
    function updateHasuraEnvironments(newData: any) {
    hasuraEnvironments.update(currentEnvironments => {
        return [...currentEnvironments, newData];
    });
}


async function duplicateEnvironment() {
    console.log('Starting duplication process...');
    if ($selectedDuplicateEnvId && $newEnvironmentName.trim() !== '') {
        console.log('Fetching details for environment ID:', $selectedDuplicateEnvId);
        try {
            // Fetch details of the environment to be duplicated
            const detailResponse = await client.query({
                query: GET_ENVIRONMENT_INFO_BY_ID,
                variables: { id: $selectedDuplicateEnvId }
            });
            const environmentDetails = detailResponse.data.environments_info[0];
            console.log('Environment details fetched:', environmentDetails);

            if (environmentDetails) {
                // Create a new environment
                console.log('Creating new environment with name:', $newEnvironmentName);

                const newEnvResponse = await client.mutate({
                    mutation: CREATE_ENVIRONMENT,
                    variables: {
                        environmentName: $newEnvironmentName
                    }
                    
                });
                const newEnvironment = newEnvResponse.data.insert_environment.returning[0];
                console.log('New environment created:', newEnvironment);
                if (newEnvironment) {
                    const { data } = await client.mutate({
                        mutation: CREATE_ENVIRONMENT_INFO,
                        variables: {
                            environmentId: newEnvironment.id,
                            name: environmentDetails.name,
                            context: environmentDetails.context,
                            blockInstallations: environmentDetails.block_installations,
                            probeName: environmentDetails.probe_name,
                            probeType: environmentDetails.probe_type,
                            probeAuthentication: environmentDetails.probe_authentication
                        }
                    });
                    console.log('Duplicated environment info created:', data.insert_environments_info.returning);

               
                    updateHasuraEnvironments({
                        id: newEnvironment.id,
                        environment_name: $newEnvironmentName,
                        details: data.insert_environments_info.returning[0]
                    });
                    selectedInfo.set({...data.insert_environments_info.returning[0]});

                    newEnvironmentName.set('');
                    selectedDuplicateEnvId.set(null);
                }
            } else {
                console.error('No details found for selected environment, duplication cannot proceed.');
            }
        } catch (error) {
            console.error('Error duplicating environment:', error);
        }
    } else {
        console.error('Missing environment name or no environment selected for duplication.');
    }
}

$: if (hasuraEnvironments) {
    console.log('Environments updated:', hasuraEnvironments);
}

    </script>
    
    <div class="bg-white border-0 border-gray-300 p-0 ml-0 flex-grow dark:bg-black">
        <div class="bg-white border-0 p-0 ml-0 flex-grow">
            <div class="p-1 flex items-center dark:bg-black">
                <h2 class="text-black font-bold dark:text-white">Environment Configuration</h2>
            </div>
        </div>
        <Tabs.Root value="display" class="w-full ">
            <Tabs.List class="grid w-full grid-cols-4 ">
              <Tabs.Trigger value="display">Display</Tabs.Trigger>
              <Tabs.Trigger value="create">Create</Tabs.Trigger>
              <Tabs.Trigger value="edit">Edit</Tabs.Trigger>
              <Tabs.Trigger value="delete">Delete</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="display">
                <div class="bg-white dark:bg-gray-800 p-4">
                  <div class="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div class="flex items-center space-x-2 flex-grow">
                      <label for="environment-selector" class="text-sm font-medium text-gray-700 dark:text-gray-300">Select Environment Hasura :</label>
                      <select id="environment-selector" bind:value={$selectedEnvironmentId} on:change={selectEnvironment} class="px-3 py-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                        <option value={null}>-- Select an Environment --</option>
                        {#each $hasuraEnvironments as environment}
                          <option value={environment.id}>{environment.environment_name}</option>
                        {/each}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div class="text-gray-700 dark:text-gray-300 text-sm py-2">
                      Last change the date time by user
                      <br>
                      State of referencing: referencing state value
                    </div>
                    <div class="space-y-1 py-0">
                      <h1 class="text-xl font-bold text-[#FFAA33]">General</h1>
                      <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Name :</label>
                        <input type="text" bind:value={$selectedInfo.name} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" readonly>
                      </div>
                      <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Context:</label>
                        <input type="text" bind:value={$selectedInfo.context} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" readonly>
                      </div>
                      <div class="flex items-center">
                        <label for="block-installations" class="text-gray-700 dark:text-gray-300 w-1/4">Block installations:</label>
                        <Checkbox id="block-installations" class="align-middle transform scale-100" disabled={true} bind:checked={$selectedInfo.blockInstallations} />
                      </div>
                    </div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 p-0 mt-4">
                    <h1 class="text-xl font-bold text-[#FFAA33] mb-4">CORE Probes</h1>
                    <div class="overflow-x-auto mb-6">
                      <table class="min-w-full text-xs divide-y divide-gray-200 dark:divide-gray-700 border border-gray-300 dark:border-gray-700">
                        <thead class="bg-gray-400 dark:bg-gray-700 text-white">
                          <tr>
                            <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300 dark:border-gray-700">Test</th>
                            <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300 dark:border-gray-700">Name</th>
                            <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300 dark:border-gray-700">Type</th>
                            <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300 dark:border-gray-700">Authentication</th>
                            <th scope="col" class="px-3 py-2 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          <tr>
                            <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">
                              <button class="bg-blue-400 dark:bg-blue-600 text-white px-2 py-1 rounded" disabled>Test</button>
                            </td>
                            <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">{$selectedInfo.probeName}</td>
                            <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">{$selectedInfo.probeType}</td>
                            <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">{$selectedInfo.probeAuthentication}</td>
                            <td class="px-3 py-2">
                              <Popover.Root>
                                <Popover.Trigger class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 font-medium rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                  Display
                                </Popover.Trigger>
                                {#if popoverOpen}
                                  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div class="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-4xl w-full">
                                      <button class="absolute top-3 right-3 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400" on:click={togglePopover}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                      <h2 class="text-lg font-bold dark:text-gray-300" style="font-size: 16px;">CORE Probe</h2>
                                      <div class="font-bold underline text-[#FFAA33] mt-4" style="font-size: 16px;">General Information</div>
                                      <div class="grid grid-cols-3 gap-4 mt-2 items-center">
                                        <div>
                                          <label class="text-gray-700 dark:text-gray-300">Core name :</label>
                                          <input type="text" value={$selectedInfo.probeName} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" readonly />
                                        </div>
                                        <div>
                                          <label class="text-gray-700 dark:text-gray-300">Type :</label>
                                          <select class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled>
                                            <option>{$selectedInfo.probeType}</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                {/if}
                              </Popover.Root>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 p-4 mt-4">
                    <div class="flex flex-col">
                      <div class="flex items-center gap-3 mb-2">
                        <button class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">Test</button>
                        <h1 class="text-xl font-bold text-[#FFAA33]">Mailbox</h1>
                      </div>
                      <h2 class="text-lg font-bold text-[#FFAA33] underline">Integration :</h2>
                    </div>
                    <div class="space-y-1 py-0">
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Server name :</label>
                        <input type="text" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" readonly>
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                        <input type="text" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                        <input type="password" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" readonly>
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Authentication type:</label>
                        <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled>
                          <option></option>
                        </select>
                      </div>
                    </div>
                    <h2 class="text-lg font-bold text-[#FFAA33] underline mt-4">File Transfers :</h2>
                    <div class="space-y-1 py-0">
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                        <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled>
                          <option></option>
                        </select>
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                        <input type="text" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" readonly>
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                        <input type="password" value="password" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled>
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Server name:</label>
                        <input type="text" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" readonly>
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Mode:</label>
                        <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled>
                          <option></option>
                        </select>
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                        <input type="text" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" readonly>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs.Content>
              
              <Tabs.Content value="create">
                <div class="p-4 bg-white dark:bg-gray-800">
                  <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Create New Environment</h2>
                  <div class="mt-4">
                    <label for="new-environment-name" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Name:</label>
                    <input id="new-environment-name" type="text" bind:value={$newEnvironmentName} class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300" placeholder="Enter New Environment Name">
                  </div>
                  {#if $errorMessage}
                    <p class="text-red-500 dark:text-red-400 mt-2">{$errorMessage}</p>
                  {/if}
                  <div class="mt-4">
                    <label for="environment-selector" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Select Environment to duplicate:</label>
                    <select id="environment-selector" bind:value={$selectedDuplicateEnvId} class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300">
                      <option value={null}>-- Select an Environment --</option>
                      {#each $hasuraEnvironments as environment}
                        <option value={environment.id}>{environment.environment_name}</option>
                      {/each}
                    </select>
                  </div>
                  <button on:click={$selectedDuplicateEnvId ? duplicateEnvironment : addEnvironment} class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {$selectedDuplicateEnvId ? 'Duplicate' : 'Create'}
                  </button>
                </div>
              </Tabs.Content>
              
            <Tabs.Content value="edit">
                <div class="bg-white dark:bg-gray-800 p-4">
                  <div class="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div class="flex items-center space-x-2 flex-grow">
                      <label for="environment-selector" class="text-sm font-medium text-gray-700 dark:text-gray-300">Select Environment Hasura :</label>
                      <select id="environment-selector" bind:value={$selectedEnvironmentId} on:change={selectEnvironment} class="px-3 py-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        <option value={null}>-- Select an Environment --</option>
                        {#each $hasuraEnvironments as environment}
                          <option value={environment.id}>{environment.environment_name}</option>
                        {/each}
                      </select>
                    </div>
                  </div>
                </div>
                <div class="bg-white dark:bg-gray-800 p-4 shadow-md mt-4">
                  <div class="text-gray-700 dark:text-gray-300 text-sm py-2">
                    Last change the date time by user
                    <br>
                    State of referencing: referencing state value
                  </div>
                  <div class="space-y-1 py-0">
                    <h1 class="text-xl font-bold text-[#FFAA33]">General</h1>
                    <div class="flex items-center">
                      <label class="text-gray-700 dark:text-gray-300 w-1/4">Name :</label>
                      <input type="text" bind:value={$selectedInfo.name} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                    </div>
                    <div class="flex items-center">
                      <label class="text-gray-700 dark:text-gray-300 w-1/4">Context:</label>
                      <input type="text" bind:value={$selectedInfo.context} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                    </div>
                    <div class="flex items-center">
                      <label for="block-installations" class="text-gray-700 dark:text-gray-300 w-1/4">Block installations:</label>
                      <Checkbox id="block-installations" class="align-middle transform scale-100" disabled={false} bind:checked={$selectedInfo.blockInstallations} />
                    </div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 p-0 mt-4">
                    <h1 class="text-xl font-bold text-[#FFAA33] mb-4">CORE Probes</h1>
                    <div class="overflow-x-auto mb-6">
                      <table class="min-w-full text-xs divide-y divide-gray-200 dark:divide-gray-700 border border-gray-300 dark:border-gray-700">
                        <thead class="bg-gray-400 dark:bg-gray-700 text-white">
                          <tr>
                            <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300 dark:border-gray-700">Test</th>
                            <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300 dark:border-gray-700">Name</th>
                            <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300 dark:border-gray-700">Type</th>
                            <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300 dark:border-gray-700">Authentication</th>
                            <th scope="col" class="px-3 py-2 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          <tr>
                            <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">
                              <button class="bg-blue-400 dark:bg-blue-600 text-white px-2 py-1 rounded" disabled>Test</button>
                            </td>
                            <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">{$selectedInfo.probeName}</td>
                            <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">{$selectedInfo.probeType}</td>
                            <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">{$selectedInfo.probeAuthentication}</td>
                            <td class="px-3 py-2">
                              <Popover.Root>
                                <Popover.Trigger class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 font-medium rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                  Display
                                </Popover.Trigger>
                                {#if popoverOpen}
                                  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div class="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-4xl w-full">
                                      <button class="absolute top-3 right-3 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400" on:click={togglePopover}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                      <h2 class="text-lg font-bold dark:text-gray-300" style="font-size: 16px;">CORE Probe</h2>
                                      <div class="font-bold underline text-[#FFAA33] mt-4" style="font-size: 16px;">General Information</div>
                                      <div class="grid grid-cols-3 gap-4 mt-2 items-center">
                                        <div>
                                          <label class="text-gray-700 dark:text-gray-300">Core name :</label>
                                          <input type="text" value={$selectedInfo.probeName} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                                        </div>
                                        <div>
                                          <label class="text-gray-700 dark:text-gray-300">Type :</label>
                                          <select class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full">
                                            <option>{$selectedInfo.probeType}</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                {/if}
                              </Popover.Root>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 p-4 mt-4">
                    <div class="flex flex-col">
                      <div class="flex items-center gap-3 mb-2">
                        <button class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">Test</button>
                        <h1 class="text-xl font-bold text-[#FFAA33]">Mailbox</h1>
                      </div>
                      <h2 class="text-lg font-bold text-[#FFAA33] underline">Integration :</h2>
                    </div>
                    <div class="space-y-1 py-0">
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Server name :</label>
                        <input type="text" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                        <input type="text" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                        <input type="password" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Authentication type:</label>
                        <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                          <option></option>
                        </select>
                      </div>
                    </div>
                    <h2 class="text-lg font-bold text-[#FFAA33] underline mt-4">File Transfers :</h2>
                    <div class="space-y-1 py-0">
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                        <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                          <option></option>
                        </select>
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                        <input type="text" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                        <input type="password" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Server name:</label>
                        <input type="text" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Mode:</label>
                        <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                          <option></option>
                        </select>
                      </div>
                      <div class="flex items-center justify-start">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                        <input type="text" value="" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                      </div>
                    </div>
                    <button on:click={saveEnvironmentInfo} class="btn-primary bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out">Save Environment Info</button>
                  </div>
                </div>
              </Tabs.Content>
              <Tabs.Content value="delete">
                <div class="p-4 bg-white dark:bg-gray-800">
                  <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Delete Environment</h2>
                  <div class="mt-4">
                    <label for="environment-selector" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Select Environment to Delete:</label>
                    <select id="environment-selector" bind:value={$selectedEnvironmentId} on:change={selectEnvironment} class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300">
                      <option value={null}>-- Select an Environment --</option>
                      {#each $hasuraEnvironments as environment}
                        <option value={environment.id}>{environment.environment_name}</option>
                      {/each}
                    </select>
                  </div>
                  <button on:click={deleteEnvironment} disabled={!$selectedEnvironmentId} class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Delete
                  </button>
                </div>
              </Tabs.Content>              
          </Tabs.Root>

       
    </div>
    
  
