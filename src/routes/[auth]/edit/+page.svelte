<script lang="ts">
    import { onMount } from 'svelte';
    import { get, writable } from 'svelte/store';
    import client from '$lib/apolloClient';
    import { 
        selectedEnvironmentId, 
        environments, 
        connectionDetails, 
        errorMessage, 
        environmentDetails,
        sshConnections,
        wasConnections,
        sftpConnection,
        tlmConnection,
        x3sConnection,
        bpmConnection,
        hostConnection,
        databaseConnections,
        sshConnection,
        newWasConnections,
        newRemoteConnectionFeature,
        remoteConnectionFeatures,
        newWasAppServerConfig,
        newTomcatAppServerConfig,
        newSshConnections,
        newWasAppServerConfigs,
        newTomcatAppServerConfigs,
        probeSSHConnections,
        newProbeSSHConnection,
        currentSshConnection,
        tomcatAppServerConfigs,
        wasAppServerConfigs,
        newlyAddedProbeSSHConnections,
        connectionStatuses,
		    type WebsphereConnectionInfo,
        type WebsphereAppServerConfig,
        type TomcatAppServerConfig,
        type SSHConnectionInfo,

    } from '$lib/stores';
    import { GET_ENV, GET_ENV_DETAILS } from '$lib/queries';
    import { UPDATE_ENVIRONMENT,UPDATE_SFTP_CONNECTION, UPDATE_SSH_CONNECTION, UPDATE_BPM_CONNECTION, UPDATE_DATABASE_CONNECTION, UPDATE_WAS_CONNECTION, UPDATE_REMOTE_CONNECTION_FEATURE, UPDATE_WAS_APP_SERVER_CONFIG, UPDATE_TOMCAT_APP_SERVER_CONFIG, DELETE_SSH_CONNECTION, DELETE_WAS_CONNECTION, CREATE_WAS_CONNECTION, CREATE_SSH_CONNECTION, CREATE_REMOTE_CONNECTION_FEATURE, CREATE_WAS_APP_SERVER_CONFIG, CREATE_TOMCAT_APP_SERVER_CONFIG } from '$lib/mutation';
    import * as Popover from "$lib/components/ui/popover";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Progress } from '$lib/components/ui/progress';
	  import type { SSHConnection } from '$lib/interfaces';
    import * as Accordion from "$lib/components/ui/accordion";

    function handleApplicationChange(application: any) {
    newRemoteConnectionFeature.update(current => ({ ...current, probe_application: application }));
  }


  async function deleteSSHConnection(con_oid: number) {
    if (confirm('Are you sure you want to delete this SSH connection?')) {
        try {
            await client.mutate({
                mutation: DELETE_SSH_CONNECTION,
                variables: { con_oid }
            });
            // Refresh the SSH connections list after deletion
            const updatedSSHConnections = get(probeSSHConnections).filter(conn => conn.con_oid !== con_oid);
            probeSSHConnections.set(updatedSSHConnections);
            alert('SSH connection deleted successfully');
        } catch (error) {
            console.error('Error deleting SSH connection:', error);
            alert('Error deleting SSH connection');
        }
    }
  }

  async function deleteWASConnection(con_oid: number) {
    if (confirm('Are you sure you want to delete this WAS connection?')) {
        try {
            await client.mutate({
                mutation: DELETE_WAS_CONNECTION,
                variables: { con_oid }
            });
            // Refresh the WAS connections list after deletion
            const updatedWASConnections = get(wasConnections).filter(conn => conn.con_oid !== con_oid);
            wasConnections.set(updatedWASConnections);
            alert('WAS connection deleted successfully');
        } catch (error) {
            console.error('Error deleting WAS connection:', error);
            alert('Error deleting WAS connection');
        }
    }
  }


    let showProgressPopover = false;
    let progressValue = 0;
    let updateMessage = '';
    let viewingMode = false;
    let webspherePopoverOpen = false;
    const isEditMode = writable(false);
    let sshPopoverOpen = false;
    let editingIndex = -1;

    // Function to toggle the websphere popover
    function toggleWebspherePopover(isEdit = false) {
        console.log("popover toggled");
        webspherePopoverOpen = !webspherePopoverOpen;
        if (webspherePopoverOpen && !isEdit) {
            // resetWasConnection();
        }
        if (webspherePopoverOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            errorMessage.set('');
        }
    }

    // Function to view WAS connection
    function viewWasConnection(wasConnection: WebsphereConnectionInfo) {
        viewingMode = true;
        newWasConnections.set(wasConnection); 
        toggleWebspherePopover(false);
    }

     // Function to view WAS connection
     function openEditWASConnectionModal(wasConnection: WebsphereConnectionInfo) {
    viewingMode = false;
    newWasConnections.set(wasConnection); 
    toggleWebspherePopover(false);
    }
    
      function openAddWASConnectionModal() {
  // Set an empty WAS connection to indicate adding a new one
  newWasConnections.set({
    con_oid: 0,
    env_oid: get(selectedEnvironmentId) || 0,
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
  viewingMode = false; 
  webspherePopoverOpen = true; 
    }

    function handleSaveWasConnection() {
  const currentConnection = get(newWasConnections);
  const allConnections = get(wasConnections);
  const temp_id = currentConnection.con_oid ? currentConnection.con_oid : Date.now();

  const isDuplicateName = allConnections.some(conn => conn.name === currentConnection.name && conn.env_oid === currentConnection.env_oid && conn.con_oid !== currentConnection.con_oid);

  if (isDuplicateName) {
        errorMessage.set('A WAS connection with this name already exists.');
        return;
    }

    errorMessage.set('');

  if (currentConnection.con_oid) {
    // This is an update
    wasConnections.update(connections => 
      connections.map(conn => conn.con_oid === currentConnection.con_oid ? currentConnection : conn)
    );
  } else {
    // This is an addition
    wasConnections.update(connections => [...connections, { ...currentConnection, con_oid: temp_id }]);
  }

  // Reset the newWasConnections store and close the modal
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
  webspherePopoverOpen = false;
    }


        function toggleSSHPopover(isEdit = false) {
    console.log("popover toggled");
    sshPopoverOpen = !sshPopoverOpen;
    if (sshPopoverOpen && !isEdit) {
        // resetSSHConnection();
    }
    if (sshPopoverOpen) {
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
    feature_oid: 0,
    was_con_oid: 0,
    upload_mode_enabled: false,
    was_cell: '',
    was_node: '',
    was_cluster: '',
    was_name: '',
    targets: '',
  });
  newTomcatAppServerConfig.set({
    tomcat_config_oid: 0,
    feature_oid: 0,
    server_name: '',
    port: 22,
    binary_location: '',
    portlets_location: '',
  });
    }

    function viewSSHConnection(index: number) {
    const connectionToEdit = get(probeSSHConnections)[index];
    newSshConnections.set({ ...connectionToEdit });
    // Find the feature that matches the ssh_con_oid of the connection to edit
    const features = get(remoteConnectionFeatures).filter((feature) => feature.ssh_con_oid === connectionToEdit.con_oid);

    if (features.length > 0) {
        const featureToEdit = features[0];
        newRemoteConnectionFeature.set(features[0]);
        if (featureToEdit.type === 'Websphere' && featureToEdit.wasappserverconfigs && featureToEdit.wasappserverconfigs.length > 0) {
            newWasAppServerConfig.set(featureToEdit.wasappserverconfigs[0]);
        } else if (featureToEdit.type === 'Tomcat' && featureToEdit.tomcatappserverconfigs && featureToEdit.tomcatappserverconfigs.length > 0) {
            newTomcatAppServerConfig.set(featureToEdit.tomcatappserverconfigs[0]);
        }

    } else {
        newRemoteConnectionFeature.set({
            ssh_con_oid: connectionToEdit.con_oid,
            was_con_oid: 0,
            propagation: false,
            installation: false,
            dmgr: false,
            instance_name: '',
            type: '',
            app_server: '',
            is_main: false,
            probe_application: ''
        });

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
        
        newTomcatAppServerConfig.set({
            tomcat_config_oid: 0,
            feature_oid: 0,
            server_name: '',
            port: 0,
            binary_location: '',
            portlets_location: '',
        });
    }

    viewingMode = true;
    editingIndex = index;
    toggleSSHPopover(true);
    }


    function openEditSSHConnectionModal1(index: number) {
    const connectionToEdit = get(probeSSHConnections)[index];
    newSshConnections.set({ ...connectionToEdit });
    // Find the feature that matches the ssh_con_oid of the connection to edit
    const features = get(remoteConnectionFeatures).filter((feature) => feature.ssh_con_oid === connectionToEdit.con_oid);

    if (features.length > 0) {
        const featureToEdit = features[0];
        newRemoteConnectionFeature.set(features[0]);
        if (featureToEdit.type === 'Websphere' && featureToEdit.wasappserverconfigs && featureToEdit.wasappserverconfigs.length > 0) {
            newWasAppServerConfig.set(featureToEdit.wasappserverconfigs[0]);
        } else if (featureToEdit.type === 'Tomcat' && featureToEdit.tomcatappserverconfigs && featureToEdit.tomcatappserverconfigs.length > 0) {
            newTomcatAppServerConfig.set(featureToEdit.tomcatappserverconfigs[0]);
        }

    } else {
        newRemoteConnectionFeature.set({
            ssh_con_oid: connectionToEdit.con_oid,
            was_con_oid: 0,
            propagation: false,
            installation: false,
            dmgr: false,
            instance_name: '',
            type: '',
            app_server: '',
            is_main: false,
            probe_application: ''
        });

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
        
        newTomcatAppServerConfig.set({
            tomcat_config_oid: 0,
            feature_oid: 0,
            server_name: '',
            port: 0,
            binary_location: '',
            portlets_location: '',
        });
    }

    viewingMode = false;
    editingIndex = index;
    toggleSSHPopover(true);
    }

    function openEditSSHConnectionModal(index: number) {
    const connectionToEdit = get(probeSSHConnections)[index];
    newSshConnections.set({ ...connectionToEdit });
    const features = get(remoteConnectionFeatures).filter((feature) => feature.ssh_con_oid === connectionToEdit.con_oid);

    if (features.length > 0) {
        const featureToEdit = features[0];
        newRemoteConnectionFeature.set(featureToEdit);
        if (featureToEdit.type === 'Websphere' && featureToEdit.wasappserverconfigs && featureToEdit.wasappserverconfigs.length > 0) {
            newWasAppServerConfig.set(featureToEdit.wasappserverconfigs[0]);
        } else if (featureToEdit.type === 'Tomcat' && featureToEdit.tomcatappserverconfigs && featureToEdit.tomcatappserverconfigs.length > 0) {
            newTomcatAppServerConfig.set(featureToEdit.tomcatappserverconfigs[0]);
        }

    } else {
        newRemoteConnectionFeature.set({
            ssh_con_oid: connectionToEdit.con_oid,
            was_con_oid: 0,
            propagation: false,
            installation: false,
            dmgr: false,
            instance_name: '',
            type: '',
            app_server: '',
            is_main: false,
            probe_application: ''
        });

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

        newTomcatAppServerConfig.set({
            tomcat_config_oid: 0,
            feature_oid: 0,
            server_name: '',
            port: 0,
            binary_location: '',
            portlets_location: '',
        });
    }

    viewingMode = false;
    editingIndex = index;
    toggleSSHPopover(true);
}

    // Function to deep clone an object
    function deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    onMount(async () => {
        try {
            const result = await client.query({
                query: GET_ENV
            });
            environments.set(result.data.console_environment);
        } catch (error) {
            console.error('Error loading environments:', error);
            errorMessage.set('Error loading environments.');
        }
    });

     // Reactive statement to check if the environment name is unique
      let isEnvNameUnique = writable(true);
      let originalEnvName = writable('');
      // $: {
      //    const envName = $environmentDetails.env_name.trim().toLowerCase();
      //    isEnvNameUnique.set(!$environments.some(env => env.env_name.toLowerCase() === envName));
      //    if (!isEnvNameUnique) {
      //      errorMessage.set('Environment name already exists. Please choose a different name.');
      //    } else {
      //      errorMessage.set('');
      //    }
      //  }

      onMount(() => {
  originalEnvName.set($environmentDetails.env_name.trim().toLowerCase());
});

$: {
  const envName = $environmentDetails.env_name.trim().toLowerCase();
  const currentEnvId = get(selectedEnvironmentId);
  const originalName = get(originalEnvName);

  isEnvNameUnique.set(
    envName === originalName || 
    // If the name is the same as the original name, consider it unique
    !$environments.some(
      env => env.env_oid !== currentEnvId && env.env_name.toLowerCase() === envName
    )
  );

  if (!get(isEnvNameUnique) && envName !== originalName) {
    errorMessage.set('Environment name already exists. Please choose a different name.');
  } else {
    errorMessage.set('');
  }
}

    // Fetch the details of the selected environment
    async function fetchEnvironmentDetails(envId: number) {
    try {
        const result = await client.query({
            query: GET_ENV_DETAILS,
            variables: { env_oid: envId }
        });

        const envDetails = deepClone(result.data.console_environment_by_pk);

        // Set SSH connections
        const sshConnectionsList = envDetails.sshconnections.map((sshConnection: any) => ({
            con_oid: sshConnection.con_oid,
            authType: sshConnection.auth_type,  // Transform auth_type to authType
            host: sshConnection.host,
            port: sshConnection.port,
            username: sshConnection.username,
            password: sshConnection.password,
            privateKey: sshConnection.private_key,
            publicKey: sshConnection.public_key,
            passphrase: sshConnection.passphrase
        })) || [];

        sshConnections.set(sshConnectionsList);

        // Set SFTP connection
        const sftpConn = envDetails.sftpconnections[0] || { con_oid: 0, sshConOid: 0, remoteDirectory: '', isActive: false };
        sftpConnection.set({
            con_oid: sftpConn.con_oid,
            sshConOid: sftpConn.ssh_con_oid,
            remoteDirectory: sftpConn.remote_directory,
            isActive: sftpConn.is_active
        });

        console.log('All SSH Connections:', sshConnectionsList);
        console.log('SFTP Connection:', sftpConn);

        // Check if the SFTP connection has a valid SSH connection ID
        if (!sftpConn.ssh_con_oid) {
            console.error('SFTP connection does not have a valid SSH connection ID:', sftpConn);
        }
        console.log('SFTP Connection:>>>>>>>>>>>>>>', sftpConn);
        console.log('SFTP Connection SSH OID:>>>>>>>', sftpConn.ssh_con_oid);
        // Filter out the SSH connection related to SFTP
        const probeSSHConnectionsList = sshConnectionsList.filter((ssh: any) => ssh.con_oid !== sftpConn.ssh_con_oid);
        console.log('Filtered probeSSHConnections:>>>>>>>', probeSSHConnectionsList);
        probeSSHConnections.set(probeSSHConnectionsList);

        console.log('Filtered probeSSHConnections:', probeSSHConnectionsList);

        // Set other connection details
        wasConnections.set(
            envDetails.wasconnections.map((wasConnection: any) => ({
                con_oid: wasConnection.con_oid,
                env_oid: wasConnection.env_oid,
                host: wasConnection.host,
                keyStoreType: wasConnection.key_store_type,
                keystore: wasConnection.keystore,
                keystorePassword: wasConnection.keystore_password,
                name: wasConnection.name,
                password: wasConnection.password,
                port: wasConnection.port,
                username: wasConnection.username,
                truststorePassword: wasConnection.truststore_password,
                truststore: wasConnection.truststore,
                sslConfigUrl: wasConnection.ssl_config_url,
                soapConfigUrl: wasConnection.soap_config_url,
                securityEnabled: wasConnection.security_enabled,
                sasConfigUrl: wasConnection.sas_config_url,
                wasappserverconfigs: wasConnection.wasappserverconfigs
            })) || []
        );

        tlmConnection.set(envDetails.bddtlmconnections[0] || { connectionType: "BDDTLM", type: "", freeEntry: false, host: '', port: '', username: '', password: '', url: '', schema: '', sid: '', service: '', secured: false });
        x3sConnection.set(envDetails.bddx3sconnections[0] || { connectionType: "BDDX3S", type: "", freeEntry: false, host: '', port: '', username: '', password: '', url: '', schema: '', sid: '', service: '', secured: false });
        hostConnection.set(envDetails.bddhostconnections[0] || { connectionType: "BDDHOST", type: "", freeEntry: false, host: '', port: '', username: '', password: '', url: '', schema: '', sid: '', service: '', secured: false });
        bpmConnection.set(envDetails.bpmconnections[0] || { language: "", username: "", password: "" });
       
        databaseConnections.set(envDetails.databaseconnections || []);
        remoteConnectionFeatures.set(
            envDetails.remoteconnectionfeatures.map((feature: any) => ({
                feature_oid: feature.feature_oid,
                was_con_oid: feature.was_con_oid,
                ssh_con_oid: feature.ssh_con_oid,
                propagation: feature.propagation,
                installation: feature.installation,
                dmgr: feature.dmgr,
                instance_name: feature.instance_name,
                type: feature.type,
                app_server: feature.app_server,
                is_main: feature.is_main,
                probe_application: feature.probe_application,
                env_oid: feature.env_oid,
                wasappserverconfigs: feature.wasappserverconfigs.map((config: any) => ({
                    was_config_oid: config.was_config_oid,
                    uploadModeEnabled: config.upload_mode_enabled,
                    was_cell: config.was_cell,
                    was_node: config.was_node,
                    was_cluster: config.was_cluster,
                    was_name: config.was_name,
                    was_con_oid: config.was_con_oid,
                    targets: config.targets,
                    feature_oid: config.feature_oid
                })),
                tomcatappserverconfigs: feature.tomcatappserverconfigs.map((config: any) => ({
                    tomcat_config_oid: config.tomcat_config_oid,
                    server_name: config.server_name,
                    port: config.port,
                    binary_location: config.binary_location,
                    portlets_location: config.portlets_location,
                    feature_oid: config.feature_oid
                }))
            })) || []
        );

             // Initialize newRemoteConnectionFeature with first feature or default values
            const initialFeature = envDetails.remoteconnectionfeatures[0] || {
                ssh_con_oid: 0,
                was_con_oid: 0,
                propagation: false,
                installation: false,
                dmgr: false,
                instance_name: "",
                type: "",
                app_server: "",
                is_main: false,
                probe_application: "",
                env_oid: envId
            };
            newRemoteConnectionFeature.set(initialFeature);
        
            // Initialize newWasAppServerConfig and newTomcatAppServerConfig
            const initialWasConfig = initialFeature.wasappserverconfigs ? initialFeature.wasappserverconfigs[0] : {};
            newWasAppServerConfig.set(initialWasConfig);
        
            const initialTomcatConfig = initialFeature.tomcatappserverconfigs ? initialFeature.tomcatappserverconfigs[0] : {};
            newTomcatAppServerConfig.set(initialTomcatConfig);


        // Set environment details
        environmentDetails.set({
            env_name: envDetails.env_name || "",
            host_type: envDetails.host_type || "",
            encryption_type: envDetails.encryption_type || "",
            communication_type: envDetails.communication_type || ""
        });

        // Populate Host, TLM, X3S connections with the corresponding database connection data
        if (envDetails.bddhostconnections[0]) {
            const hostDbConnection = envDetails.databaseconnections.find((db: any) => db.con_oid === envDetails.bddhostconnections[0].bdd_con_oid);
            if (hostDbConnection) {
                hostConnection.update(n => ({ ...n, ...hostDbConnection }));
            }
        }

        if (envDetails.bddtlmconnections[0]) {
            const tlmDbConnection = envDetails.databaseconnections.find((db: any) => db.con_oid === envDetails.bddtlmconnections[0].bdd_con_oid);
            if (tlmDbConnection) {
                tlmConnection.update(n => ({ ...n, ...tlmDbConnection }));
            }
        }

        if (envDetails.bddx3sconnections[0]) {
            const x3sDbConnection = envDetails.databaseconnections.find((db: any) => db.con_oid === envDetails.bddx3sconnections[0].bdd_con_oid);
            if (x3sDbConnection) {
                x3sConnection.update(n => ({ ...n, ...x3sDbConnection }));
            }
        }

        // Filter the specific SSH connection based on the foreign key in the SFTP connection
        if (envDetails.sftpconnections[0]) {
            const sftpSSHConOid = envDetails.sftpconnections[0].ssh_con_oid;
            const foundSSHConnection = envDetails.sshconnections.find((ssh: SSHConnection) => ssh.con_oid === sftpSSHConOid);
            if (foundSSHConnection) {
                const transformedSSHConnection = {
                    con_oid: foundSSHConnection.con_oid,
                    authType: foundSSHConnection.auth_type,
                    host: foundSSHConnection.host,
                    port: foundSSHConnection.port,
                    username: foundSSHConnection.username,
                    password: foundSSHConnection.password,
                    privateKey: foundSSHConnection.private_key,
                    publicKey: foundSSHConnection.public_key,
                    passphrase: foundSSHConnection.passphrase
                };
                sshConnection.set(transformedSSHConnection);
                console.log('Found SSH Connection:', foundSSHConnection);
                console.log('authType after set:', get(sshConnection).authType);
            } 
        }

        console.log('Connection details:', get(connectionDetails));
        console.log('Environment details:', get(environmentDetails));
        console.log('Filtered probeSSHConnections:', get(probeSSHConnections));
    } catch (error) {
        console.error('Error loading environment details:', error);
        errorMessage.set('Error loading environment details.');
    }
}

  async function updateEnvironmentDetails1() {
    showProgressPopover = true;
        progressValue = 0;
        updateMessage = '';

    try {
      const envId = get(selectedEnvironmentId);
      const envDetails = get(environmentDetails);
      const sshDetails = get(sshConnection);
      const sftpDetails = get(sftpConnection);
      const bpmDetails = get(bpmConnection);
      const hostDetails = get(hostConnection);
      const x3sDetails = get(x3sConnection);
      const tlmDetails = get(tlmConnection);
      const wasDetails = get(wasConnections);
      const sshProbes = get(probeSSHConnections);
      // const remoteFeatures = get(newRemoteConnectionFeature);
      const wasAppConfig = get(newWasAppServerConfig);
      const tomcatAppConfig = get(newTomcatAppServerConfig);
      const remoteFeatures = get(remoteConnectionFeatures); // Updated to get all features
        const wasAppConfigs = get(wasAppServerConfigs); // Updated to get all WAS app configs
        const tomcatAppConfigs = get(tomcatAppServerConfigs);

      // Update environment details
      await client.mutate({
        mutation: UPDATE_ENVIRONMENT,
        variables: {
          env_oid: envId,
          env_name: envDetails.env_name,
          host_type: envDetails.host_type,
          encryption_type: envDetails.encryption_type,
          communication_type: envDetails.communication_type
        }
      });
      progressValue += 10;

      // Update SSH connection
      await client.mutate({
        mutation: UPDATE_SSH_CONNECTION,
        variables: {
          con_oid: sshDetails.con_oid,
          auth_type: sshDetails.authType,
          host: sshDetails.host,
          port: sshDetails.port,
          username: sshDetails.username,
          password: sshDetails.password,
          private_key: sshDetails.privateKey,
          public_key: sshDetails.publicKey,
          passphrase: sshDetails.passphrase
        }
      });

      progressValue += 10;

      // Update SFTP connection
      await client.mutate({
        mutation: UPDATE_SFTP_CONNECTION,
        variables: {
          con_oid: sftpDetails.con_oid,
          ssh_con_oid: sftpDetails.sshConOid,
          remote_directory: sftpDetails.remoteDirectory,
          is_active: sftpDetails.isActive
        }
      });

      progressValue += 10;

      // Update BPM connection
      await client.mutate({
        mutation: UPDATE_BPM_CONNECTION,
        variables: {
          con_oid: bpmDetails.con_oid,
          username: bpmDetails.username,
          language: bpmDetails.language,
          password: bpmDetails.password
        }
      });

      progressValue += 10;

      // Update Host connection
      await client.mutate({
        mutation: UPDATE_DATABASE_CONNECTION,
        variables: {
          con_oid: hostDetails.con_oid,
          type: hostDetails.type,
          free_entry: hostDetails.freeEntry,
          host: hostDetails.host,
          port: hostDetails.port,
          username: hostDetails.username,
          password: hostDetails.password,
          url: hostDetails.url,
          schema: hostDetails.schema,
          sid: hostDetails.sid,
          service: hostDetails.service,
          secured: hostDetails.secured
        }
      });

      progressValue += 10;

      // Update X3S connection
      await client.mutate({
        mutation: UPDATE_DATABASE_CONNECTION,
        variables: {
          con_oid: x3sDetails.con_oid,
          type: x3sDetails.type,
          free_entry: x3sDetails.freeEntry,
          host: x3sDetails.host,
          port: x3sDetails.port,
          username: x3sDetails.username,
          password: x3sDetails.password,
          url: x3sDetails.url,
          schema: x3sDetails.schema,
          sid: x3sDetails.sid,
          service: x3sDetails.service,
          secured: x3sDetails.secured
        }
      });

      progressValue += 10;

      // Update TLM connection
      await client.mutate({
        mutation: UPDATE_DATABASE_CONNECTION,
        variables: {
          con_oid: tlmDetails.con_oid,
          type: tlmDetails.type,
          free_entry: tlmDetails.freeEntry,
          host: tlmDetails.host,
          port: tlmDetails.port,
          username: tlmDetails.username,
          password: tlmDetails.password,
          url: tlmDetails.url,
          schema: tlmDetails.schema,
          sid: tlmDetails.sid,
          service: tlmDetails.service,
          secured: tlmDetails.secured
        }
      });

      progressValue += 10;

      // Update WAS connections
      for (const wasDetail of wasDetails) {
        if (wasDetail.con_oid.toString().length >= 13) {
                // create new was
                await client.mutate({
                    mutation: CREATE_WAS_CONNECTION,
                    variables: {
                        env_oid: get(selectedEnvironmentId),
                        name: wasDetail.name,
                        host: wasDetail.host,
                        port: wasDetail.port,
                        security_enabled: wasDetail.securityEnabled,
                        username: wasDetail.username,
                        password: wasDetail.password,
                        key_store_type: wasDetail.keystoreType,
                        ssl_config_url: wasDetail.sslConfigUrl,
                        soap_config_url: wasDetail.soapConfigUrl,
                        sas_config_url: wasDetail.sasConfigUrl,
                        truststore: wasDetail.truststore,
                        truststore_password: wasDetail.truststorePassword,
                        keystore: wasDetail.keystore,
                        keystore_password: wasDetail.keystorePassword
                    }
                });
            } else {
                // update existing was
                await client.mutate({
                    mutation: UPDATE_WAS_CONNECTION,
                    variables: {
                        con_oid: wasDetail.con_oid,
                        env_oid: wasDetail.env_oid,
                        name: wasDetail.name,
                        host: wasDetail.host,
                        port: wasDetail.port,
                        security_enabled: wasDetail.securityEnabled,
                        username: wasDetail.username,
                        password: wasDetail.password,
                        key_store_type: wasDetail.keystoreType,
                        ssl_config_url: wasDetail.sslConfigUrl,
                        soap_config_url: wasDetail.soapConfigUrl,
                        sas_config_url: wasDetail.sasConfigUrl,
                        truststore: wasDetail.truststore,
                        truststore_password: wasDetail.truststorePassword,
                        keystore: wasDetail.keystore,
                        keystore_password: wasDetail.keystorePassword
                    }
                });
            }
      }

      progressValue += 10;

           
    console.log('Remote Connection Features:', remoteFeatures);
    console.log('Environment ID:', envId);

      const tempIdMap = new Map();

       // Update probe SSH connections
       for (const sshProbe of sshProbes) {
            if (sshProbe.con_oid.toString().length >= 13) {
                // Create new SSH connection
                const createSshResponse = await client.mutate({
                    mutation: CREATE_SSH_CONNECTION,
                    variables: {
                        env_oid: get(selectedEnvironmentId),
                        auth_type: sshProbe.authType,
                        host: sshProbe.host,
                        port: sshProbe.port,
                        username: sshProbe.username,
                        password: sshProbe.password,
                        private_key: sshProbe.privateKey,
                        public_key: sshProbe.publicKey,
                        passphrase: sshProbe.passphrase
                    }
                });
               if (createSshResponse.data && createSshResponse.data.insert_console_sshconnection_one) {
                        const realConOid = createSshResponse.data.insert_console_sshconnection_one.con_oid;
                        tempIdMap.set(sshProbe.con_oid, realConOid); 
                        sshProbe.con_oid = realConOid; 
                    } else {
                        console.error('Failed to create SSH connection:', createSshResponse);
                    }
            } else {
                // Update existing SSH connection
                await client.mutate({
                    mutation: UPDATE_SSH_CONNECTION,
                    variables: {
                        con_oid: sshProbe.con_oid,
                        auth_type: sshProbe.authType,
                        host: sshProbe.host,
                        port: sshProbe.port,
                        username: sshProbe.username,
                        password: sshProbe.password,
                        private_key: sshProbe.privateKey,
                        public_key: sshProbe.publicKey,
                        passphrase: sshProbe.passphrase
                    }
                });
            }
        }

        progressValue += 10;

  
    // Update Remote Connection Features
    for (const feature of remoteFeatures) {
          console.log('Processing feature:', feature);
            if (feature.feature_oid && feature.feature_oid.toString().length >= 13) {
              if (tempIdMap.has(feature.ssh_con_oid)) {
                        feature.ssh_con_oid = tempIdMap.get(feature.ssh_con_oid);
                    }

                // Create new feature
                const createFeatureResponse = await client.mutate({
                    mutation: CREATE_REMOTE_CONNECTION_FEATURE,
                    variables: {
                        ssh_con_oid: feature.ssh_con_oid,
                        was_con_oid: feature.was_con_oid,
                        propagation: feature.propagation,
                        installation: feature.installation,
                        dmgr: feature.dmgr,
                        instance_name: feature.instance_name,
                        type: feature.type,
                        app_server: feature.app_server,
                        is_main: feature.is_main,
                        probe_application: feature.probe_application,
                        env_oid: get(selectedEnvironmentId)
                    }
                });
                if (createFeatureResponse.data && createFeatureResponse.data.insert_console_remoteconnectionfeature_one) {
                        const realFeatureOid = createFeatureResponse.data.insert_console_remoteconnectionfeature_one.feature_oid;
                        feature.feature_oid = realFeatureOid; // Update the temporary ID

                        // Create app server config based on type
                        if (feature.type === 'Websphere') {
                            const wasConfig = wasAppConfigs.find(config => config.feature_oid === feature.feature_oid);
                            if (wasConfig) {
                                await client.mutate({
                                    mutation: CREATE_WAS_APP_SERVER_CONFIG,
                                    variables: {
                                        upload_mode_enabled: wasConfig.upload_mode_enabled,
                                        was_cell: wasConfig.was_cell,
                                        was_node: wasConfig.was_node,
                                        was_cluster: wasConfig.was_cluster,
                                        was_name: wasConfig.was_name,
                                        was_con_oid: feature.was_con_oid,
                                        targets: wasConfig.targets,
                                        feature_oid: realFeatureOid 
                                    }
                                });
                            }
                        } else if (feature.type === 'Tomcat') {
                            const tomcatConfig = tomcatAppConfigs.find(config => config.feature_oid === feature.feature_oid);
                            if (tomcatConfig) {
                                await client.mutate({
                                    mutation: CREATE_TOMCAT_APP_SERVER_CONFIG,
                                    variables: {
                                        server_name: tomcatConfig.server_name,
                                        port: tomcatConfig.port,
                                        binary_location: tomcatConfig.binary_location,
                                        portlets_location: tomcatConfig.portlets_location,
                                        feature_oid: realFeatureOid 
                                    }
                                });
                            }
                        }
                    } else {
                        console.error('Failed to create Remote Connection Feature:', createFeatureResponse);
                    }
                } else if (feature.feature_oid) {
                // Update existing feature
                await client.mutate({
                    mutation: UPDATE_REMOTE_CONNECTION_FEATURE,
                    variables: {
                        feature_oid: feature.feature_oid,
                        ssh_con_oid: feature.ssh_con_oid,
                        was_con_oid: feature.was_con_oid,
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

                // Update app server config based on type
                // if (feature.type === 'Websphere') {
                //     const wasConfig = wasAppConfigs.find(config => config.feature_oid === feature.feature_oid);
                //     if (wasConfig) {
                //         await client.mutate({
                //             mutation: UPDATE_WAS_APP_SERVER_CONFIG,
                //             variables: {
                //                 was_config_oid: wasConfig.was_config_oid,
                //                 upload_mode_enabled: wasConfig.upload_mode_enabled,
                //                 was_cell: wasConfig.was_cell,
                //                 was_node: wasConfig.was_node,
                //                 was_cluster: wasConfig.was_cluster,
                //                 was_name: wasConfig.was_name,
                //                 was_con_oid: feature.was_con_oid,
                //                 targets: wasConfig.targets,
                //                 feature_oid: feature.feature_oid
                //             }
                //         });
                //     }
                // } else if (feature.type === 'Tomcat') {
                //     const tomcatConfig = tomcatAppConfigs.find(config => config.feature_oid === feature.feature_oid);
                //     if (tomcatConfig) {
                //         await client.mutate({
                //             mutation: UPDATE_TOMCAT_APP_SERVER_CONFIG,
                //             variables: {
                //                 tomcat_config_oid: tomcatConfig.tomcat_config_oid,
                //                 server_name: tomcatConfig.server_name,
                //                 port: tomcatConfig.port,
                //                 binary_location: tomcatConfig.binary_location,
                //                 portlets_location: tomcatConfig.portlets_location,
                //                 feature_oid: feature.feature_oid
                //             }
                //         });
                //     }
                // }
            } else {
                console.error('Remote Connection Feature OID is null or undefined:', feature);
            }
        }
        progressValue += 10;
    updateMessage = 'Environment connections updated successfully';

    } catch (error) {
        console.error('Error updating environment details:', error);
        errorMessage.set('Error updating environment details.');
        updateMessage = 'Error updating environment details: '+ error;
    }
   }

   async function updateEnvironmentDetails() {
    showProgressPopover = true;
    progressValue = 0;
    updateMessage = '';

    try {
        const envId = get(selectedEnvironmentId);
        const envDetails = get(environmentDetails);
        const sshDetails = get(sshConnection);
        const sftpDetails = get(sftpConnection);
        const bpmDetails = get(bpmConnection);
        const hostDetails = get(hostConnection);
        const x3sDetails = get(x3sConnection);
        const tlmDetails = get(tlmConnection);
        const wasDetails = get(wasConnections);
        const sshProbes = get(probeSSHConnections);
        const remoteFeatures = get(remoteConnectionFeatures); // Updated to get all features
        const wasAppConfigs = get(wasAppServerConfigs); // Updated to get all WAS app configs
        const tomcatAppConfigs = get(tomcatAppServerConfigs);

        console.log('Remote Connection Features:', remoteFeatures);
        console.log('Environment ID:', envId); // Log envId

        // Update environment details
        await client.mutate({
            mutation: UPDATE_ENVIRONMENT,
            variables: {
                env_oid: envId,
                env_name: envDetails.env_name,
                host_type: envDetails.host_type,
                encryption_type: envDetails.encryption_type,
                communication_type: envDetails.communication_type
            }
        });
        progressValue += 10;

        // Update SSH connection
        await client.mutate({
            mutation: UPDATE_SSH_CONNECTION,
            variables: {
                con_oid: sshDetails.con_oid,
                auth_type: sshDetails.authType,
                host: sshDetails.host,
                port: sshDetails.port,
                username: sshDetails.username,
                password: sshDetails.password,
                private_key: sshDetails.privateKey,
                public_key: sshDetails.publicKey,
                passphrase: sshDetails.passphrase
            }
        });

        progressValue += 10;

        // Update SFTP connection
        await client.mutate({
            mutation: UPDATE_SFTP_CONNECTION,
            variables: {
                con_oid: sftpDetails.con_oid,
                ssh_con_oid: sftpDetails.sshConOid,
                remote_directory: sftpDetails.remoteDirectory,
                is_active: sftpDetails.isActive
            }
        });

        progressValue += 10;

        // Update BPM connection
        await client.mutate({
            mutation: UPDATE_BPM_CONNECTION,
            variables: {
                con_oid: bpmDetails.con_oid,
                username: bpmDetails.username,
                language: bpmDetails.language,
                password: bpmDetails.password
            }
        });

        progressValue += 10;

        // Update Host connection
        await client.mutate({
            mutation: UPDATE_DATABASE_CONNECTION,
            variables: {
                con_oid: hostDetails.con_oid,
                type: hostDetails.type,
                free_entry: hostDetails.freeEntry,
                host: hostDetails.host,
                port: hostDetails.port,
                username: hostDetails.username,
                password: hostDetails.password,
                url: hostDetails.url,
                schema: hostDetails.schema,
                sid: hostDetails.sid,
                service: hostDetails.service,
                secured: hostDetails.secured
            }
        });

        progressValue += 10;

        // Update X3S connection
        await client.mutate({
            mutation: UPDATE_DATABASE_CONNECTION,
            variables: {
                con_oid: x3sDetails.con_oid,
                type: x3sDetails.type,
                free_entry: x3sDetails.freeEntry,
                host: x3sDetails.host,
                port: x3sDetails.port,
                username: x3sDetails.username,
                password: x3sDetails.password,
                url: x3sDetails.url,
                schema: x3sDetails.schema,
                sid: x3sDetails.sid,
                service: x3sDetails.service,
                secured: x3sDetails.secured
            }
        });

        progressValue += 10;

        // Update TLM connection
        await client.mutate({
            mutation: UPDATE_DATABASE_CONNECTION,
            variables: {
                con_oid: tlmDetails.con_oid,
                type: tlmDetails.type,
                free_entry: tlmDetails.freeEntry,
                host: tlmDetails.host,
                port: tlmDetails.port,
                username: tlmDetails.username,
                password: tlmDetails.password,
                url: tlmDetails.url,
                schema: tlmDetails.schema,
                sid: tlmDetails.sid,
                service: tlmDetails.service,
                secured: tlmDetails.secured
            }
        });

        progressValue += 10;

        // Map to hold temporary ID to real ID
        const tempIdMap = new Map();

        // Update WAS connections
        for (const wasDetail of wasDetails) {
            if (wasDetail.con_oid.toString().length >= 13) {
                // Create new WAS connection
                const createWasResponse = await client.mutate({
                    mutation: CREATE_WAS_CONNECTION,
                    variables: {
                        env_oid: envId, // Ensure envId is used here
                        name: wasDetail.name,
                        host: wasDetail.host,
                        port: wasDetail.port,
                        security_enabled: wasDetail.securityEnabled,
                        username: wasDetail.username,
                        password: wasDetail.password,
                        key_store_type: wasDetail.keystoreType,
                        ssl_config_url: wasDetail.sslConfigUrl,
                        soap_config_url: wasDetail.soapConfigUrl,
                        sas_config_url: wasDetail.sasConfigUrl,
                        truststore: wasDetail.truststore,
                        truststore_password: wasDetail.truststorePassword,
                        keystore: wasDetail.keystore,
                        keystore_password: wasDetail.keystorePassword
                    }
                });
                const realWasConOid = createWasResponse.data.insert_console_wasconnection_one.con_oid;
                tempIdMap.set(wasDetail.con_oid, realWasConOid); // Map temporary ID to real ID
                wasDetail.con_oid = realWasConOid; // Update the temporary ID
            } else {
                // Update existing WAS connection
                await client.mutate({
                    mutation: UPDATE_WAS_CONNECTION,
                    variables: {
                        con_oid: wasDetail.con_oid,
                        env_oid: wasDetail.env_oid,
                        name: wasDetail.name,
                        host: wasDetail.host,
                        port: wasDetail.port,
                        security_enabled: wasDetail.securityEnabled,
                        username: wasDetail.username,
                        password: wasDetail.password,
                        key_store_type: wasDetail.keystoreType,
                        ssl_config_url: wasDetail.sslConfigUrl,
                        soap_config_url: wasDetail.soapConfigUrl,
                        sas_config_url: wasDetail.sasConfigUrl,
                        truststore: wasDetail.truststore,
                        truststore_password: wasDetail.truststorePassword,
                        keystore: wasDetail.keystore,
                        keystore_password: wasDetail.keystorePassword
                    }
                });
            }
        }

        progressValue += 10;

        // Update probe SSH connections
        for (const sshProbe of sshProbes) {
            try {
                if (sshProbe.con_oid.toString().length >= 13) {
                    // Create new SSH connection
                    const createSshResponse = await client.mutate({
                        mutation: CREATE_SSH_CONNECTION,
                        variables: {
                            env_oid: envId, // Ensure envId is passed here
                            auth_type: sshProbe.authType,
                            host: sshProbe.host,
                            port: sshProbe.port,
                            username: sshProbe.username,
                            password: sshProbe.password,
                            private_key: sshProbe.privateKey,
                            public_key: sshProbe.publicKey,
                            passphrase: sshProbe.passphrase
                        }
                    });
                    if (createSshResponse.data && createSshResponse.data.insert_console_sshconnection_one) {
                        const realConOid = createSshResponse.data.insert_console_sshconnection_one.con_oid;
                        tempIdMap.set(sshProbe.con_oid, realConOid); // Map temporary ID to real ID
                        sshProbe.con_oid = realConOid; // Update the temporary ID
                    } else {
                        console.error('Failed to create SSH connection:', createSshResponse);
                    }
                } else {
                    // Update existing SSH connection
                    await client.mutate({
                        mutation: UPDATE_SSH_CONNECTION,
                        variables: {
                            con_oid: sshProbe.con_oid,
                            auth_type: sshProbe.authType,
                            host: sshProbe.host,
                            port: sshProbe.port,
                            username: sshProbe.username,
                            password: sshProbe.password,
                            private_key: sshProbe.privateKey,
                            public_key: sshProbe.publicKey,
                            passphrase: sshProbe.passphrase
                        }
                    });
                }
            } catch (error) {
                console.error('Error updating/creating SSH connection:', error, sshProbe);
            }
        }

        progressValue += 10;

        // Update Remote Connection Features
        for (const feature of remoteFeatures) {
            try {
                console.log('Processing feature:', feature); // Log each feature being processed
                const realSshConOid = tempIdMap.get(feature.ssh_con_oid) || feature.ssh_con_oid;

                if (feature.feature_oid && feature.feature_oid.toString().length >= 13) {
                    // Create new feature
                    const createFeatureResponse = await client.mutate({
                        mutation: CREATE_REMOTE_CONNECTION_FEATURE,
                        variables: {
                            ssh_con_oid: realSshConOid,
                            was_con_oid: feature.was_con_oid || null, // Ensure was_con_oid is null if not provided
                            propagation: feature.propagation,
                            installation: feature.installation,
                            dmgr: feature.dmgr,
                            instance_name: feature.instance_name,
                            type: feature.type,
                            app_server: feature.app_server,
                            is_main: feature.is_main,
                            probe_application: feature.probe_application,
                            env_oid: envId // Ensure envId is passed here
                        }
                    });

                    const realFeatureOid = createFeatureResponse.data.insert_console_remoteconnectionfeature_one.feature_oid;

                    console.log("feature type>>>>>>>", feature.type);
                    if (createFeatureResponse.data && createFeatureResponse.data.insert_console_remoteconnectionfeature_one) {
                        const realFeatureOid = createFeatureResponse.data.insert_console_remoteconnectionfeature_one.feature_oid;
                        feature.feature_oid = realFeatureOid;

                        if (feature.type === 'Websphere') {
                            const wasConfig = wasAppConfigs.find(config => config.feature_oid === feature.feature_oid);
                            if (wasConfig) {
                                await client.mutate({
                                    mutation: CREATE_WAS_APP_SERVER_CONFIG,
                                    variables: {
                                        upload_mode_enabled: wasConfig.upload_mode_enabled,
                                        was_cell: wasConfig.was_cell,
                                        was_node: wasConfig.was_node,
                                        was_cluster: wasConfig.was_cluster,
                                        was_name: wasConfig.was_name,
                                        was_con_oid: feature.was_con_oid || null,
                                        targets: wasConfig.targets,
                                        feature_oid: realFeatureOid 
                                    }
                                });
                            }
                        }
                        else if (feature.type === 'Tomcat') {
                            const tomcatConfig = tomcatAppConfigs.find(config => config.feature_oid === feature.feature_oid);
                            if (tomcatConfig) {
                                await client.mutate({
                                    mutation: CREATE_TOMCAT_APP_SERVER_CONFIG,
                                    variables: {
                                        server_name: tomcatConfig.server_name,
                                        port: tomcatConfig.port,
                                        binary_location: tomcatConfig.binary_location,
                                        portlets_location: tomcatConfig.portlets_location,
                                        feature_oid: realFeatureOid
                                    }
                                });
                            }
                        }
                      }
                } else if (feature.feature_oid) {
                    // Update existing feature
                    await client.mutate({
                        mutation: UPDATE_REMOTE_CONNECTION_FEATURE,
                        variables: {
                            feature_oid: feature.feature_oid,
                            ssh_con_oid: feature.ssh_con_oid,
                            was_con_oid: feature.was_con_oid || null,
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

                    // Update app server config based on type
                    if (feature.type === 'Websphere') {
                        const wasConfig = wasAppConfigs.find(config => config.feature_oid === feature.feature_oid);
                        if (wasConfig) {
                            await client.mutate({
                                mutation: UPDATE_WAS_APP_SERVER_CONFIG,
                                variables: {
                                    was_config_oid: wasConfig.was_config_oid,
                                    upload_mode_enabled: wasConfig.upload_mode_enabled,
                                    was_cell: wasConfig.was_cell,
                                    was_node: wasConfig.was_node,
                                    was_cluster: wasConfig.was_cluster,
                                    was_name: wasConfig.was_name,
                                    was_con_oid: feature.was_con_oid || null,
                                    targets: wasConfig.targets,
                                    feature_oid: feature.feature_oid
                                }
                            });
                        }
                    } else if (feature.type === 'Tomcat') {
                        const tomcatConfig = tomcatAppConfigs.find(config => config.feature_oid === feature.feature_oid);
                        if (tomcatConfig) {
                            await client.mutate({
                                mutation: UPDATE_TOMCAT_APP_SERVER_CONFIG,
                                variables: {
                                    tomcat_config_oid: tomcatConfig.tomcat_config_oid,
                                    server_name: tomcatConfig.server_name,
                                    port: tomcatConfig.port,
                                    binary_location: tomcatConfig.binary_location,
                                    portlets_location: tomcatConfig.portlets_location,
                                    feature_oid: feature.feature_oid
                                }
                            });
                        }
                    }
                } else {
                    console.error('Remote Connection Feature OID is null or undefined:', feature);
                }
            } catch (error) {
                console.error('Error updating/creating Remote Connection Feature:', error, feature);
            }
        }
        progressValue += 10;
        updateMessage = 'Environment connections updated successfully';

    } catch (error) {
        console.error('Error updating environment details:', error);
        errorMessage.set('Error updating environment details.');
        updateMessage = 'Error updating environment details: ' + error;
    }
}


    // Watch for changes in selected environment and load its details
    selectedEnvironmentId.subscribe(async (envId) => {
        if (envId) {
            console.log('Selected Environment ID:', envId); 
            await fetchEnvironmentDetails(envId);
        }
    });

    // Reactive statements to print connections
    $: if ($sshConnections.length > 0) console.log('Current SSH Connections:', $sshConnections);
    $: if ($wasConnections.length > 0) console.log('Current WAS Connections:', $wasConnections);
    $: if ($sftpConnection) console.log('Current SFTP Connection:', $sftpConnection);
    $: if ($bpmConnection) console.log('Current BPM Connection:', $bpmConnection);
    $: if ($hostConnection) console.log('Current Host Connection:', $hostConnection);
    $: if ($x3sConnection) console.log('Current X3S Connection:', $x3sConnection);
    $: if ($tlmConnection) console.log('Current TLM Connection:', $tlmConnection);
    $: if ($databaseConnections.length > 0) console.log('Current Database Connections:', $databaseConnections);
    $: sshConnection.subscribe(value => {
        if (value) console.log('Specific SSH Connection:', value);
    });
    $: if ($remoteConnectionFeatures.length > 0) console.log('Current Remote Connection Features:', $remoteConnectionFeatures);


    

    let testMessage = writable('');
    let technicalMessage = writable('');
    let testingInProgress = writable(false);
    let testProgress = writable(0);

    function openProgressPopover() {
      showProgressPopover = true;
      testingInProgress.set(true);
      testProgress.set(0);
      document.body.style.overflow = 'hidden';
    }

    function closeProgressPopover() {
        showProgressPopover = false;
        testingInProgress.set(false);
        document.body.style.overflow = 'auto';
    }

    async function testConnection(connection: any, index: number, connectionType: string) {
    
    openProgressPopover();
    testMessage.set(`Starting test for connection ${index + 1}...`);

    // Reset the specific connection status to initial state
  connectionStatuses.update(statuses => {
    if (connectionType === 'BDDHOST') {
      return { ...statuses, host: 'success' };
    } else if (connectionType === 'BDDX3S') {
      return { ...statuses, x3s: 'success' };
    } else if (connectionType === 'BDDTLM') {
      return { ...statuses, tlm: 'success' };
    } else if (connectionType === 'SSH') {
      const newStatuses = [...statuses.ssh];
      newStatuses[index] = 'success';
      return { ...statuses, ssh: newStatuses };
    }
    return statuses;
  });

  
  testMessage.set('');
  technicalMessage.set('');

    const testUrl = 'http://localhost:8085/console/env-management/v1/test-connections';
    const requestBody = {
      envName: $environmentDetails.env_name,
      hostType: $environmentDetails.host_type,
      encryptionType: $environmentDetails.encryption_type,
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
                    user: connection.username,
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

      //  Update the progress bar incrementally
       let timer = setInterval(() => {
            testProgress.update(n => {
                if (n < 100) return n + 10; // Increment by 10%
                clearInterval(timer);
                return 100;
            });
        }, 1000); 

        if (response.status === 400) {
      throw new Error('Bad request');
    }

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
    } catch (error: any) {
      console.error('Failed to test connection', index, error);
      testMessage.set(`Failed to test connection ${index + 1}: ${error.message}`);
      technicalMessage.set(`Failed to test connection ${index + 1}: ${error.message}`);
      testProgress.set(100);
    
    // Update the connectionStatuses store to 'failure' for the tested connection
    connectionStatuses.update(statuses => {
      if (connectionType === 'BDDHOST') {
        return { ...statuses, host: 'failure' };
      } else if (connectionType === 'BDDX3S') {
        return { ...statuses, x3s: 'failure' };
      } else if (connectionType === 'BDDTLM') {
        return { ...statuses, tlm: 'failure' };
      } else if (connectionType === 'SSH') {
        const newStatuses = [...statuses.ssh];
        newStatuses[index] = 'failure';
        return { ...statuses, ssh: newStatuses };
      }
      return statuses;
    });

    }
  }

  async function testSshConnection(connection: any, index: number) {
    openProgressPopover();
   
    testMessage.set(`Starting test for connection ${index + 1}...`);
    console.log($environmentDetails.env_name);
    console.log($environmentDetails.host_type,);

    const testUrl = 'http://localhost:8085/console/env-management/v1/test-connections';
    const requestBody = {
        envName: $environmentDetails.env_name,
        hostType: $environmentDetails.host_type,
        encryptionType: $environmentDetails.encryption_type,
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
        }, 100); // Adjust interval speed as needed

        const responseData = await response.json();
        clearInterval(timer);
        console.log('Response data:', responseData);

        if (responseData.success) {
            testMessage.set(`Connection ${index + 1} tested successfully!`);
        } else {
            const errorMessages = responseData.data.connections[0].testResult.feedbacks.join(', ') || 'Unknown error';
            testMessage.set(`Connection ${index + 1} failed: ${errorMessages}`);//should be replace by user friendly error
            technicalMessage.set(errorMessages);
        }
        testProgress.set(100);
    } catch (error) {
        console.error('Failed test for connection', index, error);
        
        
        testProgress.set(100);
    }
  }

  async function testMailboxConnections() {
  openProgressPopover();
  testMessage.set(`Starting test for mailbox connections...`);
  connectionStatuses.set({
    ssh: [],
    was: [],
    host: 'success',
    tlm: 'success',
    x3s: 'success',
    singleSsh: 'success',
    sftp: 'success'
  });
  testMessage.set('');

  const testUrl = 'http://localhost:8085/console/env-management/v1/test-connections';
  const requestBody = {
    envName: $environmentDetails.env_name,
    hostType: $environmentDetails.host_type,
    encryptionType: $environmentDetails.encryption_type,
    communicationType: "SSH",
    connections: [
      {
        action: "test",
        connection: {
          connectionType: "SSH",
          authType: $sshConnection.authType,
          host: $sshConnection.host,
          port: $sshConnection.port,
          username: $sshConnection.username,
          password: $sshConnection.password,
          privateKey: $sshConnection.privateKey,
          publicKey: $sshConnection.publicKey,
          passphrase: $sshConnection.passphrase,
        }
      },
      {
        action: "test",
        connection: {
          connectionType: "SFTP",
          authType: $sshConnection.authType,
          host: $sshConnection.host,
          port: $sshConnection.port,
          username: $sshConnection.username,
          password: $sshConnection.password,
          privateKey: $sshConnection.privateKey,
          publicKey: $sshConnection.publicKey,
          passphrase: $sshConnection.passphrase,
          remoteDirectory: $sftpConnection.remoteDirectory,
          isActive: $sftpConnection.isActive,
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

    if (response.status === 400) {
      throw new Error('Bad request');
    }

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
      technicalMessage.set(`Test results:\n${feedbacks}`);
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
  } catch (error) {
    console.error('Failed to test mailbox connections', error);
    testMessage.set('Failed to test mailbox connections. Please try again.');
    testProgress.set(100);
  } 
  }

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

  async function testAllConnections() {
    openProgressPopover();
      // Reset connectionStatuses to initial state
      connectionStatuses.set({
    ssh: [],
    was: [],
    host: 'success',
    tlm: 'success',
    x3s: 'success',
    singleSsh: 'success',
    sftp: 'success'
  });
  testMessage.set('');
  technicalMessage.set('');

  testMessage.set('Starting test for all connections...');

  const testUrl = 'http://localhost:8085/console/env-management/v1/test-connections';
  const requestBody = {
    envName: $environmentDetails.env_name,
    hostType: $environmentDetails.host_type,
    encryptionType: $environmentDetails.encryption_type,
    communicationType: 'SSH',
    sshConnections: [
      ...sshConnectionsDetails
    ],
    connections: [
      {
        action: 'test',
        connection: {
          connectionType: 'BDDHOST',
          type: 'ORACLE',
          freeEntry: $hostConnection.freeEntry,
          host: $hostConnection.host,
          port: $hostConnection.port,
          user: $hostConnection.username,
          password: $hostConnection.password,
          schema: $hostConnection.schema,
          sid: $hostConnection.sid,
        }
      },
      {
        action: 'test',
        connection: {
          connectionType: 'BDDTLM',
          type: $tlmConnection.type,
          freeEntry: $tlmConnection.freeEntry,
          host: $tlmConnection.host,
          port: $tlmConnection.port,
          user: $tlmConnection.username,
          password: $tlmConnection.password,
          schema: $tlmConnection.schema,
          sid: $tlmConnection.sid,
        }
      },
      {
        action: 'test',
        connection: {
          connectionType: 'BDDX3S',
          type: 'ORACLE',
          freeEntry: $x3sConnection.freeEntry,
          host: $x3sConnection.host,
          port: $x3sConnection.port,
          user: $x3sConnection.username,
          password: $x3sConnection.password,
          schema: $x3sConnection.schema,
          sid: $x3sConnection.sid,
          secured: $x3sConnection.secured,
        }
      },
      {
        action: 'test',
        connection: {
          connectionType: 'SSH',
          authType: $sshConnection.authType,
          host: $sshConnection.host,
          port: $sshConnection.port,
          user: $sshConnection.username,
          password: $sshConnection.password,
          privateKey: $sshConnection.privateKey,
          publicKey: $sshConnection.publicKey,
          passphrase: $sshConnection.passphrase,
        }
      },
      {
        action: 'test',
        connection: {
          connectionType: 'SFTP',
          authType: $sshConnection.authType,
          host: $sshConnection.host,
          port: $sshConnection.port,
          user: $sshConnection.username,
          password: $sshConnection.password,
          privateKey: $sshConnection.privateKey,
          publicKey: $sshConnection.publicKey,
          passphrase: $sshConnection.passphrase,
          remoteDirectory: $sftpConnection.remoteDirectory,
          isActive: $sftpConnection.isActive,
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

    if (response.status === 400) {
      throw new Error('Bad request');
    }


    const responseData = await response.json();
    clearInterval(timer);
    console.log('Response data:', responseData);

    if (responseData.success) {
      testMessage.set('All connections tested successfully!');
      connectionStatuses.set({
        ssh: sshConnectionsDetails.map(() => 'success'),
        was: wasConnectionsDetails.map(() => 'success'),
        host: 'success',
        tlm: 'success',
        x3s: 'success',
        singleSsh: 'success',
        sftp: 'success'
      });
      testProgress.set(100);
    } else {
      const feedbacks = responseData.data.connections.map((conn: any, idx: number) =>
        `Connection ${idx + 1} (${conn.connection.connectionType}): ${conn.testResult.feedbacks.join(', ')}`
      ).join('\n');
      testMessage.set(`Test results:\n${feedbacks}`);
      
    }
  } catch (error: any) {
    console.error('Failed to test all connections', error);
    technicalMessage.set(error)
    testMessage.set('Failed to test all connections. Please try again.');
    testProgress.set(100);
  }
  }

  function addNewSSHConnection() {
    const newConnection: SSHConnectionInfo = {
        con_oid: Date.now(), // Temporary ID, to be replaced by actual ID from database
        authType: 'Password', // Correctly typed as 'Password' | 'Identity'
        host: '',
        port: 22,
        username: '',
        password: '',
        privateKey: '',
        publicKey: '',
        passphrase: ''
    };
    newSshConnections.set(newConnection);

    const newFeature = {
        ssh_con_oid: newConnection.con_oid,
        was_con_oid: 0,
        propagation: false,
        installation: false,
        dmgr: false,
        instance_name: '',
        type: '',
        app_server: '',
        is_main: false,
        probe_application: ''
    };
    newRemoteConnectionFeature.set(newFeature);

    const newWasConfig = {
        was_config_oid: 0,
        feature_oid: 0,
        was_con_oid: 0,
        upload_mode_enabled: false,
        was_cell: '',
        was_node: '',
        was_cluster: '',
        was_name: '',
        targets: '',
    };
    newWasAppServerConfig.set(newWasConfig);

    const newTomcatConfig = {
        tomcat_config_oid: 0,
        feature_oid: 0,
        server_name: '',
        port: 22,
        binary_location: '',
        portlets_location: '',
    };
    newTomcatAppServerConfig.set(newTomcatConfig);

    toggleSSHPopover(false);
  }

  function handleSaveSSHConnection() {
    const currentConnection = get(newSshConnections);
    const allConnections = get(sshConnections);
    const allFeatures = get(remoteConnectionFeatures);
    const temp_id = currentConnection.con_oid ? currentConnection.con_oid : Date.now();

    const currentFeature = get(newRemoteConnectionFeature);
    const featureTempId = Date.now();

    // Check for duplicate instance names
    const isDuplicateInstanceName = allFeatures.some(feature => 
        feature.instance_name === currentFeature.instance_name && 
        feature.feature_oid !== currentFeature.feature_oid &&
        feature.env_oid === get(selectedEnvironmentId)
    );

    if (isDuplicateInstanceName) {
        errorMessage.set('An SSH connection with this instance name already exists.');
        return;
    }
    errorMessage.set('');

    if (currentConnection.con_oid) {
        // This is an update
        sshConnections.update(connections => 
            connections.map(conn => conn.con_oid === currentConnection.con_oid ? currentConnection : conn)
        );
    } else {
        // This is an addition
        sshConnections.update(connections => [...connections, { ...currentConnection, con_oid: temp_id }]);
    }

    // Also update probeSSHConnections
    const probeConnections = get(probeSSHConnections);
    probeSSHConnections.set([...probeConnections, currentConnection]);

    // Save to local storage
    localStorage.setItem('probeSSHConnections', JSON.stringify(get(probeSSHConnections)));
    console.log('Updated probeSSHConnections:', get(probeSSHConnections));

    // Add the new feature to remoteConnectionFeatures and log the updated features
    remoteConnectionFeatures.update(features => {
        const updatedFeatures = [...features, { ...currentFeature, feature_oid: featureTempId }];
        console.log('Updated Remote Connection Features:', updatedFeatures);
        return updatedFeatures;
    });

    // Save the updated features to local storage
    localStorage.setItem('remoteConnectionFeatures', JSON.stringify(get(remoteConnectionFeatures)));

    // Add the app server config based on the type
    if (currentFeature.type === 'Websphere') {
        const currentWasConfig = get(newWasAppServerConfig);
        const wasConfigTempId = Date.now() + 1; 
        wasAppServerConfigs.update(configs => {
            const updatedConfigs = [...configs, { ...currentWasConfig, feature_oid: featureTempId, was_config_oid: wasConfigTempId }];
            console.log('Updated Websphere App Server Configs:', updatedConfigs);
            return updatedConfigs;
        });
    } else if (currentFeature.type === 'Tomcat') {
        const currentTomcatConfig = get(newTomcatAppServerConfig);
        const tomcatConfigTempId = Date.now() + 1;
        tomcatAppServerConfigs.update(configs => {
            const updatedConfigs = [...configs, { ...currentTomcatConfig, feature_oid: featureTempId, tomcat_config_oid: tomcatConfigTempId }];
            console.log('Updated Tomcat App Server Configs:', updatedConfigs);
            return updatedConfigs;
        });
    }

    // Save the updated configs to local storage
    localStorage.setItem('wasAppServerConfigs', JSON.stringify(get(wasAppServerConfigs)));
    localStorage.setItem('tomcatAppServerConfigs', JSON.stringify(get(tomcatAppServerConfigs)));

    // Reset the newSshConnections store and close the modal
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
        type: '',
        app_server: '',
        is_main: false,
        probe_application: ''
    });

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

    newTomcatAppServerConfig.set({
        tomcat_config_oid: 0,
        feature_oid: 0,
        server_name: '',
        port: 22,
        binary_location: '',
        portlets_location: '',
    });

    toggleSSHPopover(false);
}
    
  function handleSaveSSHConnection1() {
    const currentConnection = get(newSshConnections);
    const allConnections = get(sshConnections);
    const allFeatures = get(remoteConnectionFeatures);
    const currentFeature = get(newRemoteConnectionFeature);
    const temp_id = currentConnection.con_oid ? currentConnection.con_oid : Date.now();

    // Check for duplicate instance names within the same environment
    const isDuplicateInstanceName = allFeatures.some(feature => 
        feature.instance_name === currentFeature.instance_name && 
        feature.env_oid === get(selectedEnvironmentId) &&
        feature.feature_oid !== currentFeature.feature_oid // Ensure we exclude the current feature being edited
    );

    if (isDuplicateInstanceName) {
        errorMessage.set('An SSH connection with this instance name already exists.');
        return;
    }

    errorMessage.set('');

    if (currentConnection.con_oid) {
        // This is an update
        sshConnections.update(connections => 
            connections.map(conn => conn.con_oid === currentConnection.con_oid ? currentConnection : conn)
        );
        probeSSHConnections.update(connections => 
            connections.map(conn => conn.con_oid === currentConnection.con_oid ? currentConnection : conn)
        );
        remoteConnectionFeatures.update(features => 
            features.map(feature => feature.ssh_con_oid === currentConnection.con_oid ? currentFeature : feature)
        );
    } else {
        // This is an addition
        sshConnections.update(connections => [...connections, { ...currentConnection, con_oid: temp_id }]);
        probeSSHConnections.update(connections => [...connections, { ...currentConnection, con_oid: temp_id }]);
        remoteConnectionFeatures.update(features => [...features, { ...currentFeature, feature_oid: temp_id }]);
    }

    localStorage.setItem('probeSSHConnections', JSON.stringify(get(probeSSHConnections)));
    localStorage.setItem('remoteConnectionFeatures', JSON.stringify(get(remoteConnectionFeatures)));

    if (currentFeature.type === 'Websphere') {
        const currentWasConfig = get(newWasAppServerConfig);
        wasAppServerConfigs.update(configs => {
            const configIndex = configs.findIndex(config => config.feature_oid === currentFeature.feature_oid);
            if (configIndex !== -1) {
                configs[configIndex] = { ...currentWasConfig, feature_oid: temp_id };
            } else {
                configs.push({ ...currentWasConfig, feature_oid: temp_id });
            }
            return configs;
        });
    } else if (currentFeature.type === 'Tomcat') {
        const currentTomcatConfig = get(newTomcatAppServerConfig);
        tomcatAppServerConfigs.update(configs => {
            const configIndex = configs.findIndex(config => config.feature_oid === currentFeature.feature_oid);
            if (configIndex !== -1) {
                configs[configIndex] = { ...currentTomcatConfig, feature_oid: temp_id };
            } else {
                configs.push({ ...currentTomcatConfig, feature_oid: temp_id });
            }
            return configs;
        });
    }

    localStorage.setItem('wasAppServerConfigs', JSON.stringify(get(wasAppServerConfigs)));
    localStorage.setItem('tomcatAppServerConfigs', JSON.stringify(get(tomcatAppServerConfigs)));

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
        type: '',
        app_server: '',
        is_main: false,
        probe_application: ''
    });

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

    newTomcatAppServerConfig.set({
        tomcat_config_oid: 0,
        feature_oid: 0,
        server_name: '',
        port: 22,
        binary_location: '',
        portlets_location: '',
    });

    toggleSSHPopover(false);
}

</script>

<!-- <Popover.Root>
    {#if showProgressPopover}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-4xl w-full">
                <h2 class="text-lg font-bold dark:text-gray-300">Updating Environment</h2>
                <Progress value={progressValue} max={100} class="w-full mt-4" />
                {#if updateMessage}
                    <p class="mt-4 text-center text-gray-700 dark:text-gray-300">{updateMessage}</p>
                {/if}
            </div>
        </div>
    {/if}
</Popover.Root> -->

{#if showProgressPopover}
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

<div class="p-4 bg-white dark:bg-gray-800">
    <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Environment</h2>
    <div class="mt-4">
        <label for="environment-selector" class="text-sm font-medium text-gray-700 block mb-2 dark:text-gray-300">Select Environment to Edit:</label>
        <select id="environment-selector" bind:value={$selectedEnvironmentId} class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300">
            <option value={null} disabled selected>-- Select an Environment --</option>
            {#each $environments as environment (environment.env_oid)}
                <option value={environment.env_oid}>{environment.env_name}</option>
            {/each}
        </select>
    </div>
    {#if $selectedEnvironmentId}
        <div class="mt-4">
            
            <div class="mt-4">
                <h1 class="text-xl font-bold text-[#FFAA33]">General Details</h1>
                <div class="space-y-1">
                    <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Environment Name:</label>
                        <input type="text" bind:value={$environmentDetails.env_name} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900"/>
                        {#if !$isEnvNameUnique}
                        <p class="text-red-500 dark:text-red-400 mt-2">Environment name already exists. Please choose a different name.</p>
                      {/if}
                      </div>
                    <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Host Type:</label>
                        <select bind:value={$environmentDetails.host_type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                            <option value="IBMI">IBMI</option>
                            <option value="LINUX">LINUX</option>
                        </select>
                    </div>
                    <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Encryption Type:</label>
                        <select bind:value={$environmentDetails.encryption_type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                            <option value="no encryption">No Encryption</option>
                            <option value="encrypted">Encrypted</option>
                            <option value="AES-256">AES-256</option>
                        </select>
                    </div>
                    <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Communication Type:</label>
                        <select bind:value={$environmentDetails.communication_type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                            <option value="SSH/FTP/FTPS">SSH/FTP/FTPS</option>
                            <option value="HTTP/HTTPS">HTTP/HTTPS</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- MailBox section  -->
            <button type="button" on:click={testMailboxConnections} class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">test</button>
            <h1 class="text-xl font-bold text-[#FFAA33]">MailBox</h1>
            <div class={($connectionStatuses.singleSsh === 'failure' || $connectionStatuses.sftp === 'failure') ? 'border border-red-500 p-2' : ''}>
            <div class="space-y-1 py-4">
              <div class="space-y-1 py-4">
                <h1 class="text-xl font-bold text-[#FFAA33]">SSH Connection</h1>
                <div class="flex items-center">
                    <label class="text-gray-700 dark:text-gray-300 w-1/4">Authentication Type:</label>
                    <select bind:value={$sshConnection.authType} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                        <option value="Password">Password</option>
                        <option value="Identity">Key</option>
                    </select>
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
                  <input type="text" bind:value={$sshConnection.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required/>
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                  <input type="number" min="0" bind:value={$sshConnection.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required/>
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                  <input type="text" bind:value={$sshConnection.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required/>
                </div>
                {#if $sshConnection.authType === 'Password'}
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                  <input type="password" bind:value={$sshConnection.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
                </div>
                {:else if $sshConnection.authType === 'Identity'}
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Public Key:</label>
                  <input type="text" bind:value={$sshConnection.publicKey} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Private Key:</label>
                  <input type="text" bind:value={$sshConnection.privateKey} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Passphrase:</label>
                  <input type="text" bind:value={$sshConnection.passphrase} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
                </div>
                {/if}
              </div>
              <div class="space-y-1 py-4">
                <h1 class="text-xl font-bold text-[#FFAA33]">SFTP Connection</h1>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Remote Directory :</label>
                  <input type="text" bind:value={$sftpConnection.remoteDirectory} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required/>
                </div>
                <div class="flex items-center">
                  <label class="text-gray-700 dark:text-gray-300 w-1/4">Active :</label>
                  <input type="checkbox" bind:checked={$sftpConnection.isActive} class="align-middle transform scale-100">
                </div>
              </div>
            </div>

        
          </div>
          <div class="space-y-1 py-4">
            <h1 class="text-xl font-bold text-[#FFAA33]">SAB BPM</h1>
            <p class="font-bold mt-2">These settings are only useful if SAB BPM is version 7.5.10 or higher.</p>
            <div class="flex items-center">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
              <input type="text" bind:value={$bpmConnection.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
            </div>
            <div class="flex items-center">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Language:</label>
              <select bind:value={$bpmConnection.language} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
                <option value="FR">FR</option>
                <option value="EN">EN</option>
              </select>
            </div>
            <div class="flex items-center">
              <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
              <input type="password" bind:value={$bpmConnection.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required>
            </div>
          </div>
            <!-- Host Connection -->
            <div class="space-y-1 py-4">
              <h1 class="text-xl font-bold text-[#FFAA33]">Host Database</h1>
              <div class={$connectionStatuses.host === 'failure' ? 'border border-red-500 p-2' : ''}>
                <button type="button"
                on:click={() => testConnection($hostConnection, 0, "BDDHOST")} 
                class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">
                Test
              </button>
                <h1 class="text-xl font-bold text-[#FFAA33]">Host Connection</h1>
                <div class="space-y-1">
                    <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                        <select bind:value={$hostConnection.type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900">
                            <option value="DB2">DB2</option>
                            <option value="ORACLE">ORACLE</option>
                        </select>
                    </div>
                   <div class="flex items-center">
                    <label class="text-gray-700 dark:text-gray-300 w-1/4">Free Entry:</label>
                    <input 
                      type="checkbox" 
                      bind:checked={$hostConnection.freeEntry}
                      class="align-middle transform scale-100">
                  </div>
                      </div>
    
                      {#if $hostConnection.freeEntry}
                        <div class="flex items-center">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">URL:</label>
                          <input 
                            type="text" 
                            bind:value={$hostConnection.url} 
                            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                            required>
                        </div>
                      {:else}
                        <div class="flex items-center">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
                          <input 
                            type="text" 
                            bind:value={$hostConnection.host} 
                            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                            required>
                        </div>
                        {#if $hostConnection.type === 'ORACLE'}
                          <div class="flex items-center">
                            <label class="text-gray-700 dark:text-gray-300 w-1/4">Service:</label>
                            <input 
                              type="text" 
                              bind:value={$hostConnection.service} 
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
                           bind:value={$hostConnection.port} 
                           class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                           required>
                       </div>
                       <div class="flex items-center">
                         <label class="text-gray-700 dark:text-gray-300 w-1/4">Username:</label>
                         <input 
                           type="text" 
                           bind:value={$hostConnection.username} 
                           class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                           required>
                       </div>
                       <div class="flex items-center">
                         <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                         <input 
                           type="password" 
                           bind:value={$hostConnection.password} 
                           class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                           required>
                       </div>
                       {#if !$hostConnection.freeEntry}
                         <div class="flex items-center">
                           <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
                           <input 
                             type="text" 
                             bind:value={$hostConnection.schema} 
                             class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                             required>
                         </div>
                         <div class="flex items-center">
                           <label class="text-gray-700 dark:text-gray-300 w-1/4">SID:</label>
                           <input 
                             type="text" 
                             bind:value={$hostConnection.sid} 
                             class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                             required>
                         </div>
                       {/if}
                       <div class="flex items-center">
                         <label class="text-gray-700 dark:text-gray-300 w-1/4">Secured:</label>
                         <input 
                           type="checkbox" 
                           bind:checked={$hostConnection.secured} 
                           class="align-middle transform scale-100">
                       </div>

                       </div>
            </div>

            <!-- X3S CONNECTION -->
            <div class="space-y-1 py-4">
              <div class={$connectionStatuses.x3s === 'failure' ? 'border border-red-500 p-2' : ''}>
                <button type="button"
                on:click={() => testConnection($x3sConnection, 0, "BDDX3S")} 
                class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">
                Test
              </button>
                    <h1 class="text-xl font-bold text-[#FFAA33]">X3S Database</h1>
                    <div  class="space-y-1 py-4">
                  <div class="flex items-center">
                    <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                    <select 
                      bind:value={$x3sConnection.type} 
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
                      bind:checked={$x3sConnection.freeEntry} 
                      class="align-middle transform scale-100">
                  </div>
              
                  {#if $x3sConnection.freeEntry}
                    <div class="flex items-center">
                      <label class="text-gray-700 dark:text-gray-300 w-1/4">URL: </label>
                      <input 
                        type="text" 
                        bind:value={$x3sConnection.url} 
                        class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                        required>
                    </div>
                  {:else}
                    <div class="flex items-center">
                      <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
                      <input 
                        type="text" 
                        bind:value={$x3sConnection.host} 
                        class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                        required>
                    </div>
                    {#if $x3sConnection.type === 'ORACLE'}
                      <div class="flex items-center">
                        <label class="text-gray-700 dark:text-gray-300 w-1/4">Service:</label>
                        <input 
                          type="text" 
                          bind:value={$x3sConnection.service} 
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
                      bind:value={$x3sConnection.port} 
                      class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                      required>
                  </div>
                  <div class="flex items-center">
                    <label class="text-gray-700 dark:text-gray-300 w-1/4">Username:</label>
                    <input 
                      type="text" 
                      bind:value={$x3sConnection.username} 
                      class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                      required>
                  </div>
                  <div class="flex items-center">
                    <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                    <input 
                      type="password" 
                      bind:value={$x3sConnection.password} 
                      class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                      required>
                  </div>
                  {#if !$x3sConnection.freeEntry}
                    <div class="flex items-center">
                      <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
                      <input 
                        type="text" 
                        bind:value={$x3sConnection.schema} 
                        class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                        required>
                    </div>
                    <div class="flex items-center">
                      <label class="text-gray-700 dark:text-gray-300 w-1/4">SID:</label>
                      <input 
                        type="text" 
                        bind:value={$x3sConnection.sid} 
                        class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
                        required>
                    </div>
                  {/if}
                  <div class="flex items-center">
                    <label class="text-gray-700 dark:text-gray-300 w-1/4">Secured:</label>
                    <input 
                      type="checkbox" 
                      bind:checked={$x3sConnection.secured} 
                      class="align-middle transform scale-100">
                  </div>
                </div>
                </div>
            </div>

            <!-- TLM CONNECTION  -->
             <div class="space-y-1 py-4">
              
              <div class={$connectionStatuses.tlm === 'failure' ? 'border border-red-500 p-2' : ''}>
                <button type="button"
                on:click={() => testConnection($tlmConnection, 0, "BDDTLM")} 
                class="bg-blue-500 dark:bg-blue-700 text-white px-2 py-0 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-800 text-sm rounded">
                Test
              </button>
               <h1 class="text-xl font-bold text-[#FFAA33]">Telemaintenance Database</h1>
               <div class="space-y-1 py-4">
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
        <select 
          bind:value={$tlmConnection.type} 
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
          bind:checked={$tlmConnection.freeEntry} 
          class="align-middle transform scale-100">
      </div>
    
      {#if $tlmConnection.freeEntry}
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">URL:</label>
          <input 
            type="text" 
            bind:value={$tlmConnection.url} 
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
            required>
        </div>
      {:else}
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Host:</label>
          <input 
            type="text" 
            bind:value={$tlmConnection.host} 
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
            required>
        </div>
        {#if $tlmConnection.type === 'ORACLE'}
          <div class="flex items-center">
            <label class="text-gray-700 dark:text-gray-300 w-1/4">Service:</label>
            <input 
              type="text" 
              bind:value={$tlmConnection.service} 
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
          bind:value={$tlmConnection.port} 
          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
          required>
      </div>
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Username:</label>
        <input 
          type="text" 
          bind:value={$tlmConnection.username} 
          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
          required>
      </div>
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
        <input 
          type="password" 
          bind:value={$tlmConnection.password} 
          class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
          required>
      </div>
      {#if !$tlmConnection.freeEntry}
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">Schema:</label>
          <input 
            type="text" 
            bind:value={$tlmConnection.schema} 
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
            required>
        </div>
        <div class="flex items-center">
          <label class="text-gray-700 dark:text-gray-300 w-1/4">SID:</label>
          <input 
            type="text" 
            bind:value={$tlmConnection.sid} 
            class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" 
            required>
        </div>
      {/if}
      <div class="flex items-center">
        <label class="text-gray-700 dark:text-gray-300 w-1/4">Secured:</label>
        <input 
          type="checkbox" 
          bind:checked={$tlmConnection.secured} 
          class="align-middle transform scale-100">
      </div>
               </div>

              </div>

             </div>
             <button type="button" on:click={openAddWASConnectionModal} class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">Add</button>

             <Popover.Root>
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
                          <input type="number" min="0" bind:value={$newWasConnections.port} class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full" disabled={viewingMode} required/>
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
                        <button 
                          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"  
                          on:click={handleSaveWasConnection}>
                          Submit 
                        </button>
                      {/if}
                    </div>
                  </div>
                {/if}
             </Popover.Root>
            
            
            <!-- WAI Table -->
             <div class="overflow-x-auto mb-6 mt-4">
                <h4 class="font-bold underline text-[#FFAA33] mt-4">WAS Connections</h4>
                <table class="min-w-full table-auto text-left border-collapse">
                    <thead class="bg-gray-400 dark:bg-gray-700 text-white">
                        <tr>
                            <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">ID</th>
                            <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $wasConnections as wasConnection}
                            <tr class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">{wasConnection.name || 'N/A'}</td>
                                <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">
                                    <button type="button" on:click={() => viewWasConnection(wasConnection)} class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700">Display</button>
                                    <button type="button" on:click={() => openEditWASConnectionModal(wasConnection)} class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700">Edit</button>
                                   <button type="button" on:click={() => deleteWASConnection(wasConnection.con_oid)} class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700">Delete</button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
             </div>

             <button type="button" on:click={addNewSSHConnection} class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">Add SSH Connection</button>

             <!-- SSH Connection Modal -->
             <Popover.Root>
              {#if sshPopoverOpen}
              <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div class="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                      <button
                          class="absolute top-3 right-3 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
                          on:click={() => toggleSSHPopover(false)}
                      >
                          <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                      <h1 class="text-lg font-bold dark:text-gray-300">SSH Connections Information</h1>
                      <h1 class="text-xl font-bold text-[#FFAA33]">SSH Connection</h1>
          
                      {#if $errorMessage}
                      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                          <span class="block sm:inline">{$errorMessage}</span>
                      </div>
                      {/if}
          
                      <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Authentication Type:</label>
                          <select bind:value={$newSshConnections.authType} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required disabled={viewingMode}>
                              <option value="Password">Password</option>
                              <option value="Identity">Key</option>
                          </select>
                      </div>
                      <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Host: </label>
                          <input type="text" bind:value={$newSshConnections.host} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required disabled={viewingMode}/>
                      </div>
                      <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Port:</label>
                          <input type="number" min="0" bind:value={$newSshConnections.port} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required disabled={viewingMode}/>
                      </div>
                      <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Login:</label>
                          <input type="text" bind:value={$newSshConnections.username} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required disabled={viewingMode}/>
                      </div>
                      {#if $newSshConnections.authType === 'Password'}
                      <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Password:</label>
                          <input type="password" bind:value={$newSshConnections.password} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required disabled={viewingMode}/>
                      </div>
                      {:else}
                      <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Public Key:</label>
                          <input type="text" bind:value={$newSshConnections.publicKey} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required disabled={viewingMode}/>
                      </div>
                      <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Private Key:</label>
                          <input type="text" bind:value={$newSshConnections.privateKey} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required disabled={viewingMode}/>
                      </div>
                      <div class="flex items-center mb-4">
                          <label class="text-gray-700 dark:text-gray-300 w-1/4">Passphrase:</label>
                          <input type="text" bind:value={$newSshConnections.passphrase} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" required disabled={viewingMode}/>
                      </div>
                      {/if}
          
                      <div class="mt-4">
                          <div class="text-[#FFAA33] font-bold underline mt-4">General Information</div>
                          <div class="flex items-center mb-4">
                              <label class="text-gray-700 dark:text-gray-300 w-1/4">Instance name:</label>
                              <input type="text" bind:value={$newRemoteConnectionFeature.instance_name} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled={viewingMode}/>
                          </div>
                          <div class="flex items-center mb-4">
                              <label class="text-gray-700 dark:text-gray-300 w-1/4">Type:</label>
                              <select bind:value={$newRemoteConnectionFeature.type} class="border border-gray-300 dark:border-gray-700 rounded py-1 px-2 text-gray-700 dark:text-gray-300 w-2/5 bg-gray-100 dark:bg-gray-900" disabled={viewingMode}>
                                  <option value="Tomcat">Tomcat</option>
                                  <option value="Websphere">Websphere</option>
                              </select>
                          </div>
                          <div class="flex items-center mb-4">
                              <label class="text-gray-700 dark:text-gray-300 w-1/4">Is the main:</label>
                              <Checkbox bind:checked={$newRemoteConnectionFeature.is_main} class="align-middle transform scale-100" disabled={viewingMode}/>
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
                      </div>
          
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
                              <label class="text-gray-700 dark:text-gray-300">Server name: </label>
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
                      <button
                      class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" on:click={handleSaveSSHConnection}>
                          Submit
                      </button>
                      {/if}
                  </div>
              </div>
              {/if}
          </Popover.Root>
             <!-- SSH Table -->
             <div class="overflow-x-auto mb-6">
                <h4 class="font-bold underline text-[#FFAA33] mt-4">SSH Connections</h4>
                <table class="min-w-full table-auto text-left border-collapse">
                    <thead class="bg-gray-400 dark:bg-gray-700 text-white">
                        <tr>
                            <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Test</th>
                            <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Host</th>
                            <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Port</th>
                            <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Username</th>
                            <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $probeSSHConnections  as ssh, index}
                            <tr class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">
                                    <button class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                                    on:click={() => testSshConnection(ssh, index)}
                                  >Test</button>
                                </td>
                                <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">{ssh.host}</td>
                                <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">{ssh.port}</td>
                                <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">{ssh.username}</td>
                                <td class="px-4 py-2 border border-gray-300 dark:border-gray-700">
                                    <button type="button" on:click={() => viewSSHConnection(index)} class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700">Display</button>
                                    <button type="button" on:click={() => openEditSSHConnectionModal(index)} class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-yellow-700">Edit</button>
                                    <button type="button" on:click={() => deleteSSHConnection(ssh.con_oid)} class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700">Delete</button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
             </div>

             <button type="button" on:click={testAllConnections} class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Test All Connections
              </button>
             <button on:click={updateEnvironmentDetails} class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Update Environment</button>
  
        </div>
        
    {/if}
</div>