<script lang="ts">
import Etoile from '$lib/images/etoile_sab.png';
import * as Popover from "$lib/components/ui/popover";
import { onMount } from 'svelte';
import type { PageData } from './$types';
import { GET_ENVIRONMENT } from '$lib/queries';
import client from '$lib/apolloClient';
import { CREATE_ENVIRONMENT, DELETE_ENVIRONMENT, UPDATE_ENVIRONMENT  } from '$lib/mutations';
import { writable } from 'svelte/store';

export let data: PageData;
let environments: any = data.props.environments; 
let selectedPrismaEnvironmentId = writable<number | null>(null);
let currentPrismaEnvironmentName = writable('');

$: {
        const selectedEnvironment = environments.find((env: any) => env.id === $selectedPrismaEnvironmentId);
        currentPrismaEnvironmentName.set(selectedEnvironment ? selectedEnvironment.environment_name : '');
    }

function selectPrismaEnvironment(event: Event) {
        const select = event.target as HTMLSelectElement;
        const id = parseInt(select.value, 10);
        selectedPrismaEnvironmentId.set(isNaN(id) ? null : id);
        const selected = environments.find((env: any) => env.id === id);
        currentPrismaEnvironmentName.set(selected ? selected.environment_name : '');
    }

let popoverOpen: boolean = false;
function togglePopover() {
    
    popoverOpen = !popoverOpen;
    if (popoverOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto'; 
    }
}

