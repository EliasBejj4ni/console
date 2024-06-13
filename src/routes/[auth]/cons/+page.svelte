<script lang="ts">
  import client from '$lib/apolloClient';
  import { GET_ENV, GET_CONNECTIONS } from '$lib/queries';
  import {
CREATE_ENV,
UPSERT_SSH_CONNECTION,
  UPSERT_SFTP_CONNECTION,
  UPSERT_BPM_CONNECTION,
  UPSERT_DATABASE_CONNECTION,
  UPSERT_BDD_HOST_CONNECTION,
  UPSERT_TELEMAINTENANCE_CONNECTION,
  UPSERT_X3S_CONNECTION,
  UPSERT_WAS_CONNECTION,
  DELETE_ENV
  } from '$lib/mutations';
  import type { 
    Environment, 
    SSHConnection, 
    DatabaseConnection, 
    SFTPConnection, 
    BDDTLMConnection, 
    BDDHostConnection, 
    BDDX3SConnection, 
    WASConnection,
    BPMConnection,
   } 
    from '$lib/interfaces';
  import type { ApolloQueryResult } from '@apollo/client';
  import { onMount } from 'svelte';
  import { writable, type Writable, derived } from 'svelte/store';
  import * as Popover from "$lib/components/ui/popover";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Tabs from "$lib/components/ui/tabs";
  import { get } from 'svelte/store';
  

  export const sshConnections = writable<SSHConnection[]>([]);
  export const databaseConnections = writable<DatabaseConnection[]>([]);
  export const sftpConnections = writable<SFTPConnection[]>([]);
  export const bddtlmConnections = writable<BDDTLMConnection[]>([]);
  export const bddhostConnections = writable<BDDHostConnection[]>([]);
  export const bddx3sConnections = writable<BDDX3SConnection[]>([]);
  export const wasConnections = writable<WASConnection[]>([]);
  export const bpmConnections = writable<BPMConnection[]>([]);
  export const fileTransferConnections = writable<any[]>([]);
  export const telemaintenanceDatabaseConnections = writable<any[]>([]);
  export const x3sDatabaseConnections = writable<any[]>([]);
  export const hostDatabaseConnections = writable<any[]>([]);
  
  // State variables
  export const environments = writable<Environment[]>([]);
  export const selectedEnvironmentId = writable<number | null>(null);
  export const selectedInfo = writable<{
  env_name: string;
  host_type: string;
  sshConnections: SSHConnection[];
  databaseConnections: DatabaseConnection[];
  sftpConnections: SFTPConnection[];
  bddtlmConnections: BDDTLMConnection[];
  bddhostConnections: BDDHostConnection[];
  bddx3sConnections: BDDX3SConnection[];
  wasConnections: WASConnection[];
  bpmConnections: BPMConnection[];
}>({
  env_name: '',
  host_type: '',
  sshConnections: [],
  databaseConnections: [],
  sftpConnections: [],
  bddtlmConnections: [],
  bddhostConnections: [],
  bddx3sConnections: [],
  wasConnections: [],
  bpmConnections: []
});
 

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


