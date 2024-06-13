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
  mutation CreateEnvironment($env_name: String!, $host_type: String!) {
    insert_console_environment_one(object: {env_name: $env_name, host_type: $host_type}) {
      env_oid
      env_name
    }
  }
`;

export const CREATE_DATABASE_CONNECTION = gql`
  mutation CreateDatabaseConnection($env_oid: bigint!, $type: String!, $host: String!, $port: Int!, $username: String, $password: String, $url: String, $schema: String, $sid: String, $service: String, $secured: Boolean) {
    insert_console_databaseconnection_one(object: {env_oid: $env_oid, type: $type, host: $host, port: $port, username: $username, password: $password, url: $url, schema: $schema, sid: $sid, service: $service, secured: $secured}) {
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