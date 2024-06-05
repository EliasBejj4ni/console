// src/lib/mutations.ts
import { gql } from '@apollo/client/core';
 
export const DELETE_ENV = gql`
mutation DELETE_ENVIRONMENT($env_oid: bigint!) {
    delete_console_environment_by_pk(env_oid: $env_oid) {
      env_oid
    }
  }
`;

export const CREATE_ENV = gql`
  mutation CreateEnvironment($env_name: String!, $host_type: String!) {
    insert_console_environment_one(object: {env_name: $env_name, host_type: $host_type}) {
      env_oid
      env_name
      host_type
    }
  }
`;

export const UPSERT_SSH_CONNECTION = gql`
  mutation UpsertSSHConnection(
    $con_oid: bigint,
    $env_oid: bigint!,
    $auth_type: String!,
    $host: String!,
    $port: Int!,
    $username: String!,
    $password: String,
    $private_key: String,
    $public_key: String,
    $passphrase: String
  ) {
    insert_console_sshconnection(objects: {
      con_oid: $con_oid,
      env_oid: $env_oid,
      auth_type: $auth_type,
      host: $host,
      port: $port,
      username: $username,
      password: $password,
      private_key: $private_key,
      public_key: $public_key,
      passphrase: $passphrase
    }, on_conflict: {
      constraint: sshconnection_pkey,
      update_columns: [
        auth_type,
        host,
        port,
        username,
        password,
        private_key,
        public_key,
        passphrase
      ]
    }) {
      returning {
        con_oid
        env_oid
      }
    }
  }
`;

export const UPSERT_SFTP_CONNECTION = gql`
  mutation UpsertSFTPConnection(
    $con_oid: bigint,
    $env_oid: bigint!,
    $ssh_con_oid: bigint!,
    $remote_directory: String!,
    $is_active: Boolean!
  ) {
    insert_console_sftpconnection(objects: {
      con_oid: $con_oid,
      env_oid: $env_oid,
      ssh_con_oid: $ssh_con_oid,
      remote_directory: $remote_directory,
      is_active: $is_active
    }, on_conflict: {
      constraint: sftpconnection_pkey,
      update_columns: [
        ssh_con_oid,
        remote_directory,
        is_active
      ]
    }) {
      returning {
        con_oid
        env_oid
      }
    }
  }
`;

export const UPSERT_BPM_CONNECTION = gql`
  mutation UpsertBPMConnection(
    $con_oid: bigint,
    $env_oid: bigint!,
    $username: String!,
    $password: String!,
    $language: String!
  ) {
    insert_console_bpmconnection(objects: {
      con_oid: $con_oid,
      env_oid: $env_oid,
      username: $username,
      password: $password,
      language: $language
    }, on_conflict: {
      constraint: bpmconnection_pkey,
      update_columns: [
        username,
        password,
        language
      ]
    }) {
      returning {
        con_oid
        env_oid
      }
    }
  }
`;

export const UPSERT_DATABASE_CONNECTION = gql`
  mutation UpsertDatabaseConnection(
    $con_oid: bigint,
    $env_oid: bigint!,
    $type: String!,
    $free_entry: Boolean,
    $host: String!,
    $port: Int!,
    $username: String,
    $password: String,
    $url: String,
    $schema: String,
    $sid: String,
    $service: String,
    $secured: Boolean
  ) {
    insert_console_databaseconnection(objects: {
      con_oid: $con_oid,
      env_oid: $env_oid,
      type: $type,
      free_entry: $free_entry,
      host: $host,
      port: $port,
      username: $username,
      password: $password,
      url: $url,
      schema: $schema,
      sid: $sid,
      service: $service,
      secured: $secured
    }, on_conflict: {
      constraint: databaseconnection_pkey,
      update_columns: [
        type,
        free_entry,
        host,
        port,
        username,
        password,
        url,
        schema,
        sid,
        service,
        secured
      ]
    }) {
      returning {
        con_oid
        env_oid
      }
    }
  }
`;

export const UPSERT_BDD_HOST_CONNECTION = gql`
  mutation UpsertBDDHostConnection($con_oid: bigint, $env_oid: bigint!, $bdd_con_oid: bigint!) {
    insert_console_bddhostconnection(objects: {
      con_oid: $con_oid,
      env_oid: $env_oid,
      bdd_con_oid: $bdd_con_oid
    }, on_conflict: {
      constraint: bddhostconnection_pkey,
      update_columns: [bdd_con_oid]
    }) {
      returning {
        con_oid
        env_oid
        bdd_con_oid
      }
    }
  }
`;

export const UPSERT_TELEMAINTENANCE_CONNECTION = gql`
  mutation UpsertTelemaintenanceConnection($con_oid: bigint, $env_oid: bigint!, $bdd_con_oid: bigint!) {
    insert_console_bddtlmconnection(objects: {
      con_oid: $con_oid,
      env_oid: $env_oid,
      bdd_con_oid: $bdd_con_oid
    }, on_conflict: {
      constraint: bddtlmconnection_pkey,
      update_columns: [bdd_con_oid]
    }) {
      returning {
        con_oid
        env_oid
        bdd_con_oid
      }
    }
  }
`;

export const UPSERT_X3S_CONNECTION = gql`
  mutation UpsertX3SConnection($con_oid: bigint, $env_oid: bigint!, $bdd_con_oid: bigint!) {
    insert_console_bddx3sconnection(objects: {
      con_oid: $con_oid,
      env_oid: $env_oid,
      bdd_con_oid: $bdd_con_oid
    }, on_conflict: {
      constraint: bddx3sconnection_pkey,
      update_columns: [bdd_con_oid]
    }) {
      returning {
        con_oid
        env_oid
        bdd_con_oid
      }
    }
  }
`;

