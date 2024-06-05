<script lang="ts">
import { writable } from 'svelte/store';
let environments = writable([]);
let selectedEnvironmentId = writable(null);
let selectedInfo = writable({});

  // New store for server type
  let serverType = writable('');

  function selectEnvironment(event) {
    const envId = event.target.value;
    // Logic to fetch and set the selected environment information
  }
  
</script>
<div class="bg-white dark:bg-gray-800 p-4">
    <div class="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <div class="flex items-center space-x-2 flex-grow">
          <label for="server-type-selector" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Server Type:
          </label>
          <select
            id="server-type-selector"
            on:change={(e) => serverType.set(e.target.value)}
            class="px-3 py-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
          >
            <option value="">-- Select a Server Type --</option>
            <option value="IBMI">IBMI</option>
            <option value="UNIX">UNIX</option>
          </select>
        </div>
      </div>
    <!-- <div class="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
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
          {#each $environments as environment (environment.env_oid)}
            <option value={environment.env_oid.toString()}>{environment.env_name}</option>
          {/each}
        </select>
      </div>
    </div> -->
  
    <!-- General Section -->
    <div class="space-y-4 py-4">
      <h1 class="text-xl font-bold text-[#FFAA33]">General</h1>
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Name:</label>
        <input type="text" bind:value={$selectedInfo.env_name} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" readonly>
      </div>
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Default behavior:</label>
        <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled>
          <option></option>
        </select>
      </div>
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Installation resources:</label>
        <select class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled>
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
          <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
          <input id="thread-max-number" type="number" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" value="1" min="1" />
        </div>
        <h2 class="text-lg font-bold mb-2">Components</h2>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center">
            <label for="sde-callext-ws" class="mr-2">SDE_CALLEXT_WS:</label>
            <select id="sde-callext-ws" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center">
            <label for="sde-rest" class="mr-2">SDE_REST:</label>
            <select id="sde-rest" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center">
            <label for="sde-cxf" class="mr-2">SDE_CXF:</label>
            <select id="sde-cxf" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center">
            <label for="sde-jms" class="mr-2">SDE_JMS:</label>
            <select id="sde-jms" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
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
        <input id="thread-max-number" type="number" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" value="1" min="1" />
      </div>
      <h2 class="text-lg font-bold mb-2">Components</h2>
      <div class="grid grid-cols-3 gap-4">
        {#if $serverType === 'UNIX'}
          <div class="flex items-center w-full">
            <label for="core-config" class="mr-2 w-1/3">CORE_CONFIG:</label>
            <select id="core-config" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
              <option>Automatic installation</option>
              <option>Ignore</option>
              <option>Manual installation</option>
            </select>
          </div>
          <!-- Add all the other UNIX components here -->
          <div class="flex items-center w-full">
            <label for="core-java" class="mr-2 w-1/3">CORE_JAVA:</label>
            <select id="core-java" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
              <option>Automatic installation</option>
              <option>Ignore</option>
              <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="documents-zip" class="mr-2 w-1/3">DOCUMENTS_ZIP:</label>
            <select id="documents-zip" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
              <option>Automatic installation</option>
              <option>Ignore</option>
              <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="documents-pdf" class="mr-2 w-1/3">DOCUMENT_PDF:</label>
            <select id="documents-pdf" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
              <option>Automatic installation</option>
              <option>Ignore</option>
              <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="ext-files" class="mr-2 w-1/3">EXT_FILES:</label>
            <select id="ext-files" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="tldinf-config" class="mr-2 w-1/3">TLDINF_CONFIG:</label>
            <select id="tldinf-config" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="tldinf-ressource" class="mr-2 w-1/3">TLDINF_RESSOURCE:</label>
            <select id="tldinf-ressource" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="tld-config" class="mr-2 w-1/3">TLD_CONFIG:</label>
            <select id="tld-config" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="tld-ressource" class="mr-2 w-1/3">TLD_RESSOURCE:</label>
            <select id="tld-ressource" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
              <label for="ux-cobol-gen" class="mr-2 w-1/3">UX_COBOL_GEN:</label>
              <select id="ux-cobol-gen" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-cobol-std" class="mr-2 w-1/3">UX_COBOL_STD:</label>
              <select id="ux-cobol-std" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-config" class="mr-2 w-1/3">UX_CONFIG:</label>
              <select id="ux-config" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-cpy-gen" class="mr-2 w-1/3">UX_CPY_GEN:</label>
              <select id="ux-cpy-gen" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-cpy-std" class="mr-2 w-1/3">UX_CPY_STD:</label>
              <select id="ux-cpy-std" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-data" class="mr-2 w-1/3">UX_DATA:</label>
              <select id="ux-data" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-data-area" class="mr-2 w-1/3">UX_DATA_AREA:</label>
              <select id="ux-data-area" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-infra-c" class="mr-2 w-1/3">UX_INFRA_C:</label>
              <select id="ux-infra-c" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-infra-cobol" class="mr-2 w-1/3">UX_INFRA_COBOL:</label>
              <select id="ux-infra-cobol" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-infra-noyau" class="mr-2 w-1/3">UX_INFRA_NOYAU:</label>
              <select id="ux-infra-noyau" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-infra-runtime" class="mr-2 w-1/3">UX_INFRA_RUNTIME:</label>
              <select id="ux-infra-runtime" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-infra-scripts" class="mr-2 w-1/3">UX_INFRA_SCRIPTS:</label>
              <select id="ux-infra-scripts" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-infra-socket" class="mr-2 w-1/3">UX_INFRA_SOCKET:</label>
              <select id="ux-infra-socket" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-infra-sql" class="mr-2 w-1/3">UX_INFRA_SQL:</label>
              <select id="ux-infra-sql" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-infra-x3" class="mr-2 w-1/3">UX_INFRA_X3:</label>
              <select id="ux-infra-x3" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-java" class="mr-2 w-1/3">UX_JAVA:</label>
              <select id="ux-java" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-lib-c" class="mr-2 w-1/3">UX_LIB_C:</label>
              <select id="ux-lib-c" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-sonde" class="mr-2 w-1/3">UX_SONDE:</label>
              <select id="ux-sonde" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-sqlscripts" class="mr-2 w-1/3">UX_SQLSCRIPTS:</label>
              <select id="ux-sqlscripts" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-sql-x3s-sab" class="mr-2 w-1/3">UX_SQL_X3S_SAB:</label>
              <select id="ux-sql-x3s-sab" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-sql-x3s-sjs" class="mr-2 w-1/3">UX_SQL_X3S_SJS:</label>
              <select id="ux-sql-x3s-sjs" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-terminfo" class="mr-2 w-1/3">UX_TERMINFO:</label>
              <select id="ux-terminfo" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-tools" class="mr-2 w-1/3">UX_TOOLS:</label>
              <select id="ux-tools" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-ws-cpy" class="mr-2 w-1/3">UX_WS_CPY:</label>
              <select id="ux-ws-cpy" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-ws-gen" class="mr-2 w-1/3">UX_WS_GEN:</label>
              <select id="ux-ws-gen" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-ws-res" class="mr-2 w-1/3">UX_WS_RES:</label>
              <select id="ux-ws-res" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="ux-xml-data" class="mr-2 w-1/3">UX_XML_DATA:</label>
              <select id="ux-xml-data" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
              </select>
            </div>
       
        {/if}
        {#if $serverType === 'IBMI'}
          <div class="flex items-center w-full">
            <label for="core-config" class="mr-2 w-1/3">CORE_CONFIG:</label>
            <select id="core-config" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
              <option>Automatic installation</option>
              <option>Ignore</option>
              <option>Manual installation</option>
            </select>
          </div>
          <!-- Add all the other IBMI components here -->
          <div class="flex items-center w-full">
            <label for="core-java" class="mr-2 w-1/3">CORE_JAVA:</label>
            <select id="core-java" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
              <option>Automatic installation</option>
              <option>Ignore</option>
              <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="documents-zip" class="mr-2 w-1/3">DOCUMENTS_ZIP:</label>
            <select id="documents-zip" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
              <option>Automatic installation</option>
              <option>Ignore</option>
              <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="documents-pdf" class="mr-2 w-1/3">DOCUMENT_PDF:</label>
            <select id="documents-pdf" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
              <option>Automatic installation</option>
              <option>Ignore</option>
              <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="ext-files" class="mr-2 w-1/3">EXT_FILES:</label>
            <select id="ext-files" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
              <option>Automatic installation</option>
              <option>Ignore</option>
              <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="ibmi-obj" class="mr-2 w-1/3">IBMI_OBJ:</label>
            <select id="ibmi-obj" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
              <option>Automatic installation</option>
              <option>Ignore</option>
              <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="tldinf-config" class="mr-2 w-1/3">TLDINF_CONFIG:</label>
            <select id="tldinf-config" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="tldinf-ressource" class="mr-2 w-1/3">TLDINF_RESSOURCE:</label>
            <select id="tldinf-ressource" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="tld-config" class="mr-2 w-1/3">TLD_CONFIG:</label>
            <select id="tld-config" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center w-full">
            <label for="tld-ressource" class="mr-2 w-1/3">TLD_RESSOURCE:</label>
            <select id="tld-ressource" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                <option>Automatic installation</option>
                <option>Ignore</option>
                <option>Manual installation</option>
            </select>
          </div>
         
          <!-- Add the rest of the IBMI components here -->
        {/if}
      </div>
    </div>
  <!-- Rest of the form -->
    </div>
  
    <!-- FlowMind Server Section -->
    <div class="space-y-4 py-4">
      <h1 class="text-xl font-bold text-[#FFAA33]">FlowMind Server</h1>
      <div class="overflow-x-auto mb-6">
        <h2 class="text-lg font-bold mb-2">Parallel installations</h2>
        <div class="flex items-center mb-4">
          <label for="thread-max-number" class="mr-2">Thread maximum number:</label>
          <input id="thread-max-number" type="number" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" value="1" min="1" />
        </div>
        <h2 class="text-lg font-bold mb-2">Components</h2>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center">
            <label for="sde-callext-ws" class="mr-2">BPM_FLOWBEAN:</label>
            <select id="sde-callext-ws" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center">
            <label for="sde-rest" class="mr-2">BPM_RESSOURCE:</label>
            <select id="sde-rest" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
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
          <input id="thread-max-number" type="number" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" value="1" min="1" />
        </div>
        <h2 class="text-lg font-bold mb-2">Components</h2>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center">
            <label for="sde-callext-ws" class="mr-2">CONFIG_RESSOURCE:</label>
            <select id="sde-callext-ws" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
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
          <input id="thread-max-number" type="number" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" value="1" min="1" />
        </div>
        <h2 class="text-lg font-bold mb-2">Components</h2>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center">
            <label for="sde-callext-ws" class="mr-2">UX_WEB_RESSOURCE:</label>
            <select id="sde-callext-ws" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
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
          <input id="thread-max-number" type="number" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" value="1" min="1" />
        </div>
        <h2 class="text-lg font-bold mb-2">Components</h2>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center">
            <label for="sde-callext-ws" class="mr-2">WSSAB_AAR:</label>
            <select id="sde-callext-ws" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
          <div class="flex items-center">
            <label for="sde-rest" class="mr-2">WSSAB_WS:</label>
            <select id="sde-rest" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
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
          <input id="thread-max-number" type="number" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" value="1" min="1" />
        </div>
        <h2 class="text-lg font-bold mb-2">Components</h2>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center">
            <label for="sde-callext-ws" class="mr-2">X3_RESSOURCE:</label>
            <select id="sde-callext-ws" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
            </select>
          </div>
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
            <input id="thread-max-number" type="number" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" value="1" min="1" />
          </div>
          <h2 class="text-lg font-bold mb-2">Components</h2>
          <div class="grid grid-cols-3 gap-4">
            <div class="flex items-center w-full">
              <label for="db-data" class="mr-2 w-1/3">DB_DATA:</label>
              <select id="db-data" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="db-struct" class="mr-2 w-1/3">DB_STRUCT:</label>
              <select id="db-struct" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="db-view" class="mr-2 w-1/3">DB_VIEW:</label>
              <select id="db-view" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="x3s-birt-rep" class="mr-2 w-1/3">X3S_BIRT_REP:</label>
              <select id="x3s-birt-rep" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="x3s-editique-map" class="mr-2 w-1/3">X3S_EDITIQUE_MAP:</label>
              <select id="x3s-editique-map" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="x3s-editique-sql" class="mr-2 w-1/3">X3S_EDITIQUE_SQL:</label>
              <select id="x3s-editique-sql" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="x3s-ejb" class="mr-2 w-1/3">X3S_EJB:</label>
              <select id="x3s-ejb" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="x3s-plat-rep" class="mr-2 w-1/3">X3S_PLAT_REP:</label>
              <select id="x3s-plat-rep" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="x3s-service-map" class="mr-2 w-1/3">X3S_SERVICE_MAP:</label>
              <select id="x3s-service-map" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
              </select>
            </div>
            <div class="flex items-center w-full">
              <label for="x3s-sqlscript" class="mr-2 w-1/3">X3S_SQLSCRIPT:</label>
              <select id="x3s-sqlscript" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-2/3">
                  <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
              </select>
            </div>
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
            <input id="thread-max-number" type="number" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" value="1" min="1" />  
          </div>
          <h2 class="text-lg font-bold mb-2">Components</h2>
          <div class="flex flex-wrap gap-4">
          <div class="flex items-center">
          <label for="sde-callext-ws" class="mr-2">YP_BANK_MODULES:</label>
          <select id="sde-callext-ws" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
            <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
          </select>
          </div>
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
                <input id="thread-max-number" type="number" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" value="1" min="1" />
              </div>
            <h2 class="text-lg font-bold mb-2">Components</h2>
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center">
                <label for="sde-callext-ws" class="mr-2">YP_CUST_MODULES:</label>
                <select id="sde-callext-ws" class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                    <option>Automatic installation</option>
                  <option>Ignore</option>
                  <option>Manual installation</option>
                </select>
              </div>
            </div>
          </div>
    </div>

      <!-- Validate Cancel Section -->
    <div class="bg-white dark:bg-gray-800 p-4 mt-4">
          <div class="flex justify-start items-center space-x-4">
            <button class="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm">
              Validate
            </button>
            <button class="bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
              Cancel
            </button>
          </div>
    </div>

    </div>
  