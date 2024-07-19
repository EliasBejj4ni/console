//src/lib/types.ts
import { writable, type Writable } from 'svelte/store';

export type Environment = {
    env_oid: number;
    env_name: string;
  };
  
  export type SelectedInfo = {
    env_oid?: number;
    env_name: string;
    context: string;
    block_installations: boolean;
    cause: string;
    encryption_type: string;
    communication_type: string;
    type?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    url?: string;
    schema?: string;
    sid?: string;
    service?: string;
    secured?: boolean;
    auth_type?: string;
    private_key?: string;
    public_key?: string;
    passphrase?: string;
    ssh_con_oid?: number;
    remote_directory?: string;
    is_active?: boolean;
  };
  
  export interface DatabaseConnection {
    type: string;
    free_entry?: boolean;
    host: string;
    port: number | null;
    username?: string;
    password?: string;
    url?: string;
    schema?: string;
    sid?: string;
    service?: string;
    secured: boolean;
  }

  export type BddConnection = {
    type: Writable<string>;
    host: Writable<string>;
    free_entry: Writable<boolean>;
    port: Writable<number | null>;
    username: Writable<string>;
    password: Writable<string>;
    url: Writable<string>;
    schema: Writable<string>;
    sid: Writable<string>;
    service: Writable<string>;
    secured: Writable<boolean>;
  };
  
  type WasConnection = {
    con_oid: number;
    env_oid: number;
    host: string;
    key_store_type: string | null;
    keystore: string;
    keystore_password: string;
    name: string;
    password: string;
    port: number;
    remoteconnectionfeatures: any[]; 
    sas_config_url: string;
    security_enabled: boolean;
    soap_config_url: string;
    ssl_config_url: string;
    truststore: string;
    truststore_password: string;
    username: string;
    wasappserverconfigs: any[];
  };
  