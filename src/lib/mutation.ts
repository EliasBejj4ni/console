//src/lib/mutation.ts
import { gql } from '@apollo/client/core';

export const GET_ENV = gql`
    query GetEnvironment {
        console_environment {
            env_oid
            env_name
			host_type
			creation_dt_hr
			last_modified_dt_hr
			latest_backup_dt_hr
			dup_backup_oid
			rest_backup_oid
          }
    }
`;

export const CREATE_ENVIRONMENT = gql`
  mutation CreateEnvironment($env_name: String!, $host_type: String!, $encryption_type: String!, $communication_type: String!, $active_configurator: Boolean!) {
    insert_console_environment_one(object: {env_name: $env_name, host_type: $host_type, encryption_type: $encryption_type, communication_type: $communication_type, active_configurator: $active_configurator}) {
      env_oid
      env_name
      host_type
      encryption_type
      active_configurator
    }
  }
`;

export const DELETE_ENVIRONMENT = gql`
mutation DELETE_ENVIRONMENT($env_oid: bigint!) {
    delete_console_environment_by_pk(env_oid: $env_oid) {
      env_oid
    }
  }
`;

export const CREATE_DATABASE_CONNECTION = gql`
  mutation CreateDatabaseConnection($env_oid: bigint!, $type: String!, $free_entry: Boolean, $host: String!, $port: Int!, $username: String, $password: String, $url: String, $schema: String, $sid: String, $service: String, $secured: Boolean) {
    insert_console_databaseconnection_one(object: {env_oid: $env_oid, type: $type,  free_entry: $free_entry, host: $host, port: $port, username: $username, password: $password, url: $url, schema: $schema, sid: $sid, service: $service, secured: $secured}) {
      con_oid
    }
  }
`;

export const CREATE_BDDHOST_CONNECTION = gql`
  mutation CreateBddHostConnection($env_oid: bigint!, $bdd_con_oid: bigint!) {
    insert_console_bddhostconnection_one(object: { env_oid: $env_oid, bdd_con_oid: $bdd_con_oid }) {
      con_oid
    }
  }
`;

export const CREATE_BDDTLM_CONNECTION = gql`
  mutation CreateBddTlmConnection($env_oid: bigint!, $bdd_con_oid: bigint!) {
    insert_console_bddtlmconnection_one(object: { env_oid: $env_oid, bdd_con_oid: $bdd_con_oid }) {
      con_oid
    }
  }
`;

export const CREATE_BDDX3S_CONNECTION = gql`
  mutation CreateBddX3sConnection($env_oid: bigint!, $bdd_con_oid: bigint!) {
    insert_console_bddx3sconnection_one(object: { env_oid: $env_oid, bdd_con_oid: $bdd_con_oid }) {
      con_oid
    }
  }
`;

export const CREATE_SABBPM_CONNECTION = gql`
mutation CreateBpmConnection($env_oid: bigint!, $language: String, $username: String, $password: String) {
    insert_console_bpmconnection_one(object: {env_oid: $env_oid, language: $language, username: $username, password: $password}) {
      con_oid
    }
}`;

export const CREATE_WAS_CONNECTION = gql`
mutation CreateWasConnection($env_oid: bigint!, $name: String!, $host: String!, $port: Int!, $security_enabled: Boolean, $username: String, $password: String, $key_store_type: String, $ssl_config_url: String, $soap_config_url: String, $sas_config_url: String, $truststore: String, $truststore_password: String, $keystore: String, $keystore_password: String) {
    insert_console_wasconnection_one(object: {
      env_oid: $env_oid, name: $name, host: $host, port: $port, security_enabled: $security_enabled, username: $username, password: $password, key_store_type: $key_store_type, ssl_config_url: $ssl_config_url, soap_config_url: $soap_config_url, sas_config_url: $sas_config_url, truststore: $truststore, truststore_password: $truststore_password, keystore: $keystore, keystore_password: $keystore_password
    }) {
      con_oid
    }
}`;

export const CREATE_SSH_CONNECTION = gql`
  mutation CreateSSHConnection($env_oid: bigint!, $auth_type: String!, $host: String!, $port: Int!, $username: String, $password: String, $private_key: String, $public_key: String, $passphrase: String) {
    insert_console_sshconnection_one(object: {env_oid: $env_oid, auth_type: $auth_type, host: $host, port: $port, username: $username, password: $password, private_key: $private_key, public_key: $public_key, passphrase: $passphrase}) {
      con_oid
    }
  }
`;

export const CREATE_SFTP_CONNECTION = gql`
  mutation CreateSFTPConnection($env_oid: bigint!, $ssh_con_oid: bigint!, $remote_directory: String!, $is_active: Boolean!) {
    insert_console_sftpconnection_one(object: {env_oid: $env_oid, ssh_con_oid: $ssh_con_oid, remote_directory: $remote_directory, is_active: $is_active}) {
      con_oid
    }
  }
`;

