<script lang="ts">
    import { onMount } from 'svelte';
    import client from '$lib/apolloClient';
    import {
      newEnvironmentName,
      newHostType,
      showInputs,
      selectedDuplicateEnvId,
      environments,
      errorMessage,
      selectedInfo,
      selectedEnvironmentId,
      connectionDetails,
      sshConnection,
      sftpConnection
    } from '$lib/stores';
    import { CREATE_ENVIRONMENT, CREATE_DATABASE_CONNECTION, CREATE_BDDHOST_CONNECTION, CREATE_BDDX3S_CONNECTION, CREATE_BDDTLM_CONNECTION, CREATE_SABBPM_CONNECTION, CREATE_WAS_CONNECTION, CREATE_SSH_CONNECTION, CREATE_SFTP_CONNECTION,CREATE_APPPARAM, CREATE_COMPONENT, CREATE_INSTCONFIG ,GET_ENV } from '$lib/mutation';
    import { get, writable } from 'svelte/store';
    import type { ConnectionInfo, WasConnectionInfo, Component, ComponentsMap } from '$lib/stores'
    import * as Popover from "$lib/components/ui/popover";
    import { Checkbox } from "$lib/components/ui/checkbox";
    type ConnectionType = 'Host' | 'TLM' | 'X3S';

    let newWasConnection: WasConnectionInfo = {
    host: '',
    port: '',
    securityEnabled: false,
    username: '',
    password: '',
    keyStoreType: '',
    sslConfigUrl: '',
    soapConfigUrl: '',
    sasConfigUrl: '',
    truststore: '',
    truststorePassword: '',
    keystore: '',
    keystorePassword: '',
    name: ''
  };

  function saveNewWasConnection() {
    if (newWasConnection.host && newWasConnection.port) { // Validate required fields if needed
      const connections = get(connectionDetails);
      connections.Was.push({ ...newWasConnection }); // Add the new connection
      connectionDetails.set(connections); // Update the store

      // Reset the newWasConnection object for the next input
      newWasConnection = {
        host: '',
        port: '',
        securityEnabled: false,
        username: '',
        password: '',
        keyStoreType: '',
        sslConfigUrl: '',
        soapConfigUrl: '',
        sasConfigUrl: '',
        truststore: '',
        truststorePassword: '',
        keystore: '',
        keystorePassword: '',
        name: ''
      };

      toggleWebspherePopover();
    } else {
      console.error("Required fields are missing.");
    }
  }

  function deleteWasConnection(index: number) {
    const connections = get(connectionDetails);
    connections.Was.splice(index, 1); 
    connectionDetails.set(connections);
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
// Load environments on component mount
onMount(async () => {
        try {
    const result = await client.query({
      query: GET_ENV
    });
    environments.set(result.data.console_environment);
  } catch (error) {
    console.error('Error loading environments:', error);
  }
});
  

// set the visibility of inputs
export const prepareInputs = () => {
    if ($newEnvironmentName.trim() === '' || $newHostType.trim() === '') {
      errorMessage.set('Environment Name and Host Type are required.');
      return;
    }
    showInputs.set(true);
    errorMessage.set('');
};

 function getMutationByType(type: ConnectionType) {
  switch (type) {
    case 'Host':
      return CREATE_BDDHOST_CONNECTION;
    case 'TLM':
      return CREATE_BDDTLM_CONNECTION;
    case 'X3S':
      return CREATE_BDDX3S_CONNECTION;
      default:
        throw new Error(`Unknown connection type: ${type}`);
  }
}
  
// function to create a database connection
async function createDatabaseConnection(connectionType: ConnectionType, connectionParams: ConnectionInfo) {
   
    const envOid = get(selectedEnvironmentId);
   
    if (!envOid) {
      errorMessage.set('Environment ID is required.');
      return;
    }

    try {
      const dbResult = await client.mutate({
        mutation: CREATE_DATABASE_CONNECTION,
        variables: {
          env_oid: envOid,
          ...connectionParams
        }
      });

      console.log(`${connectionType} Database Connection Created:`, dbResult);
      return dbResult.data.insert_console_databaseconnection_one.con_oid;
    } catch (error) {
      console.error(`Failed to create ${connectionType} database connection:`, error);
      return null;
    }
}

function getComponentsByInfraType(infraType: string, serverType: string): Component[] {
  const componentsMap: ComponentsMap = {
    "SDE": [
        { type: "SDE_CALLEXT_WS", server_type: serverType, value: "Automatic installation" },
        { type: "SDE_REST", server_type: serverType, value: "Automatic installation" },
        { type: "SDE_CXF", server_type: serverType, value: "Automatic installation" },
        { type: "SDE_JMS", server_type: serverType, value: "Automatic installation" }
    ],
    "FlowmindServer": [
        { type: "BPM_FLOWBEAN", server_type: serverType, value: "Automatic installation" },
        { type: "BPM_RESSOURCE", server_type: serverType, value: "Automatic installation" }
    ],
    "ConsoleLocale": [
        { type: "CONFIG_RESSOURCE", server_type: serverType, value: "Automatic installation" }
    ],
    "SabUnix": [
        { type: "UX_WEB_RESSOURCE", server_type: serverType, value: "Automatic installation" }
    ],
    "WebServices": [
        { type: "WSSAB_AAR", server_type: serverType, value: "Automatic installation" },
        { type: "WSSAB_WS", server_type: serverType, value: "Automatic installation" }
    ],
    "Host": serverType === "IBMI" ? [
        { type: "TLDINF_RESSOURCE", server_type: serverType, value: "Automatic installation" },
        { type: "TLD_RESSOURCE", server_type: serverType, value: "Automatic installation" },
        { type: "TLD_CONFIG", server_type: serverType, value: "Automatic installation" },
        { type: "TLDINF_CONFIG", server_type: serverType, value: "Automatic installation" },
        { type: "CORE_CONFIG", server_type: serverType, value: "Automatic installation" },
        { type: "IBMI_OBJ", server_type: serverType, value: "Automatic installation" },
        { type: "CORE_JAVA", server_type: serverType, value: "Automatic installation" },
        { type: "EXT_FILES", server_type: serverType, value: "Automatic installation" },
        { type: "DOCUMENT_PDF", server_type: serverType, value: "Ignore" },
        { type: "DOCUMENTS_ZIP", server_type: serverType, value: "Ignore" },
    ] : [
        { type: "CORE_CONFIG", server_type: serverType, value: "Automatic installation" },
        { type: "TLD_CONFIG", server_type: serverType, value: "Automatic installation" },
        { type: "TLD_RESSOURCE", server_type: serverType, value: "Automatic installation" },
        { type: "UX_COBOL_GEN", server_type: serverType, value: "Automatic installation" },
        { type: "CORE_JAVA", server_type: serverType, value: "Automatic installation" },
        { type: "EXT_FILES", server_type: serverType, value: "Automatic installation" },
        { type: "TLDINF_CONFIG", server_type: serverType, value: "Automatic installation" },
        { type: "TLDINF_RESSOURCE", server_type: serverType, value: "Automatic installation" },
        { type: "UX_COBOL_STD", server_type: serverType, value: "Automatic installation" },
        { type: "UX_CPY_GEN", server_type: serverType, value: "Automatic installation" },
        { type: "UX_CPY_STD", server_type: serverType, value: "Automatic installation" },
        { type: "UX_DATA", server_type: serverType, value: "Automatic installation" },
        { type: "UX_DATA_AREA", server_type: serverType, value: "Automatic installation" },
        { type: "UX_INFRA_C", server_type: serverType, value: "Automatic installation" },
        { type: "UX_INFRA_COBOL", server_type: serverType, value: "Automatic installation" },
        { type: "UX_INFRA_RUNTIME", server_type: serverType, value: "Automatic installation" },
        { type: "UX_INFRA_NOYAU", server_type: serverType, value: "Automatic installation" },
        { type: "UX_INFRA_SCRIPTS", server_type: serverType, value: "Automatic installation" },
        { type: "UX_INFRA_SOCKET", server_type: serverType, value: "Automatic installation" },
        { type: "UX_INFRA_SQL", server_type: serverType, value: "Automatic installation" },
        { type: "UX_INFRA_X3", server_type: serverType, value: "Automatic installation" },
        { type: "UX_JAVA", server_type: serverType, value: "Automatic installation" },
        { type: "UX_LIB_C", server_type: serverType, value: "Automatic installation" },
        { type: "UX_SONDE", server_type: serverType, value: "Automatic installation" },
        { type: "UX_SQLSCRIPTS", server_type: serverType, value: "Automatic installation" },
        { type: "UX_SQL_X3S_SAB", server_type: serverType, value: "Automatic installation" },
        { type: "UX_SQL_X3S_SJS", server_type: serverType, value: "Automatic installation" },
        { type: "UX_TERMINFO", server_type: serverType, value: "Automatic installation" },
        { type: "UX_TOOLS", server_type: serverType, value: "Automatic installation" },
        { type: "UX_WS_CPY", server_type: serverType, value: "Automatic installation" },
        { type: "UX_WS_GEN", server_type: serverType, value: "Automatic installation" },
        { type: "UX_WS_RES", server_type: serverType, value: "Automatic installation" },
        { type: "UX_XML_DATA", server_type: serverType, value: "Automatic installation" },
        { type: "UX_CONFIG", server_type: serverType, value: "Automatic installation" },
        { type: "DOCUMENT_PDF", server_type: serverType, value: "Ignore" },
        { type: "DOCUMENT_PDF", server_type: serverType, value: "Ignore" },
    ],
    "WebServices": [
        { type: "WSSAB_AAR", server_type: serverType, value: "Automatic installation" },
        { type: "WSSAB_WS", server_type: serverType, value: "Automatic installation" }
    ],
    "X3": [
        { type: "X3_RESSOURCE", server_type: serverType, value: "Automatic installation" }
    ],
    "X3S": [
        { type: "DB_DATA", server_type: serverType, value: "Automatic installation" },
        { type: "DB_STRUCT", server_type: serverType, value: "Automatic installation" },
        { type: "DB_VIEW", server_type: serverType, value: "Automatic installation" },
        { type: "X3S_BIRT_REP", server_type: serverType, value: "Automatic installation" },
        { type: "X3S_EDITIQUE_MAP", server_type: serverType, value: "Automatic installation" },
        { type: "X3S_EDITIQUE_SQL", server_type: serverType, value: "Automatic installation" },
        { type: "X3S_EJB", server_type: serverType, value: "Automatic installation" },
        { type: "X3S_PLAT_REP", server_type: serverType, value: "Automatic installation" },
        { type: "X3S_SERVICE_MAP", server_type: serverType, value: "Automatic installation" },
        { type: "X3S_SQLSCRIPT", server_type: serverType, value: "Automatic installation" },
    ],
    "YourPortalBanker": [
        { type: "YP_BANK_MODULES", server_type: serverType, value: "Automatic installation" },
    ],
    "YourPortalCustomer": [
        { type: "YP_CUST_MODULES ", server_type: serverType, value: "Automatic installation" },
    ]

  };
  
  return componentsMap[infraType] || [];
}

async function insertAllConnections() {

    let envOid = get(selectedEnvironmentId);
    let hostType = get(newHostType);

    if (!envOid) {
      try {
        const result = await client.mutate({
          mutation: CREATE_ENVIRONMENT,
          variables: {
            env_name: get(newEnvironmentName),
            host_type: get(newHostType)
          }
        });
        envOid = result.data.insert_console_environment_one.env_oid;
        selectedEnvironmentId.set(envOid);
        environments.update(envs => [...envs, result.data.insert_console_environment_one]);
      } catch (error) {
        console.error('Error creating environment:', error);
        errorMessage.set('Error creating environment.');
        return;
      }
    }

    for (const type of ['Host', 'TLM', 'X3S'] as ConnectionType[]) {

    const connectionParams = get(connectionDetails)[type];
      const bddConOid = await createDatabaseConnection(type, connectionParams);
      if (!bddConOid) {
      console.error(`Failed to create ${type} database connection: bddConOid is null`);
      return;
    } 
      const mutation = getMutationByType(type);
      try {
        const result = await client.mutate({
          mutation,
          variables: {
            env_oid: get(selectedEnvironmentId),
            bdd_con_oid: bddConOid
          }
        });
        console.log(`${type} Specialized Connection Created:`, result);
      } catch (error) {
        console.error(`Failed to create ${type} specialized connection:`, error);
        
      }
    }

    try {
    const bpmParams = get(connectionDetails).BPM;
    const bpmResult = await client.mutate({
      mutation: CREATE_SABBPM_CONNECTION,
      variables: {
        env_oid: envOid,
        ...bpmParams
      }
    });
    console.log('BPM Connection Created:', bpmResult);
  } catch (error) {
    console.error('Failed to create BPM connection:', error);
  }

  for (const wasConnection of get(connectionDetails).Was) {
  try {
    const formattedWasDetails = {
            env_oid: get(selectedEnvironmentId),
            name: wasConnection.name,
            host: wasConnection.host,
            port: wasConnection.port,
            security_enabled: wasConnection.securityEnabled,
            username: wasConnection.username,
            password: wasConnection.password,
            key_store_type: wasConnection.keyStoreType,
            ssl_config_url: wasConnection.sslConfigUrl,
            soap_config_url: wasConnection.soapConfigUrl,
            sas_config_url: wasConnection.sasConfigUrl,
            truststore: wasConnection.truststore,
            truststore_password: wasConnection.truststorePassword,
            keystore: wasConnection.keystore,
            keystore_password: wasConnection.keystorePassword
        };

    const wasResult = await client.mutate({
      mutation: CREATE_WAS_CONNECTION,
      variables: {
        env_oid: get(selectedEnvironmentId),
        ...formattedWasDetails
      }
    });
    console.log('WAS Connection Created:', wasResult);
  } catch (error) {
    console.error('Failed to create WAS connection:', error);
  }
}

/// Handle SSH connection creation
const sshDetails = get(connectionDetails).SSH;
            try {
              console.log("Sending SSH details: ", sshDetails);
              const formattedSshDetails = {
            auth_type: sshDetails.authType,
            host: sshDetails.host,
            port: sshDetails.port,
            username: sshDetails.username,
            password: sshDetails.password,
            private_key: sshDetails.privateKey,
            public_key: sshDetails.publicKey,
            passphrase: sshDetails.passphrase
        };

          const sshResult = await client.mutate({
              mutation: CREATE_SSH_CONNECTION,
              variables: {
                  env_oid: envOid,
                  ...formattedSshDetails
              }
          });
        
        console.log('SSH Connection Created:', sshResult);

        // Handle SFTP connection creation if SSH is successful
        const sftpDetails = get(connectionDetails).SFTP;
        if (sshResult.data && sshResult.data.insert_console_sshconnection_one.con_oid) {
          const formattedSshDetails = {
            remote_directory: sftpDetails.remoteDirectory,
            is_active: sftpDetails.isActive
          }
            const sftpResult = await client.mutate({
                mutation: CREATE_SFTP_CONNECTION,
                variables: {
                    env_oid: envOid,
                    ssh_con_oid: sshResult.data.insert_console_sshconnection_one.con_oid,
                    ...formattedSshDetails
                }
            });
            console.log('SFTP Connection Created:', sftpResult);
        }
    } catch (error) {
        console.error('Failed to create SSH/SFTP connection:', error);
    }

    try {
        // Create installation configuration
        const instConfigResult = await client.mutate({
            mutation: CREATE_INSTCONFIG,
            variables: {
                env_oid: envOid,
                install_type_default: "Automatic installation",
                integration_thread_number: 1
            }
        });

  const instConfigOid = instConfigResult.data.insert_console_installationconfiguration_one.instconfig_oid;

  // Step 2: Populate Application Parameters
  const infraTypes = ["SDE", "Host", "FlowmindServer", "ConsoleLocale", "SabUnix", "WebServices", "X3", "X3S", "YourPortalBanker", "YourPortalCustomer"];
  const defaultParams = {
            thread_number: 1,
            config_files_dir: "/dir"
        };

   for (const infraType of infraTypes) {
            const appParamResult = await client.mutate({
                mutation: CREATE_APPPARAM,
                variables: {
                    instconfig_oid: instConfigOid,
                    infra_type: infraType,
                    ...defaultParams
                }
            });
    const appParamOid = appParamResult.data.insert_console_applicationparameter_one.appparam_oid;

    
    // Step 3: Add Components for each Application Parameter based on infraType
    const components = getComponentsByInfraType(infraType, hostType);
            for (const component of components) {
                await client.mutate({
                    mutation: CREATE_COMPONENT,
                    variables: {
                        appparam_oid: appParamOid,
                        type: component.type,
                        server_type: component.server_type,
                        value: component.value
                    }
                });
            }
        }
  console.log('Installation configuration and parameters successfully created.');
} catch (error) {
  console.error('Failed to create installation configuration or parameters:', error);
}

    console.log('All required connections have been successfully created.');

}

const duplicateEnvironment = () => {
};
  
const selectEnvironment = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  selectedDuplicateEnvId.set(target.value ? parseInt(target.value) : null);
};

