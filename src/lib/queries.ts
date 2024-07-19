// src/lib/queries.ts
import { gql } from '@apollo/client/core';

export const GET_ENV = gql`
    query GetEnvironment {
        console_environment {
            env_oid
            env_name
			      host_type,
            encryption_type,
            communication_type
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

export const GET_INSTALLATION_INFO = gql`
  query GetinstallationInfo($env_oid: bigint!) {
    console_installationconfiguration(where: { env_oid: { _eq: $env_oid } }) {
      env_oid
      install_type_default
      instconfig_oid
      integration_thread_number
      applicationparameters {
        appparam_oid
        config_files_dir
        infra_type
        instconfig_oid
        thread_number
        components {
          appparam_oid
          component_oid
          server_type
          type
          value
        }
      }
      environment {
        env_name
        host_type
      }
    }
  }
`;

export const GET_ENV_DETAILS = gql`
  query GetEnvironmentDetails($env_oid: bigint!) {
    console_environment_by_pk(env_oid: $env_oid) {
      env_oid
      env_name
      host_type
      encryption_type
      communication_type
      bddhostconnections {
        bdd_con_oid
        con_oid
        env_oid
      }
      bddtlmconnections {
        bdd_con_oid
        con_oid
        env_oid
      }
      bddx3sconnections {
        bdd_con_oid
        con_oid
        env_oid
      }
      wasconnections {
        con_oid
        env_oid
        host
        key_store_type
        keystore
        keystore_password
        name
        password
        port
        username
        truststore_password
        truststore
        ssl_config_url
        soap_config_url
        security_enabled
        sas_config_url
      }
      sshconnections {
        auth_type
        con_oid
        env_oid
        host
        passphrase
        password
        port
        private_key
        public_key
        username
      }
      sftpconnections {
        con_oid
        env_oid
        is_active
        remote_directory
        ssh_con_oid
      }
      installationconfiguration {
        env_oid
        install_type_default
        instconfig_oid
        integration_thread_number
      }
      databaseconnections {
        con_oid
        env_oid
        free_entry
        host
        password
        port
        schema
        secured
        service
        sid
        type
        url
        username
      }
      bpmconnections {
        con_oid
        env_oid
        language
        password
        username
      }
      remoteconnectionfeatures {
        app_server
        dmgr
        env_oid
        feature_oid
        installation
        instance_name
        is_main
        probe_application
        propagation
        ssh_con_oid
        type
        was_con_oid
        tomcatappserverconfigs {
          binary_location
          feature_oid
          port
          portlets_location
          server_name
          tomcat_config_oid
        }
        wasappserverconfigs {
          feature_oid
          targets
          upload_mode_enabled
          was_cell
          was_cluster
          was_con_oid
          was_config_oid
          was_name
          was_node
        }
      }
    }
  }
`;
