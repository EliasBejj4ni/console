//src/lib/stores.ts

import { writable, type Writable } from 'svelte/store';
import type { Environment, SelectedInfo, DatabaseConnection, BddConnection } from './types';

export const newEnvironmentName: Writable<string> = writable('');
export const newHostType: Writable<string> = writable('');
export const showInputs: Writable<boolean> = writable(false);
export const selectedDuplicateEnvId: Writable<number | null> = writable(null);
export const environments: Writable<Environment[]> = writable([]);
export const errorMessage: Writable<string> = writable('');
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
    type: string;
    host: string;
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
    authType: 'password',
    host: '',
    port: 22, 
    username: '',
    password: '',
    privateKey: '',
    publicKey: '',
    passphrase: ''
});

export const sftpConnection = writable<SFTPConnectionInfo>({
    sshConOid: 0, // This will need to be set based on a selected SSH connection
    remoteDirectory: '',
    isActive: false
});

  export interface BPMConnectionInfo {
    language: string;
    username: string;
    password: string;
  }

  export interface WasConnectionInfo {
    host: string;
    port: string;
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

  export interface SSHConnectionInfo {
    authType: 'password' | 'key';
    host: string;
    port: number;
    username: string;
    password: string;
    privateKey: string;
    publicKey: string;
    passphrase: string;
}

export interface SFTPConnectionInfo {
    remoteDirectory: string;
    isActive: boolean;
   
}

export const connectionDetails = writable<ConnectionParams>({
    Host: {
      type: '',
      host: '',
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
      type: '',
      host: '',
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
      type: '',
      host: '',
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
      authType: 'password',
      host: '',
      port: 22,
      username: '',
      password: '',
      privateKey: '',
      publicKey: '',
      passphrase: ''
    },
    SFTP: {
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