export const UPSERT_WAS_CONNECTION = gql`
  mutation UpsertWASConnection(
    $con_oid: bigint,
    $env_oid: bigint!,
    $host: String!,
    $port: Int!,
    $security_enabled: Boolean!,
    $username: String!,
    $password: String!,
    $key_store_type: String!,
    $ssl_config_url: String!,
    $soap_config_url: String!,
    $sas_config_url: String!,
    $truststore: String!,
    $truststore_password: String!,
    $keystore: String!,
    $keystore_password: String!
  ) {
    insert_console_wasconnection(objects: {
      con_oid: $con_oid,
      env_oid: $env_oid,
      host: $host,
      port: $port,
      security_enabled: $security_enabled,
      username: $username,
      password: $password,
      key_store_type: $key_store_type,
      ssl_config_url: $ssl_config_url,
      soap_config_url: $soap_config_url,
      sas_config_url: $sas_config_url,
      truststore: $truststore,
      truststore_password: $truststore_password,
      keystore: $keystore,
      keystore_password: $keystore_password
    }, on_conflict: {
      constraint: wasconnection_pkey,
      update_columns: [
        host,
        port,
        security_enabled,
        username,
        password,
        key_store_type,
        ssl_config_url,
        soap_config_url,
        sas_config_url,
        truststore,
        truststore_password,
        keystore,
        keystore_password
      ]
    }) {
      returning {
        con_oid
        env_oid
      }
    }
  }
`;


// duplicate mutation

export const DUPLICATE_SSH_CONNECTION = gql`
  mutation DuplicateSSHConnection(
    $newEnvOid: bigint!,
    $passphrase: String,
    $password: String,
    $private_key: String,
    $public_key: String,
    $username: String!,
    $host: String!,
    $port: Int!,
    $auth_type: String!
  ) {
    insert_console_sshconnection_one(object: {
      env_oid: $newEnvOid,
      passphrase: $passphrase,
      password: $password,
      private_key: $private_key,
      public_key: $public_key,
      username: $username,
      host: $host,
      port: $port,
      auth_type: $auth_type
    }) {
      con_oid
    }
  }
`;

export const DUPLICATE_DATABASE_CONNECTION = gql`
  mutation DuplicateDatabaseConnection(
    $newEnvOid: bigint!,
    $type: String!,
    $free_entry: Boolean!,
    $host: String!,
    $port: Int!,
    $username: String!,
    $password: String!,
    $url: String,
    $schema: String,
    $sid: String,
    $service: String,
    $secured: Boolean
  ) {
    insert_console_databaseconnection_one(object: {
      env_oid: $newEnvOid,
      type: $type,
      free_entry: $free_entry,
      host: $host,
      port: $port,
      username: $username,
      password: $password,
      url: $url,
      schema: $schema,
      sid: $sid,
      service: $service,
      secured: $secured
    }) {
      con_oid
    }
  }
`;

export const DUPLICATE_SFTP_CONNECTION = gql`
  mutation DuplicateSFTPConnection(
    $newEnvOid: bigint!,
    $ssh_con_oid: bigint!,
    $remote_directory: String!,
    $is_active: Boolean!
  ) {
    insert_console_sftpconnection_one(object: {
      env_oid: $newEnvOid,
      ssh_con_oid: $ssh_con_oid,
      remote_directory: $remote_directory,
      is_active: $is_active
    }) {
      con_oid
    }
  }
`;

export const DUPLICATE_BDDTLM_CONNECTION = gql`
  mutation DuplicateBDDTLMConnection(
    $newEnvOid: bigint!,
    $bdd_con_oid: bigint!
  ) {
    insert_console_bddtlmconnection_one(object: {
      env_oid: $newEnvOid,
      bdd_con_oid: $bdd_con_oid
    }) {
      con_oid
    }
  }
`;

export const DUPLICATE_BDDHOST_CONNECTION = gql`
  mutation DuplicateBDDHostConnection(
    $newEnvOid: bigint!,
    $bdd_con_oid: bigint!
  ) {
    insert_console_bddhostconnection_one(object: {
      env_oid: $newEnvOid,
      bdd_con_oid: $bdd_con_oid
    }) {
      con_oid
    }
  }
`;

export const DUPLICATE_BDDX3S_CONNECTION = gql`
  mutation DuplicateBDDX3SConnection(
    $newEnvOid: bigint!,
    $bdd_con_oid: bigint!
  ) {
    insert_console_bddx3sconnection_one(object: {
      env_oid: $newEnvOid,
      bdd_con_oid: $bdd_con_oid
    }) {
      con_oid
    }
  }
`;

export const DUPLICATE_WAS_CONNECTION = gql`
  mutation DuplicateWASConnection(
    $newEnvOid: bigint!,
    $host: String!,
    $port: Int!,
    $security_enabled: Boolean!,
    $username: String!,
    $password: String!,
    $key_store_type: String!,
    $ssl_config_url: String!,
    $soap_config_url: String!,
    $sas_config_url: String!,
    $truststore: String!,
    $truststore_password: String!,
    $keystore: String!,
    $keystore_password: String!
  ) {
    insert_console_wasconnection_one(object: {
      env_oid: $newEnvOid,
      host: $host,
      port: $port,
      security_enabled: $security_enabled,
      username: $username,
      password: $password,
      key_store_type: $key_store_type,
      ssl_config_url: $ssl_config_url,
      soap_config_url: $soap_config_url,
      sas_config_url: $sas_config_url,
      truststore: $truststore,
      truststore_password: $truststore_password,
      keystore: $keystore,
      keystore_password: $keystore_password
    }) {
      con_oid
    }
  }
`;