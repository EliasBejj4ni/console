// Define interfaces for Environment and Connection objects
export interface Environment {
    env_oid: number;
    env_name: string;
    host_type: string;
 }
 
 export interface SSHConnection {
    env_oid: number;
    con_oid?: number;
    passphrase: string | null;
    password: string | null;
    private_key: string | null;
    public_key: string | null;
    username: string;
    host: string;
    port: number;
    auth_type: string;
 }
 
 
 export interface DatabaseConnection {
    env_oid: number;
    con_oid?: number;
    type: string;
    free_entry: boolean;
    host: string;
    port: number;
    username: string;
    password: string;
    url: string | null;
    schema: string | null;
    sid: string | null;
    service: string | null;
    secured: boolean | null;
 }
 
 export interface SFTPConnection {
    env_oid: number;
    con_oid?: number;
    ssh_con_oid: number;
    remote_directory: string;
    is_active: boolean;
 }
 
 export interface BDDTLMConnection {
    env_oid: number;
    con_oid?: number;
    bdd_con_oid?: number;
 }
 
 export interface BDDHostConnection {
    env_oid: number;
    con_oid?: number;
    bdd_con_oid?: number;
 }
 
 export interface BDDX3SConnection {
    con_oid?: number;
    bdd_con_oid?: number;
    env_oid: number;
 }
 
 export interface WASConnection {
    env_oid: number;
    name: string;
    con_oid?: number;
    host: string;
    port: number;
    security_enabled: boolean;
    username: string;
    password: string;
    key_store_type: string;
    ssl_config_url: string;
    soap_config_url: string;
    sas_config_url: string;
    truststore: string;
    truststore_password: string;
    keystore: string;
    keystore_password: string;
 }
 
 export interface BPMConnection {
    con_oid?: number;
    env_oid: number;
    username: string;
    password: string;
    language: string;
}

// Parameter installation interfaces

 export interface InstallationInfo {
   env_oid: number;
   install_type_default: string;
   instconfig_oid: number;
   integration_thread_number: number;
   applicationparameters: ApplicationParameter[];
   environment: {
     env_name: string;
     host_type: string;
   };
 }

 export interface ApplicationParameter {
   appparam_oid: number;
   config_files_dir: string;
   infra_type: string;
   instconfig_oid: number;
   thread_number: number;
   components: Component[];
 }

 export interface Component {
   appparam_oid: number;
   component_oid: number;
   server_type: string;
   type: string;
   value: string;
 }

 export interface InstallationData {
   applicationparameters: ApplicationParameter[];
 }

 