function toggleAuthType(event: Event) {
    const newAuthType = (event.target as HTMLSelectElement).value as "password" | "key";
    sshConnection.update(current => {
      return { ...current, authType: newAuthType };
    });
}
</script>
  
  <div class="p-4 bg-white dark:bg-gray-800">
    <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Create or Duplicate Environment</h2>
    {#if !$showInputs}
    <form on:submit|preventDefault={$selectedDuplicateEnvId ? duplicateEnvironment : prepareInputs}>
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
          <select id="environment-selector" on:change={selectEnvironment} bind:value={$selectedDuplicateEnvId} class="px-3 py-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
            <option value={null}>-- Select an Environment --</option>
            {#each $environments as environment (environment.env_oid)}
              <option value={environment.env_oid.toString()}>{environment.env_name}</option>
            {/each}
          </select>
        </div>
        {#if $errorMessage}
          <p class="text-red-500 dark:text-red-400 mt-2">{$errorMessage}</p>
        {/if}
        {#if $selectedDuplicateEnvId}
          <button type="submit" class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Duplicate
          </button>
        {:else}
        {#if !$showInputs}
          <button type="submit" class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Next
          </button>
          {/if}
        {/if}
      </form>
    {/if}
    
    {#if $showInputs}
          <div class="space-y-1 py-0">
            <h1 class="text-xl font-bold text-[#FFAA33]">General</h1>
            <div class="flex items-center">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Name :</label>
              <input type="text" bind:value={$selectedInfo.env_name} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
            </div>
            <div class="flex items-center">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Context:</label>
              <input type="text" bind:value={$selectedInfo.context} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
            </div>
            <div class="flex items-center">
              <label for="block-installations" class="text-gray-700 dark:text-gray-300 w-1/4">Block installations:</label>
              <input type="checkbox" bind:checked={$selectedInfo.block_installations} class="align-middle transform scale-100">
            </div>
            <div class="flex items-center">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Cause:</label>
              <input type="text" bind:value={$selectedInfo.cause} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
            </div>
            <div class="flex items-center justify-start">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Encryption type:</label>
              <select bind:value={$selectedInfo.encryption_type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                <option></option>
              </select>
            </div>
            <div class="flex items-center justify-start">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Communication type:</label>
              <select bind:value={$selectedInfo.communication_type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                <option></option>
              </select>
            </div>  
          </div>

        <form on:submit|preventDefault={insertAllConnections}>
            <div class="space-y-1 py-4">
                <h1 class="text-xl font-bold text-[#FFAA33]">SSH Connection</h1>
                <div class="flex items-center">
                    <label class="text-gray-700 dark:text-gray-300 w-1/4">Authentication Type:</label>
    <select bind:value={$connectionDetails.SSH.authType} on:change={toggleAuthType} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
        <option value="password">Password</option>
        <option value="key">Key</option>
    </select>
    </div>
    <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
        <input type="text" bind:value={$connectionDetails.SSH.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900"/>
    </div>
    <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
    <input type="number"  bind:value={$connectionDetails.SSH.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" />
    </div>
    <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
    <input type="text" bind:value={$connectionDetails.SSH.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900"/>
    </div>
    {#if $sshConnection.authType === 'password'}
    <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
        <input type="password" bind:value={$connectionDetails.SSH.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900"/>
    </div>
        {:else}
        <div class="flex items-center">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Public Key:</label>
        <input type="text"  bind:value={$connectionDetails.SSH.publicKey} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900"/>
        </div>
        <div class="flex items-center">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Private Key:</label>
        <input type="text"  bind:value={$connectionDetails.SSH.privateKey} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900"/>
        </div>
        <div class="flex items-center">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Passphrase:</label>
        <input type="text"  bind:value={$connectionDetails.SSH.passphrase} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900"/>
        </div>
        {/if}
              </div>
              <div class="space-y-1 py-4">
                <h1 class="text-xl font-bold text-[#FFAA33]">SFTP Connection</h1>
            
    <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Remote Directory :</label>
        <input type="text" bind:value={$connectionDetails.SFTP.remoteDirectory} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900"/>
    </div>
    <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Active :</label>
        <input type="checkbox" bind:checked={$connectionDetails.SFTP.isActive} class="align-middle transform scale-100">
      </div>
              </div>
            <div class="space-y-1 py-4">
                <h1 class="text-xl font-bold text-[#FFAA33]">SAB BPM</h1>
                <p class="font-bold mt-2">These settings are only useful if SAB BPM is version 7.5.10 or higher.</p>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                  <input type="text" bind:value={$connectionDetails.BPM.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Language:</label>
                  <input type="text" bind:value={$connectionDetails.BPM.language} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                  <input type="password" bind:value={$connectionDetails.BPM.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
              </div>

            <div class="space-y-1 py-4">
              <h1 class="text-xl font-bold text-[#FFAA33]">Host Database</h1>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                <input type="text" bind:value={$connectionDetails.Host.type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
                <input type="text" bind:value={$connectionDetails.Host.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                <input type="number" min="0" bind:value={$connectionDetails.Host.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Username:</label>
                <input type="text" bind:value={$connectionDetails.Host.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                <input type="password" bind:value={$connectionDetails.Host.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">URL:</label>
                <input type="text" bind:value={$connectionDetails.Host.url} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
                <input type="text" bind:value={$connectionDetails.Host.schema} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">SID:</label>
                <input type="text" bind:value={$connectionDetails.Host.sid} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Service:</label>
                <input type="text" bind:value={$connectionDetails.Host.service} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Secured:</label>
                <input type="checkbox" bind:checked={$connectionDetails.Host.secured} class="align-middle transform scale-100">
              </div>
            </div>

            <!-- X3S Database Connection Inputs -->
            <div class="space-y-1 py-4">
                <h1 class="text-xl font-bold text-[#FFAA33]">X3S Database</h1>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                  <input type="text" bind:value={$connectionDetails.X3S.type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
                  <input type="text" bind:value={$connectionDetails.X3S.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                  <input type="number" bind:value={$connectionDetails.X3S.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Username:</label>
                  <input type="text" bind:value={$connectionDetails.X3S.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                  <input type="password" bind:value={$connectionDetails.X3S.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">URL:</label>
                  <input type="text" bind:value={$connectionDetails.X3S.url} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
                  <input type="text" bind:value={$connectionDetails.X3S.schema} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">SID:</label>
                  <input type="text" bind:value={$connectionDetails.X3S.sid} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Service:</label>
                  <input type="text" bind:value={$connectionDetails.X3S.service} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Secured:</label>
                  <input type="checkbox" bind:checked={$connectionDetails.X3S.secured} class="align-middle transform scale-100">
                </div>
              </div>

                  <!-- TLM Database Connection Inputs -->
            <div class="space-y-1 py-4">
                <h1 class="text-xl font-bold text-[#FFAA33]">TLM Database</h1>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                  <input type="text" bind:value={$connectionDetails.TLM.type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
                  <input type="text" bind:value={$connectionDetails.TLM.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                  <input type="number" bind:value={$connectionDetails.TLM.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Username:</label>
                  <input type="text" bind:value={$connectionDetails.TLM.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                  <input type="password" bind:value={$connectionDetails.TLM.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">URL:</label>
                  <input type="text" bind:value={$connectionDetails.TLM.url} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
                  <input type="text" bind:value={$connectionDetails.TLM.schema} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">SID:</label>
                  <input type="text" bind:value={$connectionDetails.TLM.sid} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Service:</label>
                  <input type="text" bind:value={$connectionDetails.TLM.service} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Secured:</label>
                  <input type="checkbox" bind:checked={$connectionDetails.TLM.secured} class="align-middle transform scale-100">
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 p-0 mt-4">
                <h1 class="text-xl font-bold text-[#FFAA33] mb-4">FRONT Probes</h1>
                <h2 class="text-lg font-bold text-[#FFAA33] mb-4 underline">Websphere access information</h2>
                <Popover.Root>
                    <Popover.Trigger class="inline-flex items-center px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 font-medium rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" on:click={toggleWebspherePopover}>
                      Add
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
                                <label class="text-gray-700 dark:text-gray-300">Name :</label>
                                <input type="text" bind:value={newWasConnection.name} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                              </div>
                            <div class="col-span-1">
                              <label class="text-gray-700 dark:text-gray-300">WAS Host :</label>
                              <input type="text" bind:value={newWasConnection.host} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                            <div class="col-span-1">
                              <label class="text-gray-700 dark:text-gray-300">WAS Login :</label>
                              <input type="text" bind:value={newWasConnection.username} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                            <div class="col-span-2">
                              <label class="text-gray-700 dark:text-gray-300">SSL config URL :</label>
                              <input type="text" bind:value={newWasConnection.sslConfigUrl} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                            <div class="col-span-1">
                              <label class="text-gray-700 dark:text-gray-300">Is secured :</label>
                              <Checkbox bind:checked={newWasConnection.securityEnabled} class="align-middle transform scale-100" />
                            </div>
                            <div class="col-span-4">
                              <label class="text-gray-700 dark:text-gray-300">Truststore path :</label>
                              <input type="text" bind:value={newWasConnection.truststore} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                            <div class="col-span-4">
                              <label class="text-gray-700 dark:text-gray-300">Keystore path :</label>
                              <input type="text" bind:value={newWasConnection.keystore} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                            <div class="col-span-1">
                              <label class="text-gray-700 dark:text-gray-300">WAS SOAP Port :</label>
                              <input type="text" bind:value={newWasConnection.port} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                            <div class="col-span-1">
                              <label class="text-gray-700 dark:text-gray-300">WAS Password :</label>
                              <input type="text" bind:value={newWasConnection.password} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                            <div class="col-span-3">
                              <label class="text-gray-700 dark:text-gray-300">SOAP config URL :</label>
                              <input type="text" bind:value={newWasConnection.soapConfigUrl} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                            <div class="col-span-2">
                              <label class="text-gray-700 dark:text-gray-300">SAS config URL :</label>
                              <input type="text" bind:value={newWasConnection.sasConfigUrl} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                            <div class="col-span-1">
                              <label class="text-gray-700 dark:text-gray-300">Truststore Password :</label>
                              <input type="text" bind:value={newWasConnection.truststorePassword}  class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                            <div class="col-span-1">
                              <label class="text-gray-700 dark:text-gray-300">Keystore Password :</label>
                              <input type="text" bind:value={newWasConnection.keystorePassword} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" />
                            </div>
                          </div>
                          <button on:click={saveNewWasConnection} class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Add
                          </button>
                          </div>
                    </div>
                    {/if}
                </Popover.Root>
                <div class="overflow-x-auto mb-6">
                    <table class="min-w-full table-auto text-left">
                        <thead class="bg-gray-400 dark:bg-gray-700 text-white">
                            <tr>
                                <th class="px-4 py-2">ID</th>
                                <th class="px-4 py-2">Username</th>
                                <th class="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each get(connectionDetails).Was as wasConnection, index}
                            <tr class="border-b">
                                <td class="px-4 py-2">{index + 1}</td>
                                <td class="px-4 py-2">{wasConnection.username || 'N/A'}</td>
                                <td class="px-4 py-2">
                                    <button class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700" on:click={() => deleteWasConnection(index)}>Delete</button>
                                </td>
                            </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
              <div class="mt-4">
                <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Create
                </button>
              </div>
        </form>

    {/if}
  </div>