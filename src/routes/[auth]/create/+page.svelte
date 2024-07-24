<script lang="ts">
    import { onMount } from 'svelte';
    import client from '$lib/apolloClient';
    import * as Tabs from "$lib/components/ui/tabs";
    import DeletePage from '../delete/+page.svelte';
    import EditPage from '../edit/+page.svelte';
    import {
      newEnvironmentName,
      newHostType,
      encryptionType,
      communicationType,
      configurator,
      showInputs,
      selectedDuplicateEnvId,
      environments,
      errorMessage,
      technicalMessage,
      selectedEnvironmentId,
      connectionDetails,
      sshConnection,
      sshConnections,
      newSshConnections,
      remoteConnectionFeatures,
      newRemoteConnectionFeature,
      newWasAppServerConfig,
      newTomcatAppServerConfig,
      wasAppServerConfigs,
	    tomcatAppServerConfigs,
      wasConnections,
      newWasConnections,
      connectionTestResults,
      connectionStatuses,

    } from '$lib/stores';
    import { CREATE_ENVIRONMENT, DELETE_ENVIRONMENT,CREATE_DATABASE_CONNECTION, CREATE_BDDHOST_CONNECTION, CREATE_BDDX3S_CONNECTION, CREATE_BDDTLM_CONNECTION, CREATE_SABBPM_CONNECTION, CREATE_WAS_CONNECTION, CREATE_SSH_CONNECTION, CREATE_SFTP_CONNECTION, CREATE_APPPARAM, CREATE_COMPONENT, CREATE_INSTCONFIG ,GET_ENV, CREATE_REMOTE_CONNECTION_FEATURE, CREATE_TOMCAT_APP_SERVER_CONFIG, CREATE_WAS_APP_SERVER_CONFIG } from '$lib/mutation';
    import { get, writable } from 'svelte/store';
    import type { ConnectionInfo, Component, ComponentsMap, RemoteConnectionFeature, ConnectionStatuses } from '$lib/stores'
    import * as Popover from "$lib/components/ui/popover";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Progress } from '$lib/components/ui/progress';
    import * as Accordion from "$lib/components/ui/accordion";

    // import { toast } from "svelte-sonner";

    // import MyClass from './path/to/MyClass';

    // const myInstance = new MyClass();
    
    let testingInProgress = writable(false);
    let testProgress = writable(0);
    let testMessage = writable('');
    let showProgressPopover = writable(false);
    

    let canCreate = writable(false);
    $: {
    const sshValid = !!$connectionDetails.SSH.host && !!$connectionDetails.SSH.port && !!$connectionDetails.SSH.username && ($connectionDetails.SSH.authType === 'Password' ? !!$connectionDetails.SSH.password : (!!$connectionDetails.SSH.privateKey && !!$connectionDetails.SSH.publicKey));
    const sftpValid = !!$connectionDetails.SFTP.remoteDirectory;
    const bpmValid = !!$connectionDetails.BPM.username && !!$connectionDetails.BPM.language && !!$connectionDetails.BPM.password;
    const hostValid = !!$connectionDetails.Host.host && !!$connectionDetails.Host.port && !!$connectionDetails.Host.username && !!$connectionDetails.Host.password;
    const x3sValid = !!$connectionDetails.X3S.host && !!$connectionDetails.X3S.port && !!$connectionDetails.X3S.username && !!$connectionDetails.X3S.password;
    const tlmValid = !!$connectionDetails.TLM.host && !!$connectionDetails.TLM.port && !!$connectionDetails.TLM.username && !!$connectionDetails.TLM.password;

    canCreate.set(sshValid && sftpValid && bpmValid && hostValid && x3sValid && tlmValid);
  }

    function openProgressPopover() {
      showProgressPopover.set(true);
      testingInProgress.set(true);
      testProgress.set(0);
      document.body.style.overflow = 'hidden';
    }

    function closeProgressPopover() {
        showProgressPopover.set(false);
        testingInProgress.set(false);
        document.body.style.overflow = 'auto';
    }

    type ConnectionType = 'Host' | 'TLM' | 'X3S';

  let webspherePopoverOpen = false;

function toggleWebspherePopover(isEdit = false) {
  console.log("popover toggled");
  webspherePopoverOpen = !webspherePopoverOpen;
  if (webspherePopoverOpen && !isEdit) {
    resetWasConnection();
  }
  if (webspherePopoverOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
    errorMessage.set('');
  }
}

function resetSshConnection() {
  newSshConnections.set({
    con_oid: 0,
    authType: 'Password',
    host: '',
    port: 22,
    username: '',
    password: '',
    privateKey: '',
    publicKey: '',
    passphrase: ''
  });
  newRemoteConnectionFeature.set({
    ssh_con_oid: 0,
    was_con_oid: 0,
    propagation: false,
    installation: false,
    dmgr: false,
    instance_name: '',
    type: 'Websphere',
    app_server: '',
    is_main: false,
    probe_application: ''
  });
  newWasAppServerConfig.set({
    was_config_oid: 0,
    upload_mode_enabled: false,
    was_cell: '',
    was_node: '',
    was_cluster: '',
    was_name: '',
    was_con_oid: 0,
    targets: '',
    feature_oid: 0,
    
  });
  newTomcatAppServerConfig.set({
    tomcat_config_oid: 0,
    server_name: '',
    port: 22,
    binary_location: '',
    portlets_location: '',
    feature_oid: 0
  });
}

function resetWasConnection() {
  newWasConnections.set({
    con_oid: 0,
    env_oid: 0,
    name: '',
    host: '',
    username: '',
    password: '',
    sslConfigUrl: '',
    securityEnabled: false,
    truststore: '',
    keystore: '',
    keystoreType: '',
    port: 0,
    soapConfigUrl: '',
    sasConfigUrl: '',
    truststorePassword: '',
    keystorePassword: '',
  });
}

let sshPopoverOpen = false;