const loadConnections = async (env_oid: number) => {
  try {
    const result: ApolloQueryResult<{
      console_environment_by_pk: {
        env_name: string;
        host_type: string;
        sshconnections: SSHConnection[];
        databaseconnections: DatabaseConnection[];
        sftpconnections: SFTPConnection[];
        bddtlmconnections: BDDTLMConnection[];
        bddhostconnections: BDDHostConnection[];
        bddx3sconnections: BDDX3SConnection[];
        wasconnections: WASConnection[];
        bpmconnections: BPMConnection[];
      }
    }> = await client.query({
      query: GET_CONNECTIONS,
      variables: { env_oid }
    });

    const data = result.data.console_environment_by_pk;
    const cloneConnections = <T>(connections: T[]): T[] => connections.map(conn => ({ ...conn }));

    const clonedSSHConnections = cloneConnections(data.sshconnections);
    const clonedDatabaseConnections = cloneConnections(data.databaseconnections);
    const clonedSFTPConnections = cloneConnections(data.sftpconnections);
    const clonedBDDTLMConnections = cloneConnections(data.bddtlmconnections);
    const clonedBDDHostConnections = cloneConnections(data.bddhostconnections);
    const clonedBDDX3SConnections = cloneConnections(data.bddx3sconnections);
    const clonedWASConnections = cloneConnections(data.wasconnections);
    const clonedBPMConnections = cloneConnections(data.bpmconnections);

    selectedInfo.set({
      env_name: data.env_name,
      host_type: data.host_type,
      sshConnections: clonedSSHConnections,
      databaseConnections: clonedDatabaseConnections,
      sftpConnections: clonedSFTPConnections,
      bddtlmConnections: clonedBDDTLMConnections,
      bddhostConnections: clonedBDDHostConnections,
      bddx3sConnections: clonedBDDX3SConnections,
      wasConnections: clonedWASConnections,
      bpmConnections: clonedBPMConnections
    });

    sshConnections.set(clonedSSHConnections);
    databaseConnections.set(clonedDatabaseConnections);
    sftpConnections.set(clonedSFTPConnections);
    bddtlmConnections.set(clonedBDDTLMConnections);
    bddhostConnections.set(clonedBDDHostConnections);
    bddx3sConnections.set(clonedBDDX3SConnections);
    wasConnections.set(clonedWASConnections);
    bpmConnections.set(clonedBPMConnections);

    fileTransferConnections.set(clonedSFTPConnections.map(connection => ({
      ...connection,
      sshConnection: clonedSSHConnections.find(ssh => ssh.con_oid === connection.ssh_con_oid)
    })));

    telemaintenanceDatabaseConnections.set(clonedBDDTLMConnections.map(connection => ({
      ...connection,
      database: clonedDatabaseConnections.find(db => db.con_oid === connection.bdd_con_oid)
    })));

    x3sDatabaseConnections.set(clonedBDDX3SConnections.map(connection => ({
      ...connection,
      database: clonedDatabaseConnections.find(db => db.con_oid === connection.bdd_con_oid)
    })));

    hostDatabaseConnections.set(clonedBDDHostConnections.map(connection => ({
      ...connection,
      database: clonedDatabaseConnections.find(db => db.con_oid === connection.bdd_con_oid)
    })));

    console.log("Fetched Data", data);
  } catch (error) {
    console.error('Error fetching connections:', error);
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

  
  onMount(async () => {
    await loadEnvironments();
    if ($selectedEnvironmentId) {
      await loadConnections($selectedEnvironmentId);
    }
  });

  let corePopoverOpen: boolean = false;
  
  function toggleCorePopover() {
  console.log("popover toggled");
  corePopoverOpen = !corePopoverOpen;
  if (corePopoverOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}
let webspherePopoverOpen = false;

function toggleWebspherePopover() {
console.log("popover toggled");
webspherePopoverOpen = !webspherePopoverOpen;
  if (webspherePopoverOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}

$: if ($selectedEnvironmentId) {
  loadConnections($selectedEnvironmentId);
  };

let newEnvironmentName = writable('');
let newHostType = writable('');
let errorMessage = writable('');
let selectedDuplicateEnvId = writable<number | null>(null);

export const addEnvironment = async () => {
if ($newEnvironmentName.trim() === '' || $newHostType.trim() === '') {
  errorMessage.set('Environment Name and Host Type are required.');
  return;
}
try {
  const result = await client.mutate({
    mutation: CREATE_ENV,
    variables: {
      env_name: $newEnvironmentName,
      host_type: $newHostType
    }
  });
  console.log('Created environment:', result);

  // Add the new environment to the environments store
  environments.update(envs => [...envs, result.data.insert_console_environment_one]);

  newEnvironmentName.set('');
  newHostType.set('');
  errorMessage.set('');
} catch (error) {
  console.error('Error creating environment:', error);
  errorMessage.set('Error creating environment.');
}
  };

async function upsertConnections() {
  const env_oid = $selectedEnvironmentId;
  
  function isConnectionFilled(connection: any): boolean {
    // ignore fields
    const ignoreKeys = ['env_oid', 'con_oid'];  
    for (const key in connection) {
      if (connection.hasOwnProperty(key) && !ignoreKeys.includes(key)) {
        if (
          (typeof connection[key] === 'string' && connection[key].trim() !== '') ||
          (typeof connection[key] === 'number' && connection[key] !== null && connection[key] !== 0) ||
          (typeof connection[key] === 'boolean' && connection[key] === true) ||
          (connection[key] !== null && connection[key] !== undefined && typeof connection[key] !== 'object')
        ) {
          console.log(`Key "${key}" with value "${connection[key]}" is considered filled.`);
          return true;
        }
      }
    }
    return false;
  };

  if (env_oid === null) {
    console.error('No environment selected');
    return;
  }

  try {
    // Upsert SSH Connections
    for (const sshConnection of $sshConnections) {
      console.log('Upserting SSH Connection:', sshConnection);
      console.log(isConnectionFilled(sshConnection), "ssh is connection filled ?>>>>>>");
      let baseVariables = {
        env_oid: env_oid,
        auth_type: sshConnection.auth_type,
        host: sshConnection.host,
        port: sshConnection.port,
        username: sshConnection.username,
        password: sshConnection.password || undefined,
        private_key: sshConnection.private_key || undefined,
        public_key: sshConnection.public_key || undefined,
        passphrase: sshConnection.passphrase || undefined
      };

      // Only include con_oid if it exists and is not zero
      let variables = {
        ...baseVariables,
        ...(sshConnection.con_oid && { con_oid: sshConnection.con_oid })
      };
      console.log(variables)
      const response = await client.mutate({
        mutation: UPSERT_SSH_CONNECTION,
        variables
      });
      console.log('SSH Connection Upsert Response:', response.data);
    }


    // Upsert SFTP Connections
    for (const sftpConnection of $sftpConnections) {
      console.log('Upserting sftp Connection:', sftpConnection);
      console.log(isConnectionFilled(sftpConnection), " sftp is connection filled ?>>>>>>");
      let baseVariables = {
        env_oid: env_oid,
        ssh_con_oid: sftpConnection.ssh_con_oid,
        remote_directory: sftpConnection.remote_directory,
        is_active: sftpConnection.is_active
      };

      let variables = {
        ...baseVariables,
        ...(sftpConnection.con_oid && { con_oid: sftpConnection.con_oid })
      };

      const response = await client.mutate({
        mutation: UPSERT_SFTP_CONNECTION,
        variables
      });
      console.log('SFTP Connection Upsert Response:', response.data);
    }

     // Upsert BPM Connections
     for (const bpmConnection of $bpmConnections) {
      console.log('Upserting bpm Connection:', bpmConnection);
      console.log(isConnectionFilled(bpmConnection), "bpm is connection filled ?>>>>>>");
      let baseVariables = {
        env_oid: env_oid,
        con_oid: "5",
        username: bpmConnection.username,
        password: bpmConnection.password,
        language: bpmConnection.language
      };

      let variables = {
        ...baseVariables,
        ...(bpmConnection.con_oid && { con_oid: bpmConnection.con_oid })
      };
      console.log(variables,"bpm variables")
      const response = await client.mutate({
        mutation: UPSERT_BPM_CONNECTION,
        variables
      });
      console.log('BPM Connection Upsert Response:', response.data);
    }

    // Upsert Database Connections and corresponding BDD Connections
    for (const databaseConnection of $databaseConnections) {
      console.log('Upserting Database Connection:', databaseConnection);
      console.log(isConnectionFilled(databaseConnection), "db connection is connection filled ?>>>>>>");
      let baseVariables = {
        env_oid: env_oid,
        type: databaseConnection.type,
        free_entry: databaseConnection.free_entry,
        host: databaseConnection.host,
        port: databaseConnection.port,
        username: databaseConnection.username,
        password: databaseConnection.password || undefined,
        url: databaseConnection.url || undefined,
        schema: databaseConnection.schema || undefined,
        sid: databaseConnection.sid || undefined,
        service: databaseConnection.service || undefined,
        secured: databaseConnection.secured || undefined
      };
      
      let variables = {
        ...baseVariables,
        ...(databaseConnection.con_oid && { con_oid: databaseConnection.con_oid })
      };
      console.log(variables,"database variables")
      const response = await client.mutate({
        mutation: UPSERT_DATABASE_CONNECTION,
        variables
      });
 
      console.log('Database Connection Upsert Response:', response.data);

      // Upsert BDD Host Connections
     for (const hostConnection of $hostDatabaseConnections) {
      let baseVariables = {
        env_oid: env_oid
      };

      let variables = {
        ...baseVariables,
        ...(hostConnection.con_oid && { con_oid: hostConnection.con_oid }),
        ...(hostConnection.bdd_con_oid && { bdd_con_oid: hostConnection.bdd_con_oid })
      };

      const response = await client.mutate({
        mutation: UPSERT_BDD_HOST_CONNECTION,
        variables
      });
      console.log('BDD Host Connection Upsert Response:', response.data);
    }
      // Upsert Telemaintenance Connections
      for (const tlmConnection of $telemaintenanceDatabaseConnections) {
      let baseVariables = {
        env_oid: env_oid
      };

      let variables = {
        ...baseVariables,
        ...(tlmConnection.con_oid && { con_oid: tlmConnection.con_oid }),
        ...(tlmConnection.bdd_con_oid && { bdd_con_oid: tlmConnection.bdd_con_oid })
      };

      const response = await client.mutate({
        mutation: UPSERT_TELEMAINTENANCE_CONNECTION,
        variables
      });
      console.log('Telemaintenance Connection Upsert Response:', response.data);
    }

      // Upsert X3S Connections
      for (const x3sConnection of $x3sDatabaseConnections) {
        console.log('Upserting X3S Connection:', x3sConnection);
        let baseVariables = {
        env_oid: env_oid
      };
      let variables = {
        ...baseVariables,
        ...(x3sConnection.con_oid && { con_oid: x3sConnection.con_oid }),
        ...(x3sConnection.bdd_con_oid && { bdd_con_oid: x3sConnection.bdd_con_oid })
      };
      const response = await client.mutate({
        mutation: UPSERT_X3S_CONNECTION,
        variables
      });
        console.log('X3S Connection Upsert Response:', response.data);
      }
    }

    // Upsert WAS Connections
    // for (const wasConnection of $wasConnections) {
    //   console.log('Upserting WAS Connection:', wasConnection);
    //   const response = await client.mutate({
    //     mutation: UPSERT_WAS_CONNECTION,
    //     variables: {
    //       con_oid: wasConnection.con_oid,
    //       env_oid: env_oid,
    //       host: wasConnection.host,
    //       port: wasConnection.port,
    //       security_enabled: wasConnection.security_enabled,
    //       username: wasConnection.username,
    //       password: wasConnection.password,
    //       key_store_type: wasConnection.key_store_type,
    //       ssl_config_url: wasConnection.ssl_config_url,
    //       soap_config_url: wasConnection.soap_config_url,
    //       sas_config_url: wasConnection.sas_config_url,
    //       truststore: wasConnection.truststore,
    //       truststore_password: wasConnection.truststore_password,
    //       keystore: wasConnection.keystore,
    //       keystore_password: wasConnection.keystore_password
    //     }
    //   });
    //   console.log('WAS Connection Upsert Response:', response);
    // }

    console.log('Connections upserted successfully');
  } catch (error) {
    console.error('Error upserting connections:', error);
  }
}

export const deleteEnvironment = async () => {
  const envId = $selectedEnvironmentId;
  if (envId !== null) {
    try {
      const result = await client.mutate({
        mutation: DELETE_ENV,
        variables: { env_oid: envId }
      });
      console.log('Deleted environment:', result);
      await loadEnvironments();
      environments.update(envs => envs.filter(env => env.env_oid !== envId));
      

      selectedEnvironmentId.set(null);

    } catch (error) {
      console.error('Error deleting environment:', error);
    }
  }
    };

</script>

<Tabs.Root value="display" class="w-full ">
<Tabs.List class="grid w-full grid-cols-4 ">
  <!-- <Tabs.Trigger value="display">Display</Tabs.Trigger> -->
  <Tabs.Trigger value="edit">Edit</Tabs.Trigger>
  <Tabs.Trigger value="create">Create</Tabs.Trigger>
  <Tabs.Trigger value="delete">Delete</Tabs.Trigger>
</Tabs.List>
<Tabs.Content value="edit"> 
  <div class="bg-white dark:bg-gray-800 p-4">
    <div class="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
      <div class="flex items-center space-x-2 flex-grow">
        <label for="environment-selector" class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Environment :
        </label>
        <select
        id="environment-selector"
        on:change={selectEnvironment}
        bind:value={$selectedEnvironmentId}
        class="px-3 py-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
      >
        <option value={null}>-- Select an Environment --</option>
        {#each $environments as environment (environment.env_oid)}
          <option value={environment.env_oid}>{environment.env_name}</option>
        {/each}
      </select>
      
      </div>
    </div>
    <div>
      <form on:submit|preventDefault={upsertConnections}>
      <div class="text-gray-700 dark:text-gray-300 text-sm py-2">
        Last change the date time by user
        <br>
        State of referencing: referencing state value
      </div>
   
      <div class="space-y-1 py-0">
        <h1 class="text-xl font-bold text-[#FFAA33]">General</h1>
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Name :</label>
          <input type="text" bind:value={$selectedInfo.env_name} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
        </div>
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Context:</label>
          <input type="text"  class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
        </div>
        <div class="flex items-center">
          <label for="block-installations" class="text-gray-700 dark:text-gray-300 w-1/4">Block installations:</label>
          <Checkbox id="block-installations" class="align-middle transform scale-100">
          </Checkbox>
        </div>
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Cause:</label>
          <input type="text"  class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
        </div>
        <div class="flex items-center justify-start">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Encryption type:</label>
          <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
            <option></option>
          </select>
        </div>
        <div class="flex items-center justify-start">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Communication type:</label>
          <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
            <option></option>
          </select>
        </div>
      </div>
    </form>
    </div>
    <form on:submit|preventDefault={upsertConnections}>
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
               <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">name</td>
              <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">type</td>
              <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">auth</td>
              <td class="px-3 py-2">
                <Popover.Root>
                  <Popover.Trigger
                  class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 font-medium rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  on:click={toggleCorePopover}
                >
                    Display
                  </Popover.Trigger>
                  {#if corePopoverOpen}
                  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-4xl w-full">
                      <button class="absolute top-3 right-3 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400" on:click={toggleCorePopover}>
                        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <h2 class="text-lg font-bold dark:text-gray-300" style="font-size: 16px;">CORE Probe</h2>
                      <div class="font-bold underline text-[#FFAA33] mt-4" style="font-size: 16px;">General Information</div>
                      <div class="grid grid-cols-3 gap-4 mt-2 items-center">
                        <div>
                          <label class="text-gray-700 dark:text-gray-300">Core name :</label>
                          <!-- <input type="text" value={$selectedInfo.probeName} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" readonly /> -->
                        </div>
                        <div>
                          <label class="text-gray-700 dark:text-gray-300">Type :</label>
                          <select class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full">
                            <!-- <option>{$selectedInfo.probeType}</option> -->
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
    </form>
    <form on:submit|preventDefault={upsertConnections}>
    <div class="bg-white dark:bg-gray-800 p-4 mt-4">
      <div class="flex flex-col">
        <div class="flex items-center gap-3 mb-2">
          <button class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">Test</button>
          <h1 class="text-xl font-bold text-[#FFAA33]">Mailbox</h1>
        </div>
        <h2 class="text-lg font-bold text-[#FFAA33] underline">Integration :</h2>
      </div>
      {#each $sshConnections as connection}
      <div class="space-y-1 py-0">
        <div class="flex items-center justify-start">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Server name:</label>
          <input type="text" bind:value={connection.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
        </div>
        <div class="flex items-center justify-start">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
          <input type="text" bind:value={connection.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
        </div>
        <div class="flex items-center justify-start">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
          <input type="password" bind:value={connection.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
        </div>
        <div class="flex items-center justify-start">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">SSH Port:</label>
          <input type="text" bind:value={connection.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
        </div>
        <div class="flex items-center justify-start">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Authentication type:</label>
          <select bind:value={connection.auth_type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
            <option value="password">Password</option>
            <option value="key">Key</option>
          </select>
        </div>
      </div>
      {/each}
      <h2 class="text-lg font-bold text-[#FFAA33] underline mt-4">File Transfers :</h2>
        <div class="space-y-1 py-0">
          {#each $fileTransferConnections as connection}
            {#if connection.sshConnection}
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                <input type="text"  class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                <input type="text" bind:value={connection.sshConnection.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                <input type="password" bind:value={connection.sshConnection.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Server name:</label>
                <input type="text" bind:value={connection.sshConnection.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Mode:</label>
                <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                  <option>{connection.is_active ? 'Active' : ''}</option>
                </select>
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                <input type="text" bind:value={connection.sshConnection.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
            {/if}
          {/each}
        </div>
     
    </div>
    </form>
    <form on:submit|preventDefault={upsertConnections}>
    <div class="bg-white dark:bg-gray-800 p-4 mt-4">
      <div class="flex flex-col">
        <h1 class="text-xl font-bold text-[#FFAA33]">Sab BPM</h1>
        <p class="font-bold mt-2">These settings are only useful if SAB BPM is version 7.5.10 or higher.</p>
        {#each $bpmConnections as connection}
        <div class="space-y-1 py-1">
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
            <input type="text" bind:value={connection.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Language:</label>
            <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              <option value="en">{connection.language}</option>
            </select>
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
            <input type="password" bind:value={connection.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
          </div>
        </div>
        {/each}
      </div>
    </div>
    </form>
    <form on:submit|preventDefault={upsertConnections}>
    <div class="bg-white dark:bg-gray-800 p-4 mt-4">
      <div class="flex flex-col">
        <div class="flex items-center gap-3 mb-2">
          <button class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">Test</button>
          <h1 class="text-xl font-bold text-[#FFAA33]">Host Database</h1>
        </div>
        {#each $hostDatabaseConnections as connection}
        <div class="space-y-1 py-0">
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
            <input type="text" bind:value={connection.database.type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
            <input type="text" bind:value={connection.database.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
            <input type="text" bind:value={connection.database.schema} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Is secured:</label>
            <Checkbox bind:checked={connection.database.secured} class="align-middle transform scale-125" />
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Server name:</label>
            <input type="text" bind:value={connection.database.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
            <input type="password" bind:value={connection.database.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
            <input type="text" bind:value={connection.database.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Instance:</label>
            <input type="text" bind:value={connection.database.instance} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">URL for database connection:</label>
            <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled>
              <option></option>
            </select>
          </div>
          <div class="flex items-center justify-start">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">URL:</label>
            <input type="text" bind:value={connection.database.url} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
          </div>
        </div>
        {/each}
      </div>
    </div>
    </form>
    <form on:submit|preventDefault={upsertConnections}>
    <div class="bg-white dark:bg-gray-800 p-4 mt-4">
      <div class="flex flex-col">
        <div class="flex items-center gap-3 mb-2">
          <button class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">Test</button>
          <h1 class="text-xl font-bold text-[#FFAA33]">Telemaintenance Database</h1>
        </div>
        {#each $telemaintenanceDatabaseConnections as connection}
            <div class="space-y-1 py-0">
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                <input type="text" bind:value={connection.database.type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                <input type="text" bind:value={connection.database.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
                <input type="text" bind:value={connection.database.schema} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Environment:</label>
                <input type="text" bind:value={connection.database.environment} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Is secured:</label>
                <Checkbox class="align-middle transform scale-125" bind:checked={connection.database.secured} />
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Server name:</label>
                <input type="text" bind:value={connection.database.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                <input type="password" bind:value={connection.database.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                <input type="text" bind:value={connection.database.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Instance:</label>
                <input type="text" bind:value={connection.database.instance} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">URL for database connection:</label>
                <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled>
                  <option></option>
                </select>
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">URL:</label>
                <input type="text" bind:value={connection.database.url} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
            </div>
        {/each}
      </div>
    </div>
    </form>
    <form on:submit|preventDefault={upsertConnections}>
    <div class="bg-white dark:bg-gray-800 p-4 mt-4">
      <div class="flex flex-col">
        <div class="flex items-center gap-3 mb-2">
          <button class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">Test</button>
          <h1 class="text-xl font-bold text-[#FFAA33]">X3S Database</h1>
        </div>
        {#each $x3sDatabaseConnections as connection}
            <div class="space-y-1 py-0">
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                <input type="text" bind:value={connection.database.type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                <input type="text" bind:value={connection.database.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
                <input type="text" bind:value={connection.database.schema} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Is secured:</label>
                <Checkbox class="align-middle transform scale-125" bind:checked={connection.database.secured} />
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Server name:</label>
                <input type="text" bind:value={connection.database.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                <input type="password" bind:value={connection.database.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                <input type="text" bind:value={connection.database.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Instance:</label>
                <input type="text" bind:value={connection.database.instance} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">URL for database connection:</label>
                <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled>
                  <option></option>
                </select>
              </div>
              <div class="flex items-center justify-start">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">URL:</label>
                <input type="text" bind:value={connection.database.url} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
            </div>
        {/each}
      </div>
    </div>
    </form>

    <form on:submit|preventDefault={upsertConnections}>
    <div class="bg-white dark:bg-gray-800 p-0 mt-4">
      <h1 class="text-xl font-bold text-[#FFAA33] mb-4">FRONT Probes</h1>
      <h2 class="text-lg font-bold text-[#FFAA33] mb-4 underline">Websphere access information</h2>
      <div class="overflow-x-auto mb-6">
        <table class="min-w-full text-xs divide-y divide-gray-200 dark:divide-gray-700 border border-gray-300 dark:border-gray-700">
          <thead class="bg-gray-400 dark:bg-gray-700 text-white">
            <tr>
              <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300 dark:border-gray-700">ID</th>
              <th scope="col" class="px-3 py-2 text-left font-medium border-r border-gray-300 dark:border-gray-700">User</th>
              <th scope="col" class="px-3 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {#each $selectedInfo.wasConnections as connection}
              <tr>
                <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">
                  {connection.con_oid}
                </td>
                <td class="px-3 py-2 border-r border-gray-300 dark:border-gray-700">
                  {connection.username || 'N/A'}
                </td>
                <td class="px-3 py-2">
                  <Popover.Root>
                    <Popover.Trigger class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 font-medium rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" on:click={toggleWebspherePopover}>
                      Display
                    </Popover.Trigger>
                    {#if webspherePopoverOpen}
                      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-4xl w-full">
                          <button class="absolute top-3 right-3 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400" on:click={toggleWebspherePopover}>
                            <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <h2 class="text-lg font-bold dark:text-gray-300" style="font-size: 16px;">Websphere Access Information</h2>
                          <div class="font-bold underline text-[#FFAA33] mt-4" style="font-size: 16px;">General Information</div>
                    
                            <div class="grid grid-cols-5 gap-4 mt-2 items-center">
                              <div class="col-span-1">
                                <label class="text-gray-700 dark:text-gray-300">WAS Host :</label>
                                <input type="text" bind:value={connection.host} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                              <div class="col-span-1">
                                <label class="text-gray-700 dark:text-gray-300">WAS Login :</label>
                                <input type="text" bind:value={connection.username} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                              <div class="col-span-2">
                                <label class="text-gray-700 dark:text-gray-300">SSL config URL :</label>
                                <input type="text" bind:value={connection.ssl_config_url} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                              <div class="col-span-1">
                                <label class="text-gray-700 dark:text-gray-300">Is secured :</label>
                                <Checkbox bind:checked={connection.security_enabled} class="align-middle transform scale-100" />
                              </div>
                              <div class="col-span-4">
                                <label class="text-gray-700 dark:text-gray-300">Truststore path :</label>
                                <input type="text" bind:value={connection.truststore} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                              <div class="col-span-4">
                                <label class="text-gray-700 dark:text-gray-300">Keystore path :</label>
                                <input type="text" bind:value={connection.keystore} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                              <div class="col-span-1">
                                <label class="text-gray-700 dark:text-gray-300">WAS SOAP Port :</label>
                                <input type="text" bind:value={connection.port} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                              <div class="col-span-1">
                                <label class="text-gray-700 dark:text-gray-300">WAS Password :</label>
                                <input type="text" bind:value={connection.password} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                              <div class="col-span-3">
                                <label class="text-gray-700 dark:text-gray-300">SOAP config URL :</label>
                                <input type="text" bind:value={connection.soap_config_url} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                              <div class="col-span-2">
                                <label class="text-gray-700 dark:text-gray-300">SAS config URL :</label>
                                <input type="text" bind:value={connection.sas_config_url} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                              <div class="col-span-1">
                                <label class="text-gray-700 dark:text-gray-300">Truststore Password :</label>
                                <input type="text" bind:value={connection.truststore_password} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                              <div class="col-span-1">
                                <label class="text-gray-700 dark:text-gray-300">Keystore Password :</label>
                                <input type="text" bind:value={connection.keystore_password} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                            </div>
                        </div>
                      </div>
                    {/if}
                  </Popover.Root>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    </form>
    <div class="bg-white dark:bg-gray-800 p-4 mt-4">
      <div class="flex justify-start items-center space-x-4">
        <button on:click={upsertConnections} class="bg-blue-500 text-white px-4 py-2 rounded mt-4">Update Connections</button>
        <button class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">
          Test all
        </button>
        <button class="bg-white dark:bg-gray-800 text-black dark:text-white px-4 px-2 py-0 border border-gray-300 dark:border-gray-700 rounded focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
          Hide Referencing
        </button>
      </div>
    </div>
  </div>
</Tabs.Content>

<Tabs.Content value="create">
  <div class="p-4 bg-white dark:bg-gray-800">
    <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Create or Duplicate Environment</h2>
    <form on:submit|preventDefault={$selectedDuplicateEnvId ? addEnvironment : addEnvironment}>
      <div class="mt-4">
        <label for="new-environment-name" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Environment Name:</label>
        <input id="new-environment-name" type="text" bind:value={$newEnvironmentName} class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300" placeholder="Enter Environment Name">
      </div>
      <div class="mt-4">
        <label for="new-host-type" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Host Type:</label>
        <input id="new-host-type" type="text" bind:value={$newHostType} class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300" placeholder="Enter Host Type">
      </div>
      <div class="mt-4">
        <label for="environment-selector" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Select Environment to Duplicate (optional):</label>
        <select
          id="environment-selector"
          on:change={selectEnvironment}
          bind:value={$selectedEnvironmentId}
          class="px-3 py-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
        >
          <option value={null}>-- Select an Environment --</option>
          {#each $environments as environment (environment.env_oid)}
            <option value={environment.env_oid}>{environment.env_name}</option>
          {/each}
        </select>
      </div>
      {#if $errorMessage}
        <p class="text-red-500 dark:text-red-400 mt-2">{$errorMessage}</p>
      {/if}
      <button type="submit" class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        {$selectedDuplicateEnvId ? 'Duplicate' : 'Create'}
      </button>
    </form>
  </div>
</Tabs.Content>
 <Tabs.Content value="delete">
    <div class="p-4 bg-white dark:bg-gray-800">
      <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Delete Environment</h2>
      <div class="mt-4">
        <label for="environment-selector" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Select Environment to Delete:</label>
        <select
        id="environment-selector"
        on:change={selectEnvironment}
        bind:value={$selectedDuplicateEnvId}
        class="px-3 py-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
      >
        <option value={null}>-- Select an Environment --</option>
        {#each $environments as environment (environment.env_oid)}
          <option value={environment.env_oid}>{environment.env_name}</option>
        {/each}
      </select>
      </div>
      <button on:click={deleteEnvironment} disabled={!$selectedEnvironmentId} class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
        Delete
      </button>
    </div>
  </Tabs.Content>

</Tabs.Root>