let hasuraEnvironments: any[] = [];
let selectedEnvironmentId = writable<number | null>(null);
let currentEnvironmentName = writable('');

    onMount(async () => {
        loadEnvironments();
    });

    async function loadEnvironments() {
        try {
            const { data } = await client.query({
                query: GET_ENVIRONMENT
            });
            hasuraEnvironments = data.environment;
        } catch (error) {
            console.error("Error fetching environments:", error);
        }
    }

    onMount(async () => {
        try {
            const { data } = await client.query({
                query: GET_ENVIRONMENT
            });
            hasuraEnvironments = data.environment;
        } catch (error) {
            console.error("Error fetching environments:", error);
        }
    });

    let environmentName = writable('');

    async function addEnvironment() {
        const name = $environmentName; 
        try {
            const { data } = await client.mutate({
                mutation: CREATE_ENVIRONMENT,
                variables: {
                    environmentName: name
                }
            });
            console.log('Environment created:', data.insert_environment.returning);
            environmentName.set(''); 
            hasuraEnvironments = [...hasuraEnvironments, data.insert_environment.returning[0]]; 
        } catch (error) {
            console.error('Error creating environment:', error);
        }
    }
    async function deleteEnvironment() {
        const id = $selectedEnvironmentId;
        if (id) {
            try {
                await client.mutate({
                    mutation: DELETE_ENVIRONMENT,
                    variables: { id },
                    update: (cache) => {
                        cache.evict({ id: cache.identify({
                            __typename: 'environment',
                            id
                        })});
                    }
                });
                hasuraEnvironments = hasuraEnvironments.filter(env => env.id !== id);
                selectedEnvironmentId.set(null);
            } catch (error) {
                console.error("Error deleting environment:", error);
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
                hasuraEnvironments = hasuraEnvironments.map(env =>
                    env.id === id ? { ...env, environment_name: name } : env
                );
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
        const selected = hasuraEnvironments.find(env => env.id === id);
        currentEnvironmentName.set(selected ? selected.environment_name : '');
    }


</script>

<div class="bg-white border-2 border-gray-300 p-0 ml-0 flex-grow">
  
    <div class="bg-white border-2 border-gray-300 p-0 ml-0 flex-grow">
        <div class="bg-gray-500 p-1 flex items-center">
            <img src={Etoile} alt="Etoile" class="h-4 mr-2">
            <h1 class="text-white text-sm font-bold">Environment Parameters</h1>
        </div>
    </div>
  
    <div class="bg-white p-4">
        <div class="flex items-center border-b border-gray-200 pb-4">
            <div class="flex items-center space-x-2 flex-grow">
                <label for="environment-selector" class="text-sm font-medium text-gray-700">Select Environment Hasura :</label>
                <select id="environment-selector" bind:value={$selectedEnvironmentId} on:change={selectEnvironment} class="px-3 py-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value={null}>-- Select an Environment --</option>
                    {#each hasuraEnvironments as environment}
                        <option value={environment.id}>{environment.environment_name}</option>
                    {/each}
                </select>
                <button on:click={deleteEnvironment} disabled={!$selectedEnvironmentId} class="inline-flex items-center px-2 py-1 text-xs border border-red-500 font-medium rounded-md shadow-sm text-red-600 bg-white hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Delete
                </button>
            </div>
            <div class="flex items-center space-x-2 flex-grow">
                <label for="current-environment-name" class="text-sm font-medium text-gray-700">Edit Name:</label>
                <input id="current-environment-name" type="text" bind:value={$currentEnvironmentName} class="px-3 py-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Edit Environment Name">
                <button on:click={updateEnvironment} disabled={!$selectedEnvironmentId || $currentEnvironmentName.trim() === ''} class="inline-flex items-center px-2 py-1 text-xs border border-blue-500 font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Update
                </button>
            </div>
            <div class="flex items-center space-x-2 flex-grow">
                <label for="new-environment-name" class="text-sm font-medium text-gray-700">Name:</label>
                <input id="new-environment-name" type="text" bind:value={$environmentName} class="px-3 py-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter New Environment Name">
                <button on:click={addEnvironment} class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 font-medium rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Create
                </button>
            </div>
          
        </div>
    </div>

    <div class="bg-white p-4">
        <div class="flex items-center border-b border-gray-200 pb-4">
            <div class="flex items-center space-x-2 flex-grow">
                <label for="prisma-environment-selector" class="text-sm font-medium text-gray-700">Select Environment PG:</label>
    <select id="prisma-environment-selector" on:change={selectPrismaEnvironment} class="px-3 py-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        <option value="">-- Select an Environment --</option>
        {#each environments as environment}
            <option value={environment.id}>{environment.environment_name}</option>
        {/each}
    </select>
    <form action="?/deleteEnvironment" method="post">
        <input type="hidden" name="id" value={$selectedPrismaEnvironmentId}>
        <button type="submit" class="inline-flex items-center px-2 py-1 text-xs border border-red-500 font-medium rounded-md shadow-sm text-red-500 bg-white hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" disabled={!$selectedPrismaEnvironmentId}>
            Delete
        </button>
    </form>
    <form action="?/updateEnvironment" method="post">
        <input type="hidden" name="id" value={$selectedPrismaEnvironmentId}>
        <label for="current-environment-name" class="text-sm font-medium text-gray-700">Edit Name:</label>
        <input type="text" name="environment_name" bind:value={$currentPrismaEnvironmentName} placeholder="Edit Environment Name" required class="px-3 py-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        <button type="submit" class="inline-flex items-center px-2 py-1 text-xs border border-blue-500 font-medium rounded-md shadow-sm text-blue-500 bg-white hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" disabled={!$selectedPrismaEnvironmentId}>
            Update
        </button>
    </form>
                <form action="?/createEnvironment" method="post">
                    <div class="flex items-center space-x-2">
                        <label for="environment_name" class="block text-sm font-medium text-gray-700">Name:</label>
                        <div class="flex-grow">
                            <input type="text" id="environment_name" name="environment_name" required class="px-3 py-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter New Environment Name">
                        </div>
                        <button type="submit" class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 font-medium rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Create
                        </button>
                    </div>
                </form>
                
            </div>
        </div>
    </div>
    </div>

  
  
  <div class="bg-white p-4 shadow-md mt-4">
    <div class="text-gray-700 text-sm py-2">
        Last change the date time by user
        <br>
        State of referencing: referencing state value
</div>
    <h1 class="text-xl font-bold text-[#97c00e]">General</h1>
    <div class="space-y-1 py-0">
        <div class="flex items-center">
            <label class="text-gray-700 w-1/4">Name :</label>
            <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
        <div class="flex items-center">
            <label class="text-gray-700 w-1/4">Context:</label>
            <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
        <div class="flex items-center">
            <label class="text-gray-700 w-1/4">Common client URL (opt) :</label>
            <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
        <div class="flex items-center">
            <label class="text-gray-700 w-1/4">Block installations :</label>
            <input type="checkbox" class="align-middle transform scale-125 " >
        </div>
        <div class="flex items-center">
            <label class="text-gray-700 w-1/4">Cause :</label>
            <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
        <div class="flex items-center">
            <label class="text-gray-700 w-1/4">Encryption type :</label>
            <select class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
                <option></option>
            </select>
        </div>
        <div class="flex items-center">
            <label class="text-gray-700 w-1/4">Communication type :</label>
            <select class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
                <option></option>
            </select>
        </div>
</div>

    <div class="space-y-4 py-2">
        <h1 class="text-xl font-bold text-[#97c00e]">Configurator</h1>
        <div class="text-gray-700 py-0">
            <p><strong>An environment configuration must only be managed from a single console.</strong></p>
            <div class="flex items-center">
                <input type="checkbox" checked class="mr-2 transform scale-125" disabled>
                <span>Manage the configuration from this console.</span>
            </div>
        </div>
</div>
    
   <div class="bg-white p-0 mt-4">
    <h1 class="text-xl font-bold text-[#97c00e] mb-4">CORE Probes</h1>
    <div class="overflow-x-auto mb-6">
        <table class="min-w-full text-xs divide-y divide-gray-200 border border-gray-300">
            <thead class="bg-gray-400 text-white">
                <tr>
                    <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300">Test</th>
                    <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300">Name</th>
                    <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300">Type</th>
                    <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300">Authentication</th>
                    <th scope="col" class="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                    <td class="px-3 py-2 border-r border-gray-300">
                        <button class="bg-blue-400 text-white px-2 py-1 rounded" disabled>Test</button>
                    </td>
                    <td class="px-3 py-2 border-r border-gray-300">CORVUS </td>
                    <td class="px-3 py-2 border-r border-gray-300">IBMI</td>
                    <td class="px-3 py-2 border-r border-gray-300"></td>
                    <td class="px-3 py-2">
                        <Popover.Root>
                            <Popover.Trigger 
                              class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 font-medium rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                              on:click={togglePopover}>
                              Display
                            </Popover.Trigger>
                            {#if popoverOpen}
                              <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div class="relative p-8 bg-white rounded-lg shadow-lg border border-gray-300 max-w-4xl w-full">
                                  <button
                                    class="absolute top-3 right-3 text-gray-800 hover:text-gray-600"
                                    on:click={togglePopover}>
                                    <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                  <h2 class="text-lg font-bold" style="font-size: 16px;">CORE Probe</h2>
                                  <div class="font-bold underline text-[#97c00e] mt-4" style="font-size: 16px;">General Information</div>
                                  <div class="grid grid-cols-3 gap-4 mt-2 items-center">
                                    <div>
                                      <label class="text-gray-700">Core name :</label>
                                      <input type="text" value="" class="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-700 w-full"  />
                                    </div>
                                    <div>
                                      <label class="text-gray-700">Type :</label>
                                      <select class="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-700 w-full" >
                                        <option></option>
                                      </select>
                                    </div>
                                    <div class="flex items-center">
                                      <label class="text-gray-700 mr-2">Is the main :</label>
                                      <input type="checkbox"  />
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

    <div class="bg-white p-4 mt-4">
    <div class="flex flex-col">
        <div class="flex items-center gap-3 mb-2">
            <button class="bg-blue-500 text-white px-2 py-0 focus:outline-none hover:bg-blue-700 text-sm rounded">Test</button>
            <h1 class="text-xl font-bold text-[#97c00e]">Mailbox</h1>
        </div>
        <h2 class="text-lg font-bold text-[#97c00e] underline">Integration :</h2>
    </div>
    <div class="space-y-1 py-0">
        <div class="flex items-center justify-start">
            <label class="text-gray-700 w-1/4">Server name :</label>
            <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
        <div class="flex items-center justify-start">
            <label class="text-gray-700 w-1/4">Login:</label>
            <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
        <div class="flex items-center justify-start">
            <label class="text-gray-700 w-1/4">Password:</label>
            <input type="password" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
        <div class="flex items-center justify-start">
            <label class="text-gray-700 w-1/4">Authentication type:</label>
            <select class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5 " style="background-color: #e5e7eb;" >
                <option></option>
            </select>
        </div>
    </div>
    <h2 class="text-lg font-bold text-[#97c00e] underline mt-4">File Transfers :</h2>
    <div class="space-y-1 py-0">
        <div class="flex items-center justify-start">
            <label class="text-gray-700 w-1/4">Type:</label>
            <select class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5 " style="background-color: #e5e7eb;" >
                <option></option>
            </select>
        </div>
        <div class="flex items-center justify-start">
            <label class="text-gray-700 w-1/4">Login:</label>
            <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
        <div class="flex items-center justify-start">
            <label class="text-gray-700 w-1/4">Password:</label>
            <input type="password" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
        <div class="flex items-center justify-start">
            <label class="text-gray-700 w-1/4">Server name:</label>
            <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
        <div class="flex items-center justify-start">
            <label class="text-gray-700 w-1/4">Mode:</label>
            <select class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5 " style="background-color: #e5e7eb;" >
                <option></option>
            </select>
        </div>
        <div class="flex items-center justify-start">
            <label class="text-gray-700 w-1/4">Port:</label>
            <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
        </div>
    </div>

</div>

    <div class="bg-white p-4 mt-4">
    <div class="flex flex-col">
        <h1 class="text-xl font-bold text-[#97c00e]">Sab BPM</h1>
        <p class="font-bold mt-2">These settings are only useful if SAB BPM is version 7.5.10 or higher.</p>
        <div class="space-y-1 py-1">
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Login :</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Language :</label>
                <select class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5 " style="background-color: #e5e7eb;" >
                    <option></option>
                </select>
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Password :</label>
                <input type="password" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
        </div>
    </div>
</div>

    <div class="bg-white p-4 mt-4">
    <div class="flex flex-col">
        <div class="flex items-center gap-3 mb-2">
            <button class="bg-blue-500 text-white px-2 py-0 focus:outline-none hover:bg-blue-700 text-sm rounded">Test</button>
            <h1 class="text-xl font-bold text-[#97c00e]">Host Database</h1>
        </div>
        <div class="space-y-1 py-0">
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Type:</label>
                <select class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5 " style="background-color: #e5e7eb;" disabled>
                    <option></option> 
                </select>
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Login:</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Schema:</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Is secured:</label>
                <input type="checkbox" class="align-middle transform scale-125 " >
            </div>
            
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Server name:</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Password:</label>
                <input type="password" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
        </div>
    </div>
</div>

    <div class="bg-white p-4 mt-4">
    <div class="flex flex-col">
        <div class="flex items-center gap-3 mb-2">
            <button class="bg-blue-500 text-white px-2 py-0 focus:outline-none hover:bg-blue-700 text-sm rounded">Test</button>
            <h1 class="text-xl font-bold text-[#97c00e]">Telemaintenance Database</h1>
        </div>
        <div class="space-y-1 py-0">
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Type :</label>
                <select class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5 " style="background-color: #e5e7eb;" disabled>
                    <option></option>
                </select>
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Login :</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Schema :</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Environment :</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Is secured :</label>
                <input type="checkbox" class="align-middle transform scale-125 " >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Server name :</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Password :</label>
                <input type="password" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
        </div>
    </div>
</div>

    <div class="bg-white p-4 mt-4">
    <div class="flex flex-col">
        <div class="flex items-center gap-3 mb-2">
            <button class="bg-blue-500 text-white px-2 py-0 focus:outline-none hover:bg-blue-700 text-sm rounded">Test</button>
            <h1 class="text-xl font-bold text-[#97c00e]">X3S Database</h1>
        </div>
        <div class="space-y-1 py-0">
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Type :</label>
                <select class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5 " style="background-color: #e5e7eb;" >
                    <option></option>
                </select>
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Login :</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Schema :</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Is secured :</label>
                <input type="checkbox" class="align-middle transform scale-125 " >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Server name :</label>
                <input type="text" value="" class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
            <div class="flex items-center justify-start">
                <label class="text-gray-700 w-1/4">Password :</label>
                <input type="password" value class="border border-gray-300 rounded py-1 px-2 text-gray-700 w-2/5" style="background-color: #e5e7eb;" >
            </div>
        </div>
    </div>
</div>

<div class="bg-white p-4 mt-4">
    <div class="flex justify-start items-center space-x-4">
        <button class="bg-blue-500 text-white px-2 py-0 focus:outline-none hover:bg-blue-700 text-sm rounded">
            Test all
        </button>

        <button class="bg-white text-black px-4 px-2 py-0 border border-gray-300 rounded focus:outline-none hover:bg-gray-100 text-sm">
            Hide Referencing
        </button>
    </div>
</div>

</div>



  