function toggleSshspherePopover(isEdit = false) {
  console.log("popover toggled");
  sshPopoverOpen = !sshPopoverOpen;
  if (sshPopoverOpen && !isEdit) {
    resetSshConnection();
  }
  if (sshPopoverOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}

// Load environments on mount
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
    openProgressPopover();
    testMessage.set('Starting connection creation...');
    let progress = 0;
    let success = true;
    let envOid = get(selectedEnvironmentId);
    let hostType = get(newHostType);

    const updateProgress = () => {
      progress += 10;
    };

  const rollbackEnvironment = async () => {
    if (envOid) {
      try {
        await client.mutate({
          mutation: DELETE_ENVIRONMENT,
          variables: {
            env_oid: envOid
          }
        });
        console.log('Environment rolled back.');
      } catch (error) {
        console.error('Failed to rollback environment:', error);
      }
    }
  };

  if (!envOid) {
    console.log(newEnvironmentName+">>>>>>>>>>>")
    console.log(configurator + ">>>>>>>>>>>>>");
    console.log('Active Configurator Value:', get(configurator));
    try {
      const result = await client.mutate({
        mutation: CREATE_ENVIRONMENT,
        variables: {
          env_name: get(newEnvironmentName),
          host_type: get(newHostType),
          encryption_type: get(encryptionType),
          communication_type: get(communicationType),
          active_configurator: get(configurator)
        }
      });
      envOid = result.data.insert_console_environment_one.env_oid;
      selectedEnvironmentId.set(envOid);
      environments.update(envs => [...envs, result.data.insert_console_environment_one]);
      console.log('Created Environment OID:', envOid); 
      if (!envOid) {
        throw new Error('Environment OID is null after creation.');
      }
      updateProgress();
    } catch (error: string) {
      console.error('Error creating environment:', error);
      errorMessage.set('Error creating environment.');
      technicalMessage.set(error.message || "Unknown technical error");
      success = false;
    }
  }

  if (success) {
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
      updateProgress();

      const sftpDetails = get(connectionDetails).SFTP;
      if (sshResult.data && sshResult.data.insert_console_sshconnection_one.con_oid) {
        const formattedSftpDetails = {
          remote_directory: sftpDetails.remoteDirectory,
          is_active: sftpDetails.isActive
        }
        const sftpResult = await client.mutate({
          mutation: CREATE_SFTP_CONNECTION,
          variables: {
            env_oid: envOid,
            ssh_con_oid: sshResult.data.insert_console_sshconnection_one.con_oid,
            ...formattedSftpDetails
          }
        });
        console.log('SFTP Connection Created:', sftpResult);
        updateProgress();
      }
    } catch (error) {
      console.error('Failed to create SSH/SFTP connection:', error);
      success = false;
    }
  }


  if (success) {
    for (const type of ['Host', 'TLM', 'X3S'] as ConnectionType[]) {
      const connectionParams = get(connectionDetails)[type];
      const bddConOid = await createDatabaseConnection(type, connectionParams);
      if (!bddConOid) {
        console.error(`Failed to create ${type} database connection: bddConOid is null`);
        success = false;
        break;
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
        updateProgress();
      } catch (error) {
        console.error(`Failed to create ${type} specialized connection:`, error);
        success = false;
        break;
      }
    }
  }

  if (success) { 
  console.log('Attempting to create BPM connection with envOid:', envOid);
  try {
    const bpmParams = get(connectionDetails).BPM;
    console.log('BPM Params:', bpmParams);
    const bpmResult = await client.mutate({
      mutation: CREATE_SABBPM_CONNECTION,
      variables: {
        env_oid: envOid,
        ...bpmParams
      }
    });
    console.log('BPM Connection Created:', bpmResult);
    updateProgress();
  } catch (error) {
    console.error('Failed to create BPM connection:', error);
    success = false;
  }
}

  // Initialize maps outside the if block
 
  type ConnectionIdMap = { [key: number]: number };

  const wasConnectionIdMap: ConnectionIdMap = {};
  const sshConnectionIdMap: ConnectionIdMap = {};

  if (success) {
    const wasConnectionDetails = get(wasConnections);

    for (const [index, wasConnection] of wasConnectionDetails.entries()) {
      try {
        const formattedWasDetails = {
          name: wasConnection.name,
          host: wasConnection.host,
          port: wasConnection.port,
          security_enabled: wasConnection.securityEnabled,
          username: wasConnection.username,
          password: wasConnection.password,
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

        const newId = wasResult.data.insert_console_wasconnection_one.con_oid;
        wasConnectionIdMap[index] = newId;

        console.log('WAS Connection Created:', wasResult);
        updateProgress();
      } catch (error) {
        console.error('Failed to create WAS connection:', error);
        success = false;
        break;
      }
    }
  }

  if (success) {
    const sshConnectionDetails = get(sshConnections);

    for (const [index, sshConnection] of sshConnectionDetails.entries()) {
      try {
        const formattedSshDetails = {
          auth_type: sshConnection.authType,
          host: sshConnection.host,
          port: sshConnection.port,
          username: sshConnection.username,
          password: sshConnection.password,
          private_key: sshConnection.privateKey,
          public_key: sshConnection.publicKey,
          passphrase: sshConnection.passphrase
        };

        const sshResult = await client.mutate({
          mutation: CREATE_SSH_CONNECTION,
          variables: {
            env_oid: envOid,
            ...formattedSshDetails
          }
        });

        const newId = sshResult.data.insert_console_sshconnection_one.con_oid;
        sshConnectionIdMap[index] = newId;

        console.log('SSH Connection Created:', sshResult);
        updateProgress();
      } catch (error) {
        console.error('Failed to create SSH connection:', error);
        success = false;
        break;
      }
    }
  }
  
  if (success) {
    const remoteConnectionFeaturesList = get(remoteConnectionFeatures) as RemoteConnectionFeature[];
    const remoteFeatureIdMap: ConnectionIdMap = {};

    for (const [index, feature] of remoteConnectionFeaturesList.entries()) {
      // const sshConOid = sshConnectionIdMap[feature.ssh_con_oid];
      const sshConOid = sshConnectionIdMap[index];  // Changed line
      console.log(`Processing feature ${index} with ssh_con_oid ${feature.ssh_con_oid}:`, feature);
      console.log(`Mapped sshConOid: ${sshConOid}`);

      if (sshConOid) {
        try {
          const websphereConfig = get(wasAppServerConfigs).find(config => config.feature_oid === feature.ssh_con_oid);
          const wasConOid = feature.type === 'Websphere' && websphereConfig ? wasConnectionIdMap[websphereConfig.was_con_oid] : null;

          const featureResult = await client.mutate({
            mutation: CREATE_REMOTE_CONNECTION_FEATURE,
            variables: {
              env_oid: envOid,
              ssh_con_oid: sshConOid,
              was_con_oid: wasConOid,
              propagation: feature.propagation,
              installation: feature.installation,
              dmgr: feature.dmgr,
              instance_name: feature.instance_name,
              type: feature.type,
              app_server: feature.app_server,
              is_main: feature.is_main,
              probe_application: feature.probe_application
            }
          });

          const newFeatureId = featureResult.data.insert_console_remoteconnectionfeatures_one.feature_oid;
          remoteFeatureIdMap[index] = newFeatureId;

          console.log('Remote Connection Feature Created:', featureResult);

          if (feature.type === 'Tomcat') {
            const tomcatConfig = get(tomcatAppServerConfigs).find(config => config.feature_oid === feature.ssh_con_oid);
            if (tomcatConfig) {
              try {
                const tomcatResult = await client.mutate({
                  mutation: CREATE_TOMCAT_APP_SERVER_CONFIG,
                  variables: {
                    feature_oid: newFeatureId,
                    server_name: tomcatConfig.server_name,
                    port: tomcatConfig.port,
                    binary_location: tomcatConfig.binary_location,
                    portlets_location: tomcatConfig.portlets_location
                  }
                });
                console.log('Tomcat App Server Config Created:', tomcatResult);
                updateProgress();
              } catch (error) {
                console.error('Failed to create Tomcat App Server Config:', error);
                success = false;
                break;
              }
            }
          } else if (feature.type === 'Websphere') {
            if (websphereConfig) {
              try {
                const websphereResult = await client.mutate({
                  mutation: CREATE_WAS_APP_SERVER_CONFIG,
                  variables: {
                    feature_oid: newFeatureId,
                    was_con_oid: wasConOid,
                    upload_mode_enabled: websphereConfig.upload_mode_enabled,
                    was_cell: websphereConfig.was_cell,
                    was_node: websphereConfig.was_node,
                    was_cluster: websphereConfig.was_cluster,
                    was_name: websphereConfig.was_name,
                    targets: websphereConfig.targets
                  }
                });
                console.log('WebSphere App Server Config Created:', websphereResult);
                updateProgress();
              } catch (error) {
                console.error('Failed to create WebSphere App Server Config:', error);
                success = false;
                break;
              }
            }
          }
        } catch (error) {
          console.error('Failed to create remote connection feature:', error);
          success = false;
          break;
        }
      } else {
        console.error(`No SSH connection found for feature with ssh_con_oid: ${feature.ssh_con_oid}`);
        success = false;
        break;
      }
    }
  }

  if (success) {
    try {
      const instConfigResult = await client.mutate({
        mutation: CREATE_INSTCONFIG,
        variables: {
          env_oid: envOid,
          install_type_default: "Automatic installation",
          integration_thread_number: 1
        }
      });

      const instConfigOid = instConfigResult.data.insert_console_installationconfiguration_one.instconfig_oid;

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
      updateProgress();
    } catch (error) {
      console.error('Failed to create installation configuration or parameters:', error);
      success = false;
    }
  }

  if (success) {
    testMessage.set('All connections have been successfully created.');
    testProgress.set(100);
    closeProgressPopover();
    console.log('All required connections have been successfully created.');

    // toast.success("All connections have been successfully created.");

  } else {
    testMessage.set('Failed to create all connections.');
    await rollbackEnvironment();
    closeProgressPopover();
  }
}

const duplicateEnvironment = () => {
};
  
const selectEnvironment = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  selectedDuplicateEnvId.set(target.value ? parseInt(target.value) : null);
};

function toggleAuthType(event: Event) {
    const newAuthType = (event.target as HTMLSelectElement).value as "Password" | "Identity";
    sshConnection.update(current => {
      return { ...current, authType: newAuthType };
    });
}

function addOrUpdateSshConnections() {
  const currentConnection = get(newSshConnections);
  const currentFeature = get(newRemoteConnectionFeature);
  
  // Check if the instance name already exists
  const existingConnection = get(remoteConnectionFeatures).find((feature, index) => feature.instance_name === currentFeature.instance_name && index !== editingIndex);
  if (existingConnection) {
    errorMessage.set('An SSH connection with this instance name already exists. Please choose a different name.');
    return;
  }

  // Check if we are editing an existing connection
  if (editingIndex >= 0) {
    // Update existing SSH connection and feature
    sshConnections.update(connections => {
      connections[editingIndex] = { ...currentConnection };
      return connections;
    });

    remoteConnectionFeatures.update(features => {
      features[editingIndex] = { ...currentFeature };
      return features;
    });

    // Update the app config based on the feature type
    if (currentFeature.type === 'Websphere') {
      const currentWasApp = get(newWasAppServerConfig);
      wasAppServerConfigs.update(configs => {
        configs[editingIndex] = { ...currentWasApp };
        return configs;
      });
    } else if (currentFeature.type === 'Tomcat') {
      const currentTomcat = get(newTomcatAppServerConfig);
      tomcatAppServerConfigs.update(configs => {
        configs[editingIndex] = { ...currentTomcat };
        return configs;
      });
    }

    // Reset the editing index
    editingIndex = -1;
  } else {
    // Add new SSH connection and feature
    sshConnections.update(connections => [...connections, { ...currentConnection }]);
    remoteConnectionFeatures.update(features => [...features, { ...currentFeature }]);

    // Add the app config based on the feature type
    if (currentFeature.type === 'Websphere') {
      const currentWasApp = get(newWasAppServerConfig);
      wasAppServerConfigs.update(configs => [...configs, { ...currentWasApp }]);
    } else if (currentFeature.type === 'Tomcat') {
      const currentTomcat = get(newTomcatAppServerConfig);
      tomcatAppServerConfigs.update(configs => [...configs, { ...currentTomcat }]);
    }
  }

  // Reset the stores
  newRemoteConnectionFeature.set({
    ssh_con_oid: 0,
    was_con_oid: 0,
    propagation: false,
    installation: false,
    dmgr: false,
    instance_name: '',
    type: 'Websphere',
    app_server: '',
    is_main: false,
    probe_application: ''
  });

  newSshConnections.set({
    con_oid: 0,
    authType: 'Password',
    host: '',
    port: 22,
    username: '',
    password: '',
    privateKey: '',
    publicKey: '',
    passphrase: ''
  });

  if (currentFeature.type === 'Websphere') {
    newWasAppServerConfig.set({
      was_config_oid: 0,
      feature_oid: 0,
      was_con_oid: 0,
      upload_mode_enabled: false,
      was_cell: '',
      was_node: '',
      was_cluster: '',
      was_name: '',
      targets: '',
    });
  } else if (currentFeature.type === 'Tomcat') {
    newTomcatAppServerConfig.set({
      tomcat_config_oid: 0,
      feature_oid: 0,
      server_name: '',
      port: 22,
      binary_location: '',
      portlets_location: '',
    });
  }

  errorMessage.set(''); // Clear any previous error messages
  toggleSshspherePopover();
}

let editingIndex = -1;

function editWasConnection(index: number) {
  const connectionToEdit = get(wasConnections)[index];
  newWasConnections.set({ ...connectionToEdit });
  editingIndex = index;
  viewingMode = false;
  toggleWebspherePopover(true);
}

function viewWasConnection(index: number) {
  const connectionToView = get(wasConnections)[index];
  newWasConnections.set({ ...connectionToView });
  editingIndex = index;
  viewingMode = true;
  toggleWebspherePopover(true);
}

