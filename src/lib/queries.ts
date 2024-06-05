// src/lib/queries.ts
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

export const GET_CONNECTIONS = gql`
  query GetEnvironmentWithSSH($env_oid: bigint!) {
    console_environment_by_pk(env_oid: $env_oid) {
      env_oid
      env_name
      host_type
      sshconnections {
        con_oid
        passphrase
        password
        private_key
        public_key
        username
        host
        port
        auth_type
      }
      databaseconnections {
        con_oid
        type
        free_entry
        host
        port
        username
        password
        url
        schema
        sid
        service
        secured
      }
      sftpconnections {
        con_oid
        ssh_con_oid
        remote_directory
        is_active
        env_oid
      }
      bddtlmconnections {
        con_oid
        bdd_con_oid
      }
      bddhostconnections {
        con_oid
        bdd_con_oid
      }
      bddx3sconnections {
        con_oid
        bdd_con_oid
        env_oid
      }
      bpmconnections {
        con_oid
        env_oid
        language
        password
        username
      }
      wasconnections {
        con_oid
        name
        host
        port
        security_enabled
        username
        password
        key_store_type
        ssl_config_url
        soap_config_url
        sas_config_url
        truststore
        truststore_password
        keystore
        keystore_password
        environment {
          creation_dt_hr
          dup_backup_oid
          last_modified_dt_hr
          latest_backup_dt_hr
          rest_backup_oid
        }
      }
    }
  }
`;