export const CREATE_INSTCONFIG = gql`
mutation CreateInstallationConfiguration($env_oid: bigint!, $install_type_default: String!, $integration_thread_number: Int!) {
    insert_console_installationconfiguration_one(object: {
      env_oid: $env_oid,
      install_type_default: $install_type_default,
      integration_thread_number: $integration_thread_number
    }) {
      instconfig_oid
    }
  }
`;

export const CREATE_APPPARAM = gql`
mutation CreateApplicationParameter($instconfig_oid: bigint!, $infra_type: String!, $thread_number: Int!, $config_files_dir: String!) {
    insert_console_applicationparameter_one(object: {
      instconfig_oid: $instconfig_oid,
      infra_type: $infra_type,
      thread_number: $thread_number,
      config_files_dir: $config_files_dir
    }) {
      appparam_oid
    }
  }
`;

export const CREATE_COMPONENT = gql`
mutation CreateComponent($appparam_oid: bigint!, $type: String!, $server_type: String!, $value: String!) {
    insert_console_component_one(object: {
      appparam_oid: $appparam_oid,
      type: $type,
      server_type: $server_type,
      value: $value
    }) {
      component_oid
    }
  }
`;

export const CREATE_REMOTE_CONNECTION_FEATURE = gql`
mutation CreateRemoteConnectionFeature($env_oid: bigint!, $ssh_con_oid: bigint!, $was_con_oid: bigint, $propagation: Boolean!, $installation: Boolean!, $dmgr: Boolean!, $instance_name: String!, $type: String!, $app_server: String!, $is_main: Boolean, $probe_application: String!) {
  insert_console_remoteconnectionfeatures_one(object: {
    env_oid: $env_oid, ssh_con_oid: $ssh_con_oid, was_con_oid: $was_con_oid, propagation: $propagation, installation: $installation, dmgr: $dmgr, instance_name: $instance_name, type: $type, app_server: $app_server, is_main: $is_main, probe_application: $probe_application
  }) {
    feature_oid
  }
}
`;

export const CREATE_WAS_APP_SERVER_CONFIG = gql`
mutation CreateWASAppServerConfig($feature_oid: bigint!, $was_con_oid: bigint!, $upload_mode_enabled: Boolean!, $was_cell: String!, $was_node: String!, $was_cluster: String!, $was_name: String!, $targets: String!) {
  insert_console_wasappserverconfig_one(object: {
    feature_oid: $feature_oid, was_con_oid: $was_con_oid, upload_mode_enabled: $upload_mode_enabled, was_cell: $was_cell, was_node: $was_node, was_cluster: $was_cluster, was_name: $was_name, targets: $targets
  }) {
    was_config_oid
  }
}
`;

export const CREATE_TOMCAT_APP_SERVER_CONFIG = gql`
mutation CreateTomcatAppServerConfig($feature_oid: bigint!, $server_name: String!, $port: Int!, $binary_location: String!, $portlets_location: String!) {
  insert_console_tomcatappserverconfig_one(object: {
    feature_oid: $feature_oid, server_name: $server_name, port: $port, binary_location: $binary_location, portlets_location: $portlets_location
  }) {
    tomcat_config_oid
  }
}
`;

// Update mutations 

export const UPDATE_ENVIRONMENT = gql`
  mutation UpdateEnvironment($env_oid: bigint!, $env_name: String!, $host_type: String!, $encryption_type: String!, $communication_type: String!) {
    update_console_environment_by_pk(pk_columns: {env_oid: $env_oid}, _set: {env_name: $env_name, host_type: $host_type, encryption_type: $encryption_type, communication_type: $communication_type}) {
      env_oid
      env_name
      host_type
      encryption_type
      communication_type
    }
  }
`;

export const UPDATE_SSH_CONNECTION = gql`
  mutation UpdateSSHConnection($con_oid: bigint!, $auth_type: String!, $host: String!, $port: Int!, $username: String, $password: String, $private_key: String, $public_key: String, $passphrase: String) {
    update_console_sshconnection_by_pk(pk_columns: { con_oid: $con_oid }, _set: {
      auth_type: $auth_type, host: $host, port: $port, username: $username, password: $password, private_key: $private_key, public_key: $public_key, passphrase: $passphrase
    }) {
      con_oid
      auth_type
      host
      port
      username
      password
      private_key
      public_key
      passphrase
    }
  }
`;

export const UPDATE_SFTP_CONNECTION = gql`
  mutation UpdateSFTPConnection($con_oid: bigint!, $ssh_con_oid: bigint!, $remote_directory: String!, $is_active: Boolean!) {
    update_console_sftpconnection_by_pk(pk_columns: { con_oid: $con_oid }, _set: {
      ssh_con_oid: $ssh_con_oid, remote_directory: $remote_directory, is_active: $is_active
    }) {
      con_oid
      ssh_con_oid
      remote_directory
      is_active
    }
  }
`;