function editSshConnection(index: number) {
  const connectionToEdit = get(sshConnections)[index];
  newSshConnections.set({ ...connectionToEdit });

  const featureToEdit = get(remoteConnectionFeatures)[index];
  newRemoteConnectionFeature.set({ ...featureToEdit });

  if (featureToEdit.type === 'Websphere') {
    const wasConfig = get(wasAppServerConfigs).find(config => config.feature_oid === featureToEdit.ssh_con_oid);
    if (wasConfig) {
      newWasAppServerConfig.set({
        was_config_oid: wasConfig.was_config_oid ?? 0,
        feature_oid: wasConfig.feature_oid ?? 0,
        was_con_oid: wasConfig.was_con_oid ?? 0,
        upload_mode_enabled: wasConfig.upload_mode_enabled ?? false,
        was_cell: wasConfig.was_cell ?? '',
        was_node: wasConfig.was_node ?? '',
        was_cluster: wasConfig.was_cluster ?? '',
        was_name: wasConfig.was_name ?? '',
        targets: wasConfig.targets ?? '',
      });
    }
  } else if (featureToEdit.type === 'Tomcat') {
    const tomcatConfig = get(tomcatAppServerConfigs).find(config => config.feature_oid === featureToEdit.ssh_con_oid);
    if (tomcatConfig) {
      newTomcatAppServerConfig.set({
        tomcat_config_oid: tomcatConfig.tomcat_config_oid ?? 0,
        feature_oid: tomcatConfig.feature_oid ?? 0,
        server_name: tomcatConfig.server_name ?? '',
        port: tomcatConfig.port ?? 0,
        binary_location: tomcatConfig.binary_location ?? '',
        portlets_location: tomcatConfig.portlets_location ?? '',
      });
    }
  }

  editingIndex = index;
  viewingMode = false;
  toggleSshspherePopover(true);
}

function displaySshConnection(index: number) {
  const connectionToView = get(sshConnections)[index];
  newSshConnections.set({ ...connectionToView });

  const featureToView = get(remoteConnectionFeatures)[index];
  newRemoteConnectionFeature.set({ ...featureToView });

  if (featureToView.type === 'Websphere') {
    const wasConfig = get(wasAppServerConfigs).find(config => config.feature_oid === featureToView.ssh_con_oid);
    if (wasConfig) {
      newWasAppServerConfig.set({
        was_config_oid: wasConfig.was_config_oid ?? 0,
        feature_oid: wasConfig.feature_oid ?? 0,
        was_con_oid: wasConfig.was_con_oid ?? 0,
        upload_mode_enabled: wasConfig.upload_mode_enabled ?? false,
        was_cell: wasConfig.was_cell ?? '',
        was_node: wasConfig.was_node ?? '',
        was_cluster: wasConfig.was_cluster ?? '',
        was_name: wasConfig.was_name ?? '',
        targets: wasConfig.targets ?? '',
      });
    }
  } else if (featureToView.type === 'Tomcat') {
    const tomcatConfig = get(tomcatAppServerConfigs).find(config => config.feature_oid === featureToView.ssh_con_oid);
    if (tomcatConfig) {
      newTomcatAppServerConfig.set({
        tomcat_config_oid: tomcatConfig.tomcat_config_oid ?? 0,
        feature_oid: tomcatConfig.feature_oid ?? 0,
        server_name: tomcatConfig.server_name ?? '',
        port: tomcatConfig.port ?? 0,
        binary_location: tomcatConfig.binary_location ?? '',
        portlets_location: tomcatConfig.portlets_location ?? ''
      });
    }
  }

  editingIndex = index;
  viewingMode = true; // Set viewing mode to true
  toggleSshspherePopover(true);
}

function addOrUpdateWasConnections() {
  const currentConnection = get(newWasConnections);

 // Check if the connection name already exists
 const existingConnection = get(wasConnections).find((conn, index) => conn.name === currentConnection.name && index !== editingIndex);
  if (existingConnection) {
    errorMessage.set('A WebSphere connection with this name already exists. Please choose a different name.');
    return;
  }

  // wasConnections.update(connections => [...connections, { ...currentConnection }]);

  wasConnections.update(connections => {
    if (editingIndex >= 0) {
      // Update existing connection
      connections[editingIndex] = { ...currentConnection };
      editingIndex = -1; // Reset editing index
    } else {
      // Add new connection
      connections.push({ ...currentConnection });
    }
    return connections;
  });

  // Reset the new WebSphere connection store
  newWasConnections.set({
    con_oid: 0,
    env_oid: 0,
    name: '',
    host: '',
    username: '',
    password: '',
    sslConfigUrl: '',
    securityEnabled: false,
    truststore: '',
    keystore: '',
    keystoreType: '',
    port: 0,
    soapConfigUrl: '',
    sasConfigUrl: '',
    truststorePassword: '',
    keystorePassword: '',
  });

  errorMessage.set(''); // Clear any previous error messages
  toggleWebspherePopover();
}
    $: if ($sshConnections.length > 0) console.log('Current SSH Connections:', $sshConnections);
    $: if ($remoteConnectionFeatures.length > 0) console.log('Current Remote Connection Features:', $remoteConnectionFeatures);
    $: if ($wasAppServerConfigs.length > 0) console.log('Current WAS App Server Configurations:', $wasAppServerConfigs);
    $: if ($tomcatAppServerConfigs.length > 0) console.log('Current Tomcat App Server Configurations:', $tomcatAppServerConfigs);
    $: if ($wasConnections.length > 0) console.log('Current WAS Connections:', $wasConnections);

    $: console.log('Current SSH Connections:', $sshConnections);
    $: console.log('Current WAS Connections:', $wasConnections);

    $: {
    if ($newHostType === 'IBMI') {
      $connectionDetails.Host.type = 'DB2';
      $connectionDetails.TLM.type = 'DB2';
      $connectionDetails.X3S.type = 'DB2';
    } else {
      $connectionDetails.Host.type = 'ORACLE';
      $connectionDetails.TLM.type = 'ORACLE';
      $connectionDetails.X3S.type = 'ORACLE';
    }
  }

    function removeSshConnection(index: number) {
  const currentFeature = get(remoteConnectionFeatures)[index];

  // Remove SSH connection
  sshConnections.update(current => {
    const updated = [...current];
    updated.splice(index, 1);
    return updated;
  });

  // Remove correspondingfeature
  remoteConnectionFeatures.update(current => {
    const updated = [...current];
    updated.splice(index, 1);
    return updated;
  });

  // Remove corresponding app server configuration
  if (currentFeature) {
    if (currentFeature.type === 'Websphere') {
      wasAppServerConfigs.update(current => {
        const updated = [...current];
        updated.splice(index, 1);
        return updated;
      });
    } else if (currentFeature.type === 'Tomcat') {
      tomcatAppServerConfigs.update(current => {
        const updated = [...current];
        updated.splice(index, 1);
        return updated;
      });
    }
  }
  }

  function removeWasConnection(index: number) {
    wasConnections.update(current => {
      const updated = [...current];
      updated.splice(index, 1);
      return updated;
    });
  }

  function handleApplicationChange(application: any) {
    newRemoteConnectionFeature.update(current => ({ ...current, probe_application: application }));
  }

  $: {
    if ($newRemoteConnectionFeature.type === 'Tomcat' && $newRemoteConnectionFeature.probe_application !== 'YPC') {
      newRemoteConnectionFeature.update(current => ({
        ...current,
        probe_application: 'YPC',
        propagation: true,
        dmgr: false
      }));
    } else if ($newRemoteConnectionFeature.type === 'Websphere') {
      newRemoteConnectionFeature.update(current => ({
        ...current,
        propagation: true
      }));
    }
  }


  async function testSshConnection(connection: any, index: number) {
    openProgressPopover();
    testMessage.set(`Starting test for connection ${index + 1}...`);

    console.log(newEnvironmentName);
    console.log(newHostType);

    const testUrl = 'http://localhost:8085/console/env-management/v1/test-connections';
    const requestBody = {
        envName: $newEnvironmentName,
        hostType: $newHostType,
        encryptionType: $encryptionType,
        communicationType: "SSH",
        connections: [{
            action: "test",
            connection: {
                connectionType: "SSH",
                authType: connection.authType,
                host: connection.host,
                port: connection.port,
                user: connection.username,
                password: connection.password,
                privateKey: connection.privateKey,
                publicKey: connection.publicKey,
                passphrase: connection.passphrase
            }
        }]
    };

    console.log("Request body being sent:", JSON.stringify(requestBody, null, 2));

    try {
        const response = await fetch(testUrl, {
            method: 'POST',
            mode: 'cors', // Enable cors mode
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Add required headers
            },
            body: JSON.stringify(requestBody)
        });

        let timer = setInterval(() => {
            testProgress.update(n => {
                if (n < 100) return n + 10;
                clearInterval(timer);
                return 100;
            });
        }, 100); // Adjust interval speed as needed

        const responseData = await response.json();
        clearInterval(timer);
        console.log('Response data:', responseData);

        if (responseData.success) {
            testMessage.set(`Connection ${index + 1} tested successfully!`);
        } else {
            const errorMessages = responseData.data.connections[0].testResult.feedbacks.join(', ') || 'Unknown error';
            testMessage.set(`Connection ${index + 1} failed: ${errorMessages}`);
        }
        testProgress.set(100);
    } catch (error: string) {
        console.error('Failed test for connection', index, error);
        testMessage.set(`Failed test for connection ${index + 1}: ${error.message}`);
    }
}


