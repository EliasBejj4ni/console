//src/lib/stores.ts

import { writable, type Writable } from 'svelte/store';
import type { Environment, SelectedInfo, DatabaseConnection, BddConnection } from './types';

export type ConnectionStatus = 'success' | 'failure';
export const connectionTestResults = writable({});
export const connectionStatuses = writable<ConnectionStatuses>({
  ssh: [],
  was: [],
  host: null,
  tlm: null,
  x3s: null,
  singleSsh: null,
  sftp: null
});

export interface ConnectionStatuses {
  ssh: ConnectionStatus[];
  was: ConnectionStatus[];
  host: ConnectionStatus | null;
  tlm: ConnectionStatus | null;
  x3s: ConnectionStatus | null;
  singleSsh: ConnectionStatus | null;
  sftp: ConnectionStatus | null;
}

export interface EnvironmentDetails {
  env_name: string;
  host_type: string;
  encryption_type: string;
  communication_type: string;
}
export const environmentDetails: Writable<EnvironmentDetails> = writable({
  env_name: '',
  host_type: '',
  encryption_type: '',
  communication_type: ''
});

export const newEnvironmentName: Writable<string> = writable('');
export const newHostType: Writable<string> = writable('');
export const encryptionType: Writable<string> = writable('');
export const communicationType : Writable<string> = writable('');
export const configurator: Writable<boolean> = writable(false);
export const showInputs: Writable<boolean> = writable(false);
export const selectedDuplicateEnvId: Writable<number | null> = writable(null);
export const environments: Writable<Environment[]> = writable([]);
export const errorMessage: Writable<string> = writable('');
export const technicalMessage: Writable<string> = writable('');
export const selectedInfo: Writable<SelectedInfo> = writable({
  env_oid: 0,
  env_name: '',
  context: '',
  block_installations: false,
  cause: '',
  encryption_type: '',
  communication_type: '',
});
export const selectedEnvironmentId = writable<number | null>(null);


  export const bddConnection: Writable<BddConnection> = writable({
    type: writable(''),
    free_entry: writable(false),
    host: writable(''),
    port: writable(null),
    username: writable(''),
    password: writable(''),
    url: writable(''),
    schema: writable(''),
    sid: writable(''),
    service: writable(''),
    secured: writable(false)
  });

  export const sshConnections = writable<SSHConnectionInfo[]>([]);
  export const newSshConnections = writable<SSHConnectionInfo>({
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


  export const remoteConnectionFeatures = writable<RemoteConnectionFeature[]>([]);
  export const newRemoteConnectionFeature = writable<RemoteConnectionFeature>({
    ssh_con_oid: 0,
    was_con_oid: 0,
    propagation: false,
    installation: false,
    dmgr: false,
    instance_name: '',
    type: 'websphere',
    app_server: '',
    is_main: false,
    probe_application: '',
    wasappserverconfigs: [],
    tomcatappserverconfigs: []
  });
  export const wasAppServerConfigs = writable<WebsphereAppServerConfig []>([]);
  export const newWasAppServerConfig = writable<WebsphereAppServerConfig>({
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
  
  export const newWasAppServerConfigs = writable<WebsphereAppServerConfig []>([]);

  export const tomcatAppServerConfigs = writable<TomcatAppServerConfig[]>([]);
  export const newTomcatAppServerConfig = writable<TomcatAppServerConfig>({
    tomcat_config_oid: 0,
    feature_oid: 0,
    server_name: '',
    port: 0,
    binary_location: '',
    portlets_location: ''
  });
  export const newTomcatAppServerConfigs = writable<TomcatAppServerConfig[]>([]);

  export const probeSSHConnections = writable<SSHConnectionInfo[]>([]);
  
  export const newProbeSSHConnection = writable<newSSHConnectionInfo>({
    con_oid: 0,
    authType: 'Password',
    host: '',
    port: 22,
    username: '',
    password: '',
    privateKey: '',
    publicKey: '',
    passphrase: '',
    remoteConnectionFeature: {
        ssh_con_oid: 0,
        propagation: false,
        installation: false,
        dmgr: false,
        instance_name: '',
        type: 'Tomcat',
        app_server: '',
        is_main: false,
        probe_application: '',
    }
  });

  export const existingProbeSSHConnections = writable<SSHConnectionInfo[]>([]);

  export const newlyAddedProbeSSHConnections = writable<SSHConnectionInfo[]>([]);

  export const newProbeSSHConnections = writable<
  Array<{
    sshConnection: SSHConnectionInfo;
    remoteFeature: RemoteConnectionFeature;
    appServerConfig: WebsphereAppServerConfig | TomcatAppServerConfig;
  }>
>([]);

export const exisitingProbeSSHConnections = writable<SSHConnectionInfo[]>([]);

export const currentSshConnection = writable<SSHConnectionInfo>({
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

  export const probeApps = writable<ProbeApplications>({
    BPM: false,
    SDE: false,
    X3: false,
    X3S: false,
    YPB: false
  });

  export const newWasConnection = writable<WasConnectionInfo>({
    con_oid: 0,
    host: '',
    port: 0,
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
  });

  export const wasConnections = writable<WebsphereConnectionInfo[]>([]);
  export const newWasConnections = writable<WebsphereConnectionInfo>({
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
    keystoreType : '',
    port: 0,
    soapConfigUrl: '',
    sasConfigUrl: '',
    truststorePassword: '',
    keystorePassword: '',
  });

  export const wasConnectionsList = writable<WebsphereConnectionInfo[]>([]);

  export interface ProbeApplications {
    BPM: boolean;
    SDE: boolean;
    X3: boolean;
    X3S: boolean;
    YPB: boolean;
  }

  export interface RemoteConnectionFeature {
    feature_oid?: number; 
    was_con_oid?: number;
    ssh_con_oid: number;
    propagation: boolean;
    installation: boolean;
    dmgr: boolean;
    instance_name: string;
    type: string;
    app_server: string; 
    is_main: boolean;
    probe_application: string;
    env_oid?: number;
    wasappserverconfigs?: WebsphereAppServerConfig[];
    tomcatappserverconfigs?: TomcatAppServerConfig[];
  }

  export interface NewRemoteConnectionFeature {
    feature_oid?: number; 
    was_con_oid?: number;
    ssh_con_oid: number;
    propagation: boolean;
    installation: boolean;
    dmgr: boolean;
    instance_name: string;
    type: string;
    app_server: string; 
    is_main: boolean;
    probe_application: string;
    env_oid?: number;
  }

  export interface WebsphereAppServerConfig  {
    was_config_oid?: number;
    feature_oid: number;
    was_con_oid: number;
    upload_mode_enabled: boolean;
    was_cell: string;
    was_node: string;
    was_cluster: string;
    was_name: string;
    targets?: string;
  }

  export interface TomcatAppServerConfig {
    tomcat_config_oid?: number;
    feature_oid: number;
    server_name: string;
    port: number;
    binary_location: string;
    portlets_location: string;
  }
  

  export interface ConnectionParams {
    Host: ConnectionInfo;
    TLM: ConnectionInfo;
    X3S: ConnectionInfo;
    BPM: BPMConnectionInfo;
    Was: WasConnectionInfo[];
    SSH: SSHConnectionInfo;
    SFTP: SFTPConnectionInfo;
  }
  
  export interface ConnectionInfo {
    connectionType: string;
    type: string;
    host: string;
    freeEntry: boolean;
    port: string;
    username: string;
    password: string;
    url: string;
    schema: string;
    sid: string;
    service: string;
    secured: boolean;
  }

  export const sshConnection = writable<SSHConnectionInfo>({
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

  // Define the initial state for sshConnection
  export const initialSSHConnection = {
    authType: 'Password',
    host: '',
    port: 22, 
    username: '',
    password: '',
    privateKey: '',
    publicKey: '',
    passphrase: ''
};


export const specificSSHConnection = writable<SSHConnectionInfo>({
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

  export const sftpConnection: Writable<SFTPConnectionInfo> = writable({
    con_oid: 0,
    sshConOid: 0,
    remoteDirectory: '',
    isActive: false
});

export const tlmConnection: Writable<TlmConnectionInfo> = writable({
  con_oid: 0,
  connectionType: 'BDDTLM',
  type: '',
  host: '',
  freeEntry: false,
  port: '',
  username: '',
  password: '',
  url: '',
  schema: '',
  sid: '',
  service: '',
  secured: false
});

export const x3sConnection: Writable<X3sConnectionInfo> = writable({
  con_oid: 0,
  connectionType: 'BDDX3S',
  type: '',
  host: '',
  freeEntry: false,
  port: '',
  username: '',
  password: '',
  url: '',
  schema: '',
  sid: '',
  service: '',
  secured: false
});

export const bpmConnection: Writable<BpmConnectionInfo> = writable({
  con_oid: 0,
  language: '',
  username: '',
  password: ''
});

export const databaseConnections: Writable<DatabaseConnectionInfo[]> = writable([]);

export const hostConnection: Writable<HostConnectionInfo> = writable({
  con_oid: 0,
  connectionType: 'BDDHOST',
  type: '',
  host: '',
  freeEntry: false,
  port: '',
  username: '',
  password: '',
  url: '',
  schema: '',
  sid: '',
  service: '',
  secured: false
});


  export interface BPMConnectionInfo {
    language: string;
    username: string;
    password: string;
  }

  export interface DatabaseConnectionInfo {
    con_oid: number;
    env_oid: number;
    freeEntry: boolean;
    host: string;
    password: string;
    port: string;
    schema: string;
    secured: boolean;
    service: string;
    sid: string;
    type: string;
    url: string;
    username: string;
}

  export interface WasConnectionInfo {
    con_oid: number;
    host: string;
    port: number;
    securityEnabled: boolean;
    username: string;
    password: string;
    keyStoreType: string;
    sslConfigUrl: string;
    soapConfigUrl: string;
    sasConfigUrl: string;
    truststore: string;
    truststorePassword: string;
    keystore: string;
    keystorePassword: string;
    name: string;
  }

  export interface WebsphereConnectionInfo {
    con_oid: number;
    env_oid: number;
    name: string;
    host: string;
    username: string;
    password: string;
    sslConfigUrl: string;
    securityEnabled: boolean;
    truststore: string;
    keystore: string;
    keystoreType: string;
    port: number;
    soapConfigUrl: string;
    sasConfigUrl: string;
    truststorePassword: string;
    keystorePassword: string;
  }

  export interface SSHConnectionInfo {
    con_oid: number;
    env_oid?: number;
    authType: 'Password' | 'Identity';
    host: string;
    port: number;
    username: string;
    password: string;
    privateKey: string;
    publicKey: string;
    passphrase: string;
}

export interface newSSHConnectionInfo {
  con_oid: number;
  authType: 'Password' | 'Identity';
  host: string;
  port: number;
  username: string;
  password: string;
  privateKey: string;
  publicKey: string;
  passphrase: string;
  remoteConnectionFeature: NewRemoteConnectionFeature;
}

export interface SFTPConnectionInfo {
    con_oid: number;
    sshConOid: number;
    remoteDirectory: string;
    isActive: boolean;
   
}

export interface TlmConnectionInfo {
  con_oid: number;
  connectionType: string;
  type: string;
  host: string;
  freeEntry: boolean;
  port: string;
  username: string;
  password: string;
  url: string;
  schema: string;
  sid: string;
  service: string;
  secured: boolean;
}

export interface X3sConnectionInfo {
  con_oid: number;
  connectionType: string;
  type: string;
  host: string;
  freeEntry: boolean;
  port: string;
  username: string;
  password: string;
  url: string;
  schema: string;
  sid: string;
  service: string;
  secured: boolean;
}

export interface BpmConnectionInfo {
  con_oid: number;
  language: string;
  username: string;
  password: string;
}

export interface HostConnectionInfo {
  con_oid: number;
  connectionType: string;
  type: string;
  host: string;
  freeEntry: boolean;
  port: string;
  username: string;
  password: string;
  url: string;
  schema: string;
  sid: string;
  service: string;
  secured: boolean;
}


export const connectionDetails = writable<ConnectionParams>({
    Host: {
      connectionType: 'BDDHOST',
      type: '',
      host: '',
      freeEntry: false,
      port: '',
      username: '',
      password: '',
      url: '',
      schema: '',
      sid: '',
      service: '',
      secured: false
    },
    TLM: {
      connectionType: 'BDDTLM',
      type: '',
      host: '',
      freeEntry: false,
      port: '',
      username: '',
      password: '',
      url: '',
      schema: '',
      sid: '',
      service: '',
      secured: false
    },
    X3S: {
      connectionType: 'BDDX3S',
      type: '',
      host: '',
      freeEntry: false,
      port: '',
      username: '',
      password: '',
      url: '',
      schema: '',
      sid: '',
      service: '',
      secured: false
    },
    BPM: {
      language: '',
      username: '',
      password: ''
    },
    Was: [] as WasConnectionInfo[],
    SSH: {
      con_oid: 0,
      authType: 'Password',
      host: '',
      port: 22,
      username: '',
      password: '',
      privateKey: '',
      publicKey: '',
      passphrase: ''
    },
    SFTP: {
      con_oid: 0,
      sshConOid: 0,
      remoteDirectory: '',
      isActive: false
    }
});

export interface Component {
    type: string;
    server_type: string;
    value: string;
  }
  
export interface ComponentsMap {
    [key: string]: Component[];
  }