export const UPDATE_BPM_CONNECTION = gql`
  mutation UpdateBpmConnection($con_oid: bigint!, $username: String!, $language: String!, $password: String!) {
    update_console_bpmconnection_by_pk(pk_columns: { con_oid: $con_oid }, _set: { username: $username, language: $language, password: $password }) {
      con_oid
    }
  }
`;

export const UPDATE_DATABASE_CONNECTION = gql`
  mutation UpdateDatabaseConnection($con_oid: bigint!, $type: String!, $free_entry: Boolean, $host: String!, $port: Int!, $username: String, $password: String, $url: String, $schema: String, $sid: String, $service: String, $secured: Boolean) {
    update_console_databaseconnection_by_pk(pk_columns: { con_oid: $con_oid }, _set: { type: $type, free_entry: $free_entry, host: $host, port: $port, username: $username, password: $password, url: $url, schema: $schema, sid: $sid, service: $service, secured: $secured }) {
      con_oid
    }
  }
`;

export const UPDATE_WAS_CONNECTION = gql`
  mutation UpdateWasConnection($con_oid: bigint!, $env_oid: bigint!, $name: String!, $host: String!, $port: Int!, $security_enabled: Boolean, $username: String, $password: String, $key_store_type: String, $ssl_config_url: String, $soap_config_url: String, $sas_config_url: String, $truststore: String, $truststore_password: String, $keystore: String, $keystore_password: String) {
    update_console_wasconnection_by_pk(pk_columns: { con_oid: $con_oid }, _set: { env_oid: $env_oid, name: $name, host: $host, port: $port, security_enabled: $security_enabled, username: $username, password: $password, key_store_type: $key_store_type, ssl_config_url: $ssl_config_url, soap_config_url: $soap_config_url, sas_config_url: $sas_config_url, truststore: $truststore, truststore_password: $truststore_password, keystore: $keystore, keystore_password: $keystore_password }) {
      con_oid
    }
  }
`;

export const UPDATE_SSH_PROBE_CONNECTION = gql`
  mutation UpdateSSHProbeConnection($con_oid: bigint!, $auth_type: String!, $host: String!, $port: Int!, $username: String, $password: String, $private_key: String, $public_key: String, $passphrase: String) {
    update_console_sshconnection_by_pk(pk_columns: { con_oid: $con_oid }, _set: { auth_type: $auth_type, host: $host, port: $port, username: $username, password: $password, private_key: $private_key, public_key: $public_key, passphrase: $passphrase }) {
      con_oid
    }
  }
`;

export const UPDATE_REMOTE_CONNECTION_FEATURE = gql`
  mutation UpdateRemoteConnectionFeature($feature_oid: bigint!, $was_con_oid: bigint, $ssh_con_oid: bigint!, $propagation: Boolean!, $installation: Boolean!, $dmgr: Boolean!, $instance_name: String!, $type: String!, $app_server: String!, $is_main: Boolean, $probe_application: String!) {
    update_console_remoteconnectionfeatures_by_pk(pk_columns: { feature_oid: $feature_oid }, _set: { was_con_oid: $was_con_oid, ssh_con_oid: $ssh_con_oid, propagation: $propagation, installation: $installation, dmgr: $dmgr, instance_name: $instance_name, type: $type, app_server: $app_server, is_main: $is_main, probe_application: $probe_application }) {
      feature_oid
    }
  }
`;

export const UPDATE_WAS_APP_SERVER_CONFIG = gql`
  mutation UpdateWASAppServerConfig($was_config_oid: bigint!, $upload_mode_enabled: Boolean!, $was_cell: String!, $was_node: String!, $was_cluster: String!, $was_name: String!, $targets: String!) {
    update_console_wasappserverconfig_by_pk(pk_columns: { was_config_oid: $was_config_oid }, _set: { upload_mode_enabled: $upload_mode_enabled, was_cell: $was_cell, was_node: $was_node, was_cluster: $was_cluster, was_name: $was_name, targets: $targets }) {
      was_config_oid
    }
  }
`;

export const UPDATE_TOMCAT_APP_SERVER_CONFIG = gql`
  mutation UpdateTomcatAppServerConfig($tomcat_config_oid: bigint!, $server_name: String!, $port: Int!, $binary_location: String!, $portlets_location: String!) {
    update_console_tomcatappserverconfig_by_pk(pk_columns: { tomcat_config_oid: $tomcat_config_oid }, _set: { server_name: $server_name, port: $port, binary_location: $binary_location, portlets_location: $portlets_location }) {
      tomcat_config_oid
    }
  }
`;

export const DELETE_SSH_CONNECTION = gql`
    mutation DeleteSSHConnection($con_oid: bigint!) {
        delete_console_sshconnection_by_pk(con_oid: $con_oid) {
            con_oid
        }
    }
`;

export const DELETE_WAS_CONNECTION = gql`
    mutation DeleteWASConnection($con_oid: bigint!) {
        delete_console_wasconnection_by_pk(con_oid: $con_oid) {
            con_oid
        }
    }
`;