// Function to test a specific connection
async function testConnection(connection: any, index: number, connectionType: string) {
    openProgressPopover();
    testMessage.set(`Starting test for connection ${index + 1}...`);

    const testUrl = 'http://localhost:8085/console/env-management/v1/test-connections';
    const requestBody = {
      envName: $newEnvironmentName,
      hostType: $newHostType,
      encryptionType: $encryptionType,
      communicationType: 'SSH',
      connections: [
        {
          action: "test",
          connection: {
                  connectionType: connectionType,
                    type: connection.type,
                    authType: connection.authType,
                    host: connection.host,
                    port: connection.port,
                    user: connection.user,
                    password: connection.password,
                    privateKey: connection.privateKey,
                    publicKey: connection.publicKey,
                    passphrase: connection.passphrase,
                    schema: connection.schema,
                    sid: connection.sid,
                    freeEntry: connection.freeEntry,
                }
        }
      ]
    };
    console.log("Request body being sent:", JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(requestBody)
      });

       // Update the progress bar incrementally
       let timer = setInterval(() => {
            testProgress.update(n => {
                if (n < 100) return n + 10; // Increment by 10%
                clearInterval(timer);
                return 100;
            });
        }, 1000); // Adjust interval speed as needed

      const responseData = await response.json();
      clearInterval(timer);

      if (responseData.success) {
        testMessage.set(`Connection ${index + 1} tested successfully!`);
        if (connectionType === 'BDDHOST') {
        connectionStatuses.update(statuses => ({ ...statuses, host: 'success' }));
      } else if (connectionType === 'BDDX3S') {
        connectionStatuses.update(statuses => ({ ...statuses, x3s: 'success' }));
      } else if (connectionType === 'BDDTLM') {
        connectionStatuses.update(statuses => ({ ...statuses, tlm: 'success' }));
      } else if (connectionType === 'SSH') {
        connectionStatuses.update(statuses => {
          const newStatuses = [...statuses.ssh];
          newStatuses[index] = 'success';
          return { ...statuses, ssh: newStatuses };
        });
      }
      } else {
        const errorMessages = responseData.data.connections[0].testResult.feedbacks.join(', ') || 'Unknown error';
        testMessage.set(`Connection ${index + 1} failed: ${errorMessages}`);
        if (connectionType === 'BDDHOST') {
        connectionStatuses.update(statuses => ({ ...statuses, host: 'failure' }));
      } else if (connectionType === 'BDDX3S') {
        connectionStatuses.update(statuses => ({ ...statuses, x3s: 'failure' }));
      } else if (connectionType === 'BDDTLM') {
        connectionStatuses.update(statuses => ({ ...statuses, tlm: 'failure' }));
      } else if (connectionType === 'SSH') {
        connectionStatuses.update(statuses => {
          const newStatuses = [...statuses.ssh];
          newStatuses[index] = 'failure';
          return { ...statuses, ssh: newStatuses };
        });
      }
      }
      testProgress.set(100);
    } catch (error: string) {
      console.error('Failed to test connection', index, error);
      testMessage.set(`Failed to test connection ${index + 1}: ${error.message}`);
      technicalMessage.set(error.message || 'Unknown technical error');
    }
  }

 // Function to test all connections
 async function testAllConnections() {
    openProgressPopover();
    testMessage.set(`Starting test for all connections...`);

    const testUrl = 'http://localhost:8085/console/env-management/v1/test-connections';
    
    const sshConnectionsDetails = get(sshConnections).map((connection, index) => ({
      action: "test",
      connection: {
        connectionType: "SSH",
        authType: connection.authType,
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        privateKey: connection.privateKey,
        publicKey: connection.publicKey,
        passphrase: connection.passphrase
      }
    }));

    const wasConnectionsDetails = get(wasConnections).map((connection, index) => ({
      action: "test",
      connection: {
        connectionType: "WAS",
        host: connection.host,
        port: connection.port,
        securityEnabled: connection.securityEnabled,
        username: connection.username,
        password: connection.password,
        sslConfigURL: connection.sslConfigUrl,
        soapConfigURL: connection.soapConfigUrl,
        sasConfigURL: connection.sasConfigUrl,
        trustStore: connection.truststore,
        trustStorePassword: connection.truststorePassword,
        keyStore: connection.keystore,
        keyStorePassword: connection.keystorePassword
      }
    }));

    // Add other connections here (BDDHOST, X3S, TLM, etc.)
    const sshConnection = {
      action: "test",
      connection: {
        connectionType: "SSH",
        authType: $connectionDetails.SSH.authType,
        host: $connectionDetails.SSH.host,
        port: $connectionDetails.SSH.port,
        user: $connectionDetails.SSH.username,
        password: $connectionDetails.SSH.password,
        privateKey: $connectionDetails.SSH.privateKey,
        publicKey: $connectionDetails.SSH.publicKey,
        passphrase: $connectionDetails.SSH.passphrase
      }
    };
    const sftpConnection = {
      action: "test",
      connection: {
        connectionType: "SFTP",
        authType: $connectionDetails.SSH.authType,
        host: $connectionDetails.SSH.host,
        port: $connectionDetails.SSH.port,
        user: $connectionDetails.SSH.username,
        password: $connectionDetails.SSH.password,
        privateKey: $connectionDetails.SSH.privateKey,
        publicKey: $connectionDetails.SSH.publicKey,
        passphrase: $connectionDetails.SSH.passphrase,
        remoteDirectory: $connectionDetails.SFTP.remoteDirectory,
        isActive: $connectionDetails.SFTP.isActive
      }
    }
    
  const hostConnection = {
    action: "test",
    connection: {
      connectionType: "BDDHOST",
      type: $connectionDetails.Host.type,
      freeEntry: $connectionDetails.Host.freeEntry,
      host: $connectionDetails.Host.host,
      port: $connectionDetails.Host.port,
      user: $connectionDetails.Host.username,
      password: $connectionDetails.Host.password,
      schema: $connectionDetails.Host.schema,
      sid: $connectionDetails.Host.sid,
      service: $connectionDetails.Host.service,
      secured: $connectionDetails.Host.secured
    }
  };

  const tlmConnection = {
    action: "test",
    connection: {
      connectionType: "BDDTLM",
      type: $connectionDetails.TLM.type,
      freeEntry: $connectionDetails.TLM.freeEntry,
      host: $connectionDetails.TLM.host,
      port: $connectionDetails.TLM.port,
      user: $connectionDetails.TLM.username,
      password: $connectionDetails.TLM.password,
      schema: $connectionDetails.TLM.schema,
      sid: $connectionDetails.TLM.sid,
      service: $connectionDetails.TLM.service,
      secured: $connectionDetails.TLM.secured
    }
  };

  const x3sConnection = {
    action: "test",
    connection: {
      connectionType: "BDDX3S",
      type: $connectionDetails.X3S.type,
      freeEntry: $connectionDetails.X3S.freeEntry,
      host: $connectionDetails.X3S.host,
      port: $connectionDetails.X3S.port,
      user: $connectionDetails.X3S.username,
      password: $connectionDetails.X3S.password,
      schema: $connectionDetails.X3S.schema,
      sid: $connectionDetails.X3S.sid,
      service: $connectionDetails.X3S.service,
      secured: $connectionDetails.X3S.secured
    }
  };

    const requestBody = {
      envName: $newEnvironmentName,
      hostType: $newHostType,
      encryptionType: "no encryption",
      communicationType: "SSH",
      sshConnections : [
     ...sshConnectionsDetails
    ],
      connections: [
        ...wasConnectionsDetails,
        hostConnection,
        tlmConnection,
        x3sConnection,
        sshConnection,
        sftpConnection
      ]
    };

    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(requestBody)
      });

      let timer = setInterval(() => {
        testProgress.update(n => {
          if (n < 100) return n + 10;
          clearInterval(timer);
          return 100;
        });
      }, 100);

      const responseData = await response.json();
      clearInterval(timer);

      if (responseData.success) {
      testMessage.set(`All connections tested successfully!`);
      connectionStatuses.set({
        ssh: sshConnectionsDetails.map(() => 'success'),
        was: wasConnectionsDetails.map(() => 'success'),
        host: 'success',
        tlm: 'success',
        x3s: 'success',
        singleSsh: 'success',
        sftp: 'success'
      });
    } else {
      const feedbacks = responseData.data.connections.map((conn: any, idx: number) => {
        const status = conn.testResult.success ? 'success' : 'failure';
        return {
          index: idx,
          type: conn.connection.connectionType,
          status: status,
          feedbacks: conn.testResult.feedbacks.join(', ')
        };
      });

      testMessage.set(`Test results:\n${feedbacks.map((f: any) => `Connection ${f.index + 1} (${f.type}): ${f.feedbacks}`).join('\n')}`);

      // Update the connectionStatuses store
      const updatedStatuses: ConnectionStatuses = {
        ssh: [],
        was: [],
        host: 'success',
        tlm: 'success',
        x3s: 'success',
        singleSsh: 'success',
        sftp: 'success'
      };

      feedbacks.forEach((f: any) => {
        switch (f.type) {
          case 'SSH':
            updatedStatuses.ssh.push(f.status);
            break;
          case 'WAS':
            updatedStatuses.was.push(f.status);
            break;
          case 'BDDHOST':
            updatedStatuses.host = f.status;
            break;
          case 'BDDTLM':
            updatedStatuses.tlm = f.status;
            break;
          case 'BDDX3S':
            updatedStatuses.x3s = f.status;
            break;
          case 'SFTP':
            updatedStatuses.sftp = f.status;
            break;
          default:
            break;
        }
      });

      connectionStatuses.set(updatedStatuses);
    }
      testProgress.set(100);
    } catch (error: string) {
      console.error('Failed to test connections', error);
      testMessage.set('Failed to test connections. Please try again.');
      technicalMessage.set(error.message || 'Unknown technical error');
    }
  }

  //  Function to test MailBox connections
  async function testMailboxConnections() {
  openProgressPopover();
  testMessage.set(`Starting test for mailbox connections...`);

  const testUrl = 'http://localhost:8085/console/env-management/v1/test-connections';
  const requestBody = {
    envName: $newEnvironmentName,
    hostType: $newHostType,
    encryptionType: $encryptionType,
    communicationType: "SSH",
    connections: [
      {
        action: "test",
        connection: {
          connectionType: "SSH",
          authType: $connectionDetails.SSH.authType,
          host: $connectionDetails.SSH.host,
          port: $connectionDetails.SSH.port,
          user: $connectionDetails.SSH.username,
          password: $connectionDetails.SSH.password,
          privateKey: $connectionDetails.SSH.privateKey,
          publicKey: $connectionDetails.SSH.publicKey,
          passphrase: $connectionDetails.SSH.passphrase
        }
      },
      {
        action: "test",
        connection: {
          connectionType: "SFTP",
          authType: $connectionDetails.SSH.authType, // Assuming same authType as SSH
          host: $connectionDetails.SSH.host,
          port: $connectionDetails.SSH.port,
          user: $connectionDetails.SSH.username,
          password: $connectionDetails.SSH.password,
          privateKey: $connectionDetails.SSH.privateKey,
          publicKey: $connectionDetails.SSH.publicKey,
          passphrase: $connectionDetails.SSH.passphrase,
          remoteDirectory: $connectionDetails.SFTP.remoteDirectory,
          isActive: $connectionDetails.SFTP.isActive
        }
      }
    ]
  };
  console.log("Request body being sent:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(testUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(requestBody)
    });

    let timer = setInterval(() => {
      testProgress.update(n => {
        if (n < 100) return n + 10;
        clearInterval(timer);
        return 100;
      });
    }, 100);

    const responseData = await response.json();
    clearInterval(timer);

    if (responseData.success) {
      testMessage.set(`Mailbox connections tested successfully!`);
         connectionStatuses.update(statuses => ({
        ...statuses,
        singleSsh: 'success',
        sftp: 'success'
      }));
    } else {
      const feedbacks = responseData.data.connections.map((conn: any, idx: number) =>
        `Connection ${idx + 1} (${conn.connection.connectionType}): ${conn.testResult.feedbacks.join(', ')}`
      ).join('\n');
      testMessage.set(`Test results:\n${feedbacks}`);
      responseData.data.connections.forEach((conn: any, idx: number) => {
        const status = conn.testResult.success ? 'success' : 'failure';
        if (conn.connection.connectionType === 'SSH') {
          connectionStatuses.update(statuses => ({ ...statuses, singleSsh: status }));
        } else if (conn.connection.connectionType === 'SFTP') {
          connectionStatuses.update(statuses => ({ ...statuses, sftp: status }));
        }
      });
    }
    testProgress.set(100);
  } catch (error: string) {
    console.error('Failed to test mailbox connections', error);
    testMessage.set('Failed to test mailbox connections. Please try again.');
    technicalMessage.set(error.message || 'Unknown technical error');
  } 
}

    
  let validateInProgress = writable(false);
  let validationProgress = writable(0);
  let validationMessage = writable('');
  let validationMessages = writable<string[]>([]);
  let showValidationResults = writable(false);
  let validationSuccess = writable(true); 

  function startValidation() {
        validateInProgress.set(true);
        validationProgress.set(0);
        validationMessage.set("Validating all connections...");
        simulateValidation();
  };

  function simulateValidation() {
  const step = 25; // Increment step for the progress bar
  const interval = setInterval(() => {
    validationProgress.update(n => {
      if (n < 100) {
        return n + step;
      } else {
        clearInterval(interval);
        showValidationResults.set(true);
        validateInProgress.set(false);
        return 100; // bar progress should not exceed 100
      }
    });
  }, 500); // time interval adjust as needed

  setTimeout(() => {
    const feedbacks = mockValidationResponse.data.connections.map((conn: any, idx: number) => {
      const userFriendlyMessage = conn.testResult.feedbacks.map(formatErrorMessage).join(', ');
      return `Connection ${idx + 1} (${conn.connection.connectionType}): ${userFriendlyMessage}`;
    });

    validationMessage.set("Validation completed.");
    console.log('Validation message:', get(validationMessage));

    validationSuccess.set(mockValidationResponse.success);
    console.log('Validation success?:', mockValidationResponse.success);

    validationMessages.set(feedbacks);
    console.log('Validation message:', get(validationMessage));
  }, 2000);
}

  const mockValidationResponse = {
  "success": true,
  "messages": null,
  "data": {
    "envName": "Ric-SAB988Q-SABTELEMV2",
    "connections": [
      {
        "action": "test",
        "connection": {
          "connectionType": "SSH",
          "authType": "Password",
          "host": "localhost",
          "port": 2222,
          "user": "admin",
          "password": "admin",
          "privateKey": null,
          "publicKey": null,
          "passphrase": null
        },
        "testResult": {
          "success": false,
          "feedbacks": [
            "Testez SSH:\nErreur lors de la crÃÂ©ation de la connexion : java.net.ConnectException: Connection refused"
          ]
        }
      },
      {
        "action": "test",
        "connection": {
          "connectionType": "SSH",
          "authType": "Identity",
          "host": "lol",
          "port": 2222,
          "user": "admin",
          "password": "",
          "privateKey": "key",
          "publicKey": "key",
          "passphrase": "key"
        },
        "testResult": {
          "success": false,
          "feedbacks": [
            "Testez SSH:\nErreur lors de la crÃÂ©ation de la connexion : java.io.FileNotFoundException: key (No such file or directory)"
          ]
        }
      }
    ]
  },
  "errors": null
};

const errorMappings: { [key: string]: string } = {
  'java.net.ConnectException: Connection refused': 'Failed to connect to the server. Please check the host and port.',
  'java.io.FileNotFoundException': 'File not found. Please check the file path.',
  'The Network Adapter could not establish the connection': 'Unable to connect to the database. Please check your network settings and database URL.',
};

function formatErrorMessage(feedback: string): string {
  for (const key in errorMappings) {
    if (feedback.includes(key)) {
      return errorMappings[key];
    }
  }
  return 'An unknown error occurred. Please check the connection details and try again.';
}

let viewingMode = false;

</script>


  <Tabs.Root value="display" class="w-full ">
    <Tabs.List class="grid w-full grid-cols-4 ">
        <Tabs.Trigger value="create">Create</Tabs.Trigger>
        <Tabs.Trigger value="edit">Edit</Tabs.Trigger>
        <Tabs.Trigger value="delete">Delete</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="create">
    
{#if $showValidationResults}
<div class="alert {$validationSuccess ? 'alert-success' : 'alert-danger'}">
    {$validationMessage}
</div>
{/if}
  <div class="p-4 bg-white dark:bg-gray-800">
    <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Create or Duplicate Environment</h2>
    {#if !$showInputs}
    <form on:submit|preventDefault={$selectedDuplicateEnvId ? duplicateEnvironment : prepareInputs}>
      <div class="mt-4">
        <label for="new-environment-name" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Environment Name:</label>
        <input id="new-environment-name" type="text" bind:value={$newEnvironmentName} class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300" placeholder="Enter Environment Name" required>
      </div>
      <div class="mt-4">
        <label for="new-host-type" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Host Type:</label>
        <select id="new-host-type" bind:value={$newHostType} class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300" required>
          <option value="" disabled selected>Enter Host Type</option>
          <option value="IBMI">IBMI</option>
          <option value="LINUX">LINUX</option>
        </select>
      </div>
      <div class="mt-4">
        <label for="encryption-type" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Encryption Type:</label>
        <select id="encryption-type" bind:value={$encryptionType} class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300" required>
          <option value="" disabled selected>Select Encryption Type</option>
          <option value="no encryption">No Encryption</option>
          <option value="encrypted">Encrypted</option>
          <option value="AES-256">AES-256</option>
        </select>
      </div>
      <div class="mt-4">
        <label for="communication-type" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Communication Type:</label>
        <select id="communication-type" bind:value={$communicationType} class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300" required>
          <option value="" disabled selected>Select Communication Type</option>
          <option value="SSH/FTP/FTPS">SSH/SFTP</option>
        </select>
      </div>
      <div class="mt-4">
        <label for="manage-configuration" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Manage the configuration from this console:</label>
        <input id="manage-configuration" type="checkbox" bind:checked={$configurator} class="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" />
      </div>
      <div class="mt-4">
        <label for="environment-selector" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Select Environment to Duplicate (optional):</label>
        <select id="environment-selector" on:change={selectEnvironment} bind:value={$selectedDuplicateEnvId} class="px-3 py-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
          <option value={null}>-- Select an Environment --</option>
          {#each $environments as environment (environment.env_oid)}
            <option value={environment.env_oid}>{environment.env_name}</option>
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
        <form>
          <button type="button" on:click={testMailboxConnections} class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">test</button>
          <h1 class="text-xl font-bold text-[#FFAA33]">MailBox</h1>
          <div class={($connectionStatuses.singleSsh === 'failure' || $connectionStatuses.sftp === 'failure') ? 'border border-red-500 p-2' : ''}>
            <div class="space-y-1 py-4">
              <h1 class="text-xl font-bold text-[#FFAA33]">SSH Connection</h1>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Authentication Type:</label>
                <select bind:value={$connectionDetails.SSH.authType} on:change={toggleAuthType} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
                  <option value="Password">Password</option>
                  <option value="Identity">Key</option>
                </select>
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
                <input type="text" bind:value={$connectionDetails.SSH.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required/>
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                <input type="number" min="0" bind:value={$connectionDetails.SSH.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required/>
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                <input type="text" bind:value={$connectionDetails.SSH.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required/>
              </div>
              {#if $connectionDetails.SSH.authType === 'Password'}
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                <input type="password" bind:value={$connectionDetails.SSH.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
              </div>
              {:else}
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Public Key:</label>
                <input type="text" bind:value={$connectionDetails.SSH.publicKey} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Private Key:</label>
                <input type="text" bind:value={$connectionDetails.SSH.privateKey} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Passphrase:</label>
                <input type="text" bind:value={$connectionDetails.SSH.passphrase} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
              </div>
              {/if}
            </div>
            <div class="space-y-1 py-4">
              <h1 class="text-xl font-bold text-[#FFAA33]">SFTP Connection</h1>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Remote Directory :</label>
                <input type="text" bind:value={$connectionDetails.SFTP.remoteDirectory} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required/>
              </div>
              <div class="flex items-center">
                <label class="text-gray-700 dark:text-gray-300 w-1/4">Active :</label>
                <input type="checkbox" bind:checked={$connectionDetails.SFTP.isActive} class="align-middle transform scale-100">
              </div>
            </div>
          </div>
          <div class="space-y-1 py-4">
            <h1 class="text-xl font-bold text-[#FFAA33]">SAB BPM</h1>
            <p class="font-bold mt-2">These settings are only useful if SAB BPM is version 7.5.10 or higher.</p>
            <div class="flex items-center">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
              <input type="text" bind:value={$connectionDetails.BPM.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
            </div>
            <div class="flex items-center">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Language:</label>
              <select bind:value={$connectionDetails.BPM.language} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
                <option value="FR">FR</option>
                <option value="EN">EN</option>
              </select>
            </div>
            <div class="flex items-center">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
              <input type="password" bind:value={$connectionDetails.BPM.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
            </div>
          </div>

                  <!-- Host Database Connection Inputs -->
                  <div class="space-y-1 py-4">
                  <h1 class="text-xl font-bold text-[#FFAA33]">Host Database</h1>
                  <div class={$connectionStatuses.host === 'failure' ? 'border border-red-500 p-2' : ''}>
                
                    <button type="button"
                    on:click={() => testConnection($connectionDetails.Host, 0, "BDDHOST")} 
                    class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">
                    Test
                  </button>
                  <div class="flex items-center">
                    <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                    <select 
                      bind:value={$connectionDetails.Host.type} 
                      class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                      required disabled>
                      <option value="DB2">DB2</option>
                      <option value="ORACLE">ORACLE</option>
                    </select>
                  </div>
                  <div class="flex items-center">
                    <label class="text-gray-700 dark:text-gray-300 w-1/4">Free Entry:</label>
                    <input 
                      type="checkbox" 
                      bind:checked={$connectionDetails.Host.freeEntry} 
                      class="align-middle transform scale-100">
                  </div>

                  {#if $connectionDetails.Host.freeEntry}
                    <div class="flex items-center">
                      <label class="text-gray-700 dark:text-gray-300 w-1/4">URL:</label>
                      <input 
                        type="text" 
                        bind:value={$connectionDetails.Host.url} 
                        class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                        required>
                    </div>
                  {:else}
                    <div class="flex items-center">
                      <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
                      <input 
                        type="text" 
                        bind:value={$connectionDetails.Host.host} 
                        class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                        required>
                    </div>
                    {#if $connectionDetails.Host.type === 'ORACLE'}
                      <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Service:</label>
                        <input 
                          type="text" 
                          bind:value={$connectionDetails.Host.service} 
                          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                          required >
                      </div>
                    {/if}
                  {/if}

                   <div class="flex items-center">
                     <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                     <input 
                       type="number" 
                       min="0" 
                       bind:value={$connectionDetails.Host.port} 
                       class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                       required>
                   </div>
                   <div class="flex items-center">
                     <label class="text-gray-700 dark:text-gray-300 w-1/4">User:</label>
                     <input 
                       type="text" 
                       bind:value={$connectionDetails.Host.username} 
                       class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                       required>
                   </div>
                   <div class="flex items-center">
                     <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                     <input 
                       type="password" 
                       bind:value={$connectionDetails.Host.password} 
                       class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                       required>
                   </div>
                   {#if !$connectionDetails.Host.freeEntry}
                     <div class="flex items-center">
                       <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
                       <input 
                         type="text" 
                         bind:value={$connectionDetails.Host.schema} 
                         class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                         required>
                     </div>
                     <div class="flex items-center">
                       <label class="text-gray-700 dark:text-gray-300 w-1/4">SID:</label>
                       <input 
                         type="text" 
                         bind:value={$connectionDetails.Host.sid} 
                         class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                         required>
                     </div>
                   {/if}
                   <div class="flex items-center">
                     <label class="text-gray-700 dark:text-gray-300 w-1/4">Secured:</label>
                     <input 
                       type="checkbox" 
                       bind:checked={$connectionDetails.Host.secured} 
                       class="align-middle transform scale-100">
                   </div>
                  </div>
                  </div>
                
                  <!-- X3S Database Connection Inputs -->
                  <div class="space-y-1 py-4">
                  <h1 class="text-xl font-bold text-[#FFAA33]">X3S Database</h1>
                  <div class={$connectionStatuses.x3s === 'failure' ? 'border border-red-500 p-2' : ''}>

       <button type="button"
                    on:click={() => testConnection($connectionDetails.X3S, 0, "BDDX3S")} 
                    class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">
                    Test
                  </button>
    <div class="flex items-center">
      <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
      <select 
        bind:value={$connectionDetails.X3S.type} 
        class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
        required disabled>
        <option value="DB2">DB2</option>
        <option value="ORACLE">ORACLE</option>
      </select>
    </div>
    <div class="flex items-center">
      <label class="text-gray-700 dark:text-gray-300 w-1/4">Free Entry:</label>
      <input 
        type="checkbox" 
        bind:checked={$connectionDetails.X3S.freeEntry} 
        class="align-middle transform scale-100">
    </div>

    {#if $connectionDetails.X3S.freeEntry}
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">URL: </label>
        <input 
          type="text" 
          bind:value={$connectionDetails.X3S.url} 
          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
          required>
      </div>
    {:else}
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
        <input 
          type="text" 
          bind:value={$connectionDetails.X3S.host} 
          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
          required>
      </div>
      {#if $connectionDetails.X3S.type === 'ORACLE'}
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Service:</label>
          <input 
            type="text" 
            bind:value={$connectionDetails.X3S.service} 
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
            required disabled>
        </div>
      {/if}
    {/if}

    <div class="flex items-center">
      <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
      <input 
        type="number" 
        min="0" 
        bind:value={$connectionDetails.X3S.port} 
        class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
        required>
    </div>
    <div class="flex items-center">
      <label class="text-gray-700 dark:text-gray-300 w-1/4">Username:</label>
      <input 
        type="text" 
        bind:value={$connectionDetails.X3S.username} 
        class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
        required>
    </div>
    <div class="flex items-center">
      <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
      <input 
        type="password" 
        bind:value={$connectionDetails.X3S.password} 
        class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
        required>
    </div>
    {#if !$connectionDetails.X3S.freeEntry}
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
        <input 
          type="text" 
          bind:value={$connectionDetails.X3S.schema} 
          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
          required>
      </div>
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">SID:</label>
        <input 
          type="text" 
          bind:value={$connectionDetails.X3S.sid} 
          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
          required>
      </div>
    {/if}
    <div class="flex items-center">
      <label class="text-gray-700 dark:text-gray-300 w-1/4">Secured:</label>
      <input 
        type="checkbox" 
        bind:checked={$connectionDetails.X3S.secured} 
        class="align-middle transform scale-100">
    </div>
                  </div>
                  </div>
                
                  <!-- TLM Database Connection Inputs -->
                  <div class="space-y-1 py-4">
                    <h1 class="text-xl font-bold text-[#FFAA33]">Telemaintenance Database</h1>
                    <div class={$connectionStatuses.tlm === 'failure' ? 'border border-red-500 p-2' : ''}>
                      <button type="button"
                        on:click={() => testConnection($connectionDetails.TLM, 0, "BDDTLM")} 
                        class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">
                        Test
                      </button>
                      <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                        <select 
                          bind:value={$connectionDetails.TLM.type} 
                          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                          required disabled>
                          <option value="DB2">DB2</option>
                          <option value="ORACLE">ORACLE</option>
                        </select>
                      </div>
                      <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Free Entry:</label>
                        <input 
                          type="checkbox" 
                          bind:checked={$connectionDetails.TLM.freeEntry} 
                          class="align-middle transform scale-100">
                      </div>
                    
                      {#if $connectionDetails.TLM.freeEntry}
                        <div class="flex items-center">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">URL:</label>
                          <input 
                            type="text" 
                            bind:value={$connectionDetails.TLM.url} 
                            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                            required>
                        </div>
                      {:else}
                        <div class="flex items-center">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
                          <input 
                            type="text" 
                            bind:value={$connectionDetails.TLM.host} 
                            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                            required>
                        </div>
                        {#if $connectionDetails.TLM.type === 'ORACLE'}
                          <div class="flex items-center">
                            <label class="text-gray-700 dark:text-gray-300 w-1/4">Service:</label>
                            <input 
                              type="text" 
                              bind:value={$connectionDetails.TLM.service} 
                              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                              required disabled>
                          </div>
                        {/if}
                      {/if}
                        
                      <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                        <input 
                          type="number" 
                          min="0" 
                          bind:value={$connectionDetails.TLM.port} 
                          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                          required>
                      </div>
                      <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Username:</label>
                        <input 
                          type="text" 
                          bind:value={$connectionDetails.TLM.username} 
                          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                          required>
                      </div>
                      <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                        <input 
                          type="password" 
                          bind:value={$connectionDetails.TLM.password} 
                          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                          required>
                      </div>
                      {#if !$connectionDetails.TLM.freeEntry}
                        <div class="flex items-center">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
                          <input 
                            type="text" 
                            bind:value={$connectionDetails.TLM.schema} 
                            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                            required>
                        </div>
                        <div class="flex items-center">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">SID:</label>
                          <input 
                            type="text" 
                            bind:value={$connectionDetails.TLM.sid} 
                            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                            required>
                        </div>
                      {/if}
                      <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Secured:</label>
                        <input 
                          type="checkbox" 
                          bind:checked={$connectionDetails.TLM.secured} 
                          class="align-middle transform scale-100">
                      </div>
                    </div>
                  </div>
                  
               <!-- Front Probes Section    -->
              <div class="bg-white dark:bg-gray-800 p-0 mt-4">
                <h1 class="text-xl font-bold text-[#FFAA33] mb-4">FRONT Probes</h1>
                <h2 class="text-lg font-bold text-[#FFAA33] mb-4 underline">Websphere access information</h2>
                <Popover.Root>
                  <Popover.Trigger
                    class="inline-flex items-center px-4 py-2 mb-4 text-xs border border-gray-300 dark:border-gray-700 font-medium rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    on:click={() => toggleWebspherePopover(false)}
                  >
                    Add
                  </Popover.Trigger>
                  {#if webspherePopoverOpen}
                  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div class="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-4xl w-full">
                      <button
                        class="absolute top-3 right-3 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
                        on:click={() => toggleWebspherePopover(false)}
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <h2 class="text-lg font-bold dark:text-gray-300" style="font-size: 16px;">Websphere Access Information</h2>
                      <div class="font-bold underline text-[#FFAA33] mt-4" style="font-size: 16px;">General Information</div>

                      {#if $errorMessage}
                      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span class="block sm:inline">{$errorMessage}</span>
                      </div>
                      {/if}

                  
                        <div class="grid grid-cols-5 gap-4 mt-2 items-center">
                          <div class="col-span-1">
                            <label class="text-gray-700 dark:text-gray-300">Name :</label>
                            <input type="text" bind:value={$newWasConnections.name} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode} required/>
                          </div>
                          <div class="col-span-1">
                            <label class="text-gray-700 dark:text-gray-300">WAS Host :</label>
                            <input type="text" bind:value={$newWasConnections.host} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode} required/>
                          </div>
                          <div class="col-span-1">
                            <label class="text-gray-700 dark:text-gray-300">WAS Login :</label>
                            <input type="text" bind:value={$newWasConnections.username} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode} />
                          </div>
                          <div class="col-span-2">
                            <label class="text-gray-700 dark:text-gray-300">SSL config URL :</label>
                            <input type="text" bind:value={$newWasConnections.sslConfigUrl} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}/>
                          </div>
                          <div class="col-span-1">
                            <label class="text-gray-700 dark:text-gray-300">Is secured :</label>
                            <Checkbox bind:checked={$newWasConnections.securityEnabled} class="align-middle transform scale-100" disabled={viewingMode}/>
                          </div>
                          <div class="col-span-4">
                            <label class="text-gray-700 dark:text-gray-300">Truststore path :</label>
                            <input type="text" bind:value={$newWasConnections.truststore} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}/>
                          </div>
                          <div class="col-span-4">
                            <label class="text-gray-700 dark:text-gray-300">Keystore path :</label>
                            <input type="text" bind:value={$newWasConnections.keystore} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}/>
                          </div>
                          <div class="col-span-1">
                            <label class="text-gray-700 dark:text-gray-300">WAS SOAP Port :</label>
                            <input type="number" bind:value={$newWasConnections.port} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode} required/>
                          </div>
                          <div class="col-span-1">
                            <label class="text-gray-700 dark:text-gray-300">WAS Password :</label>
                            <input type="password" bind:value={$newWasConnections.password} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}/>
                          </div>
                          <div class="col-span-3">
                            <label class="text-gray-700 dark:text-gray-300">SOAP config URL :</label>
                            <input type="text" bind:value={$newWasConnections.soapConfigUrl} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}/>
                          </div>
                          <div class="col-span-2">
                            <label class="text-gray-700 dark:text-gray-300">SAS config URL :</label>
                            <input type="text" bind:value={$newWasConnections.sasConfigUrl} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}/>
                          </div>
                          <div class="col-span-1">
                            <label class="text-gray-700 dark:text-gray-300">Truststore Password :</label>
                            <input type="password" bind:value={$newWasConnections.truststorePassword} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}/>
                          </div>
                          <div class="col-span-1">
                            <label class="text-gray-700 dark:text-gray-300">Keystore Password :</label>
                            <input type="password" bind:value={$newWasConnections.keystorePassword} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}/>
                          </div>
                        </div>
                        {#if !viewingMode}
                        <button on:click={addOrUpdateWasConnections}
                        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Submit
                      </button>
                        {/if}
                    </div>
                  </div>wai tab
                  
                  {/if}
                </Popover.Root>

                <!-- WAI Table -->
                <div class="overflow-x-auto mb-6">
                  <table class="min-w-full table-auto text-left border-collapse">
                    <thead class="bg-gray-400 dark:bg-gray-700 text-white">
                      <tr>
                        <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">ID</th>
                        <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each $wasConnections as wasConnection, index}
                      <tr class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">{wasConnection.name || 'N/A'}</td>
                        <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">
                          <button
                          type="button"
                          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                          on:click={() => viewWasConnection(index)}
                        >
                          Display
                        </button>
                          <button
                          type="button"
                            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                            on:click={() => editWasConnection(index)}
                          >
                            Edit
                          </button>
                          <button
                          type="button"
                            class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                            on:click={() => removeWasConnection(index)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
                
                <h2 class="text-lg font-bold text-[#FFAA33] mb-4 underline">SSH connections information</h2>
                <Popover.Root>
                  <Popover.Trigger
                    class="inline-flex items-center px-4 py-2 mb-4 text-xs border border-gray-300 dark:border-gray-700 font-medium rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    on:click={() => toggleSshspherePopover(false)}
                  >
                    Add
                  </Popover.Trigger>
                  {#if sshPopoverOpen}
                  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div class="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-4xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
                      <button
                        class="absolute top-3 right-3 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
                        on:click={() => toggleSshspherePopover(false)}
                      >
                        <svg
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <h1 class="text-lg font-bold dark:text-gray-300">SSH Connections Information</h1>
                      <h1 class="text-xl font-bold text-[#FFAA33]">SSH Connection</h1>
                
                      {#if $errorMessage}
                      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span class="block sm:inline">{$errorMessage}</span>
                      </div>
                      {/if}
                
                      <form on:submit|preventDefault={addOrUpdateSshConnections}>
                        <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Authentication Type:</label>
                          <select bind:value={$newSshConnections.authType}
                            on:change={toggleAuthType}
                            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled={viewingMode}
                          >
                            <option value="Password">Password</option>
                            <option value="Identity">Key</option>
                          </select>
                        </div>
                        <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
                          <input
                            type="text" bind:value={$newSshConnections.host}
                            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required disabled={viewingMode}
                          />
                        </div>
                        <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                          <input
                            type="number" min="0" bind:value={$newSshConnections.port}
                            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled={viewingMode}
                          />
                        </div>
                        <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                          <input 
                            type="text" bind:value={$newSshConnections.username}
                            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled={viewingMode}
                          />
                        </div>
                        {#if $sshConnection.authType === 'Password'}
                          <div class="flex items-center mb-4">
                            <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                            <input
                              type="password" bind:value={$newSshConnections.password}
                              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required disabled={viewingMode}
                            />
                          </div>
                        {:else}
                          <div class="flex items-center mb-4">
                            <label class="text-gray-700 dark:text-gray-300 w-1/4">Public Key:</label>
                            <input bind:value={$newSshConnections.publicKey}
                              type="text"
                              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled={viewingMode}
                            />
                          </div>
                          <div class="flex items-center mb-4">
                            <label class="text-gray-700 dark:text-gray-300 w-1/4">Private Key:</label>
                            <input 
                              type="text" bind:value={$newSshConnections.privateKey}
                              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled={viewingMode}
                            />
                          </div>
                          <div class="flex items-center mb-4">
                            <label class="text-gray-700 dark:text-gray-300 w-1/4">Passphrase:</label>
                            <input
                              type="text" bind:value={$newSshConnections.passphrase} 
                              class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled={viewingMode}
                            />
                          </div>
                        {/if}

                        <div class="text-[#FFAA33] font-bold underline mt-4">General Information</div>
                        <div class="grid grid-cols-6 gap-4 mt-2 items-center mb-4">
                          <div class="col-span-2">
                            <label class="text-gray-700 dark:text-gray-300">Instance name:</label>
                            <input bind:value={$newRemoteConnectionFeature.instance_name}
                              type="text"
                              class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}
                            />
                          </div>
                          <div class="col-span-2">
                            <label class="text-gray-700 dark:text-gray-300">Type:</label>
                            <select
                              class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}
                              bind:value={$newRemoteConnectionFeature.type}
                            >
                              <option value="Websphere">WebSphere</option>
                              <option value="Tomcat">Tomcat</option>
                            </select>
                          </div>
                          <div class="col-span-2 flex items-center">
                            <label class="text-gray-700 dark:text-gray-300" >Is the main:</label>
                            <Checkbox bind:checked={$newRemoteConnectionFeature.is_main} class="ml-2 align-middle transform scale-100" disabled={viewingMode}/>
                          </div>
                        </div>
                        <div class="text-[#FFAA33] font-bold underline mt-4">Probe applications</div>
                        <div class="grid grid-cols-6 gap-4 mt-2 items-center mb-4">
                          {#if $newRemoteConnectionFeature.type === 'Tomcat'}
                          <div>
                            <label class="text-gray-700 dark:text-gray-300">YPC:</label>
                            <input type="checkbox" class="align-middle transform scale-100" 
                                   checked={$newRemoteConnectionFeature.probe_application === 'YPC'}
                                   on:change={() => handleApplicationChange('YPC')} disabled/>
                          </div>
                          {:else}
                          <div>
                            <label class="text-gray-700 dark:text-gray-300">BPM:</label>
                            <input type="checkbox" class="align-middle transform scale-100" disabled={viewingMode}
                                   checked={$newRemoteConnectionFeature.probe_application === 'BPM'}
                                   on:change={() => handleApplicationChange('BPM')}/>
                          </div>
                          <div>
                            <label class="text-gray-700 dark:text-gray-300">SDE:</label>
                            <input type="checkbox" class="align-middle transform scale-100" disabled={viewingMode}
                                   checked={$newRemoteConnectionFeature.probe_application === 'SDE'}
                                   on:change={() => handleApplicationChange('SDE')}/>
                          </div>
                          <div>
                            <label class="text-gray-700 dark:text-gray-300">X3:</label>
                            <input type="checkbox" class="align-middle transform scale-100" disabled={viewingMode}
                                   checked={$newRemoteConnectionFeature.probe_application === 'X3'}
                                   on:change={() => handleApplicationChange('X3')}/>
                          </div>
                          <div>
                            <label class="text-gray-700 dark:text-gray-300">X3S:</label>
                            <input type="checkbox" class="align-middle transform scale-100"
                                   checked={$newRemoteConnectionFeature.probe_application === 'X3S'} disabled={viewingMode}
                                   on:change={() => handleApplicationChange('X3S')}/>
                          </div>
                          <div>
                            <label class="text-gray-700 dark:text-gray-300">YPB:</label>
                            <input type="checkbox" class="align-middle transform scale-100"
                                   checked={$newRemoteConnectionFeature.probe_application === 'YPB'} disabled={viewingMode}
                                   on:change={() => handleApplicationChange('YPB')}/>
                          </div>
                          {/if}
                        </div>
                        {#if $newRemoteConnectionFeature.type === 'Websphere'}
                        <div class="text-[#FFAA33] font-bold underline mt-6">Probe features</div>
                        <div class="grid grid-cols-1 gap-4 mt-2">
                          <div>
                            <label class="block text-gray-700 dark:text-gray-300">Propagation of the configuration:</label>
                            <Checkbox bind:checked={$newRemoteConnectionFeature.propagation} class="align-middle transform scale-100" disabled />
                          </div>
                          <div>
                            <label class="block text-gray-700 dark:text-gray-300">Installation of resources / components:</label>
                            <Checkbox bind:checked={$newRemoteConnectionFeature.installation} class="align-middle transform scale-100" disabled={viewingMode} />
                          </div>
                          {#if $newRemoteConnectionFeature.probe_application === 'X3S' || $newRemoteConnectionFeature.probe_application === 'YPB'}
                          <div>
                            <label class="block text-gray-700 dark:text-gray-300">Installation DMGR Websphere (only for X3S / YPB):</label>
                            <Checkbox bind:checked={$newRemoteConnectionFeature.dmgr} class="align-middle transform scale-100" disabled={viewingMode} />
                          </div>
                          {/if}
                        </div>
                      {:else if $newRemoteConnectionFeature.type === 'Tomcat'}
                        <div class="text-[#FFAA33] font-bold underline mt-6">Probe features</div>
                        <div class="grid grid-cols-1 gap-4 mt-2">
                          <div>
                            <label class="block text-gray-700 dark:text-gray-300">Propagation of the configuration:</label>
                            <Checkbox bind:checked={$newRemoteConnectionFeature.propagation} class="align-middle transform scale-100" disabled />
                          </div>
                          <div>
                            <label class="block text-gray-700 dark:text-gray-300">Installation of resources / components:</label>
                            <Checkbox bind:checked={$newRemoteConnectionFeature.installation} class="align-middle transform scale-100" disabled={viewingMode}/>
                          </div>
                        </div>
                      {/if}
                        {#if $newRemoteConnectionFeature.type === 'Websphere'}
                          <div class="text-[#FFAA33] font-bold underline mt-6">WebSphere</div>
                          <div class="grid grid-cols-1 gap-4 mt-2">
                            <div>
                              <label class="block text-gray-700 dark:text-gray-300">Upload Mode enabled:</label>
                              <Checkbox bind:checked={$newWasAppServerConfig.upload_mode_enabled} class="align-middle transform scale-100" disabled={viewingMode}/>
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                              <div>
                                <label class="block text-gray-700 dark:text-gray-300">WAS Cell:</label>
                                <input bind:value={$newWasAppServerConfig.was_cell} 
                                  type="text"
                                  class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" required disabled={viewingMode}
                                />
                              </div>
                              <div>
                                <label class="block text-gray-700 dark:text-gray-300">WAS Node:</label>
                                <input bind:value={$newWasAppServerConfig.was_node} 
                                  type="text"
                                  class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" required disabled={viewingMode}
                                />
                              </div>
                              <div>
                                <label class="block text-gray-700 dark:text-gray-300">WAS Cluster:</label>
                                <input bind:value={$newWasAppServerConfig.was_cluster} 
                                  type="text"
                                  class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}
                                />
                              </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                              <div>
                                <label class="block text-gray-700 dark:text-gray-300">WAS Name:</label>
                                <input bind:value={$newWasAppServerConfig.was_name} 
                                  type="text"
                                  class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" required disabled={viewingMode}
                                />
                              </div>
                              <div>
                                <label class="block text-gray-700 dark:text-gray-300">WebSphere Access Information:</label>
                                <select
                                  bind:value={$newWasAppServerConfig.was_con_oid}
                                  class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" required disabled={viewingMode}
                                >
                                  <option value="" disabled selected>Select WebSphere Connection</option>
                                  {#each $wasConnections as wasConnection, index}
                                    <option value={index}>{wasConnection.name || 'N/A'}</option>
                                  {/each}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label class="block text-gray-700 dark:text-gray-300">Targets:</label>
                              <textarea bind:value={$newWasAppServerConfig.targets}  
                              class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode}></textarea>
                            </div>
                          </div>
                        {/if}
                        {#if $newRemoteConnectionFeature.type === 'Tomcat'}
                          <div class="text-[#FFAA33] font-bold underline mt-6">Tomcat</div>
                          <div class="grid grid-cols-2 gap-4 mt-2">
                            <div class="col-span-1">
                              <label class="text-gray-700 dark:text-gray-300">Server name:</label>
                              <input bind:value={$newTomcatAppServerConfig.server_name} 
                                type="text"
                                class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" required disabled={viewingMode}
                              />
                            </div>
                            <div class="col-span-1">
                              <label class="text-gray-700 dark:text-gray-300">Port:</label>
                              <input bind:value={$newTomcatAppServerConfig.port} 
                                type="number" min="0"
                                class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" required disabled={viewingMode}
                              />
                            </div>
                            <div class="col-span-2">
                              <label class="block text-gray-700 dark:text-gray-300">Tomcat binary location:</label>
                              <input bind:value={$newTomcatAppServerConfig.binary_location} 
                                type="text"
                                class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" required disabled={viewingMode}
                              />
                            </div>
                            <div class="col-span-2">
                              <label class="block text-gray-700 dark:text-gray-300">Portlets location:</label>
                              <input bind:value={$newTomcatAppServerConfig.portlets_location} 
                                type="text" 
                                class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" required disabled={viewingMode}
                              />
                            </div>
                          </div>
                        {/if}
                        {#if !viewingMode}

                        <button type="button"
                        on:click={addOrUpdateSshConnections} 
                        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Submit
                      </button>
                        {/if}

                      </div>
                    </div>
                  {/if}
                </Popover.Root>
                {#if $showProgressPopover}
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="relative p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-3xl w-full max-h-screen overflow-y-auto">
                        <button
                            class="absolute top-3 right-3 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
                            on:click={closeProgressPopover}>
                            <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 class="text-xl font-bold dark:text-gray-300 mb-4">Testing Connection...</h2>
                        <Progress max={100} value={$testProgress} />
                        <div class="text-lg text-gray-800 pt-4 mt-4 dark:text-gray-300 whitespace-pre-line leading-relaxed">{$testMessage}
                          <Accordion.Root>
                            <Accordion.Item value="technical-details">
                              <Accordion.Trigger>Logs</Accordion.Trigger>
                              <Accordion.Content>
                                <pre>{$technicalMessage}</pre>
                              </Accordion.Content>
                            </Accordion.Item>
                          </Accordion.Root>
                        </div>
                    </div>
                </div>
            {/if}

                <!-- SSH Table -->
                <div class="overflow-x-auto mb-6">
                  <table class="min-w-full table-auto text-left border-collapse">
                    <thead class="bg-gray-400 dark:bg-gray-700 text-white">
                      <tr>
                        <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Test</th>
                        <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Instance</th>
                        <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Apps</th>
                        <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Type</th>
                        <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each $sshConnections as connection, index}
                      <tr class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 {get(connectionStatuses).ssh[index] === 'failure' ? 'border border-red-500' : ''}">
                        <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">
                          <button class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                          on:click={() => testSshConnection(connection, index)}
                          disabled={$testingInProgress}>Test</button>
                      </td>
                        <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">
                          {#if $remoteConnectionFeatures[index]}
                          {$remoteConnectionFeatures[index].instance_name}
                          {/if}
                        </td>
                        <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">
                          {#if $remoteConnectionFeatures[index]}
                          {$remoteConnectionFeatures[index].probe_application}
                          {/if}
                        </td>
                        <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">
                          {#if $remoteConnectionFeatures[index]}
                          {$remoteConnectionFeatures[index].type}
                          {/if}
                        </td>
                        <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">      
                          <button
                          type="button"
                          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                          on:click={() => displaySshConnection(index)}
                        >
                          Display
                        </button>
                          <button
                          type="button"
                            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-yellow-700"
                            on:click={() => editSshConnection(index)}
                          >
                            Edit
                          </button>
                          <button
                          type="button"
                          class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                          on:click={() => removeSshConnection(index)}
                        >
                          Delete
                        </button>
                        </td>
                      </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>

                {#if $validateInProgress || $showValidationResults}
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-md w-full">
                        <button
                            class="absolute top-3 right-3 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
                            on:click={() => { showValidationResults.set(false); }}>
                            <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 class="text-lg font-bold dark:text-gray-300 mb-2">Connection Validation</h2>
                        {#if $validateInProgress}
                            <Progress max={100} value={$validationProgress} />
                            <p>{$validationMessage}</p>
                        {:else}
                        {#each $validationMessages as message}
                        <p>{message}</p>
                        <Accordion.Root>
                          <Accordion.Item value="technical-details">
                            <Accordion.Trigger>Logs</Accordion.Trigger>
                            <Accordion.Content>
                              <pre>{technicalMessage}</pre>
                            </Accordion.Content>
                          </Accordion.Item>
                        </Accordion.Root>
                      {/each}
                        {/if}
                    </div>
                </div>
                 {/if}

            <button type="button" on:click={testAllConnections} class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Test All Connections
            </button>
              <div class="mt-4">
                <button
                type="submit"
                disabled={!$validationSuccess}
                on:click={insertAllConnections}
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                {$validationSuccess ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer' : 'bg-indigo-300 cursor-not-allowed'}">
                Create
              </button>

              <!-- <button type="submit" on:click={insertAllConnections}
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Create
            </button> -->
              </div>
        </form>
    {/if}
  </div>
    </Tabs.Content>
    <Tabs.Content value="edit">
      <EditPage />
    </Tabs.Content>
    <Tabs.Content value="delete">
      <DeletePage />
    </Tabs.Content>
  </Tabs.Root>