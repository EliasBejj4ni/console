// src/lib/mutations.ts
import { gql } from '@apollo/client/core';

export const CREATE_ENVIRONMENT = gql`
    mutation CreateEnvironment($environmentName: String!) {
        insert_environment(objects: {environment_name: $environmentName}) {
            returning {
                id
                environment_name
            }
        }
    }
`;
export const DELETE_ENVIRONMENT = gql`
    mutation DeleteEnvironment($id: Int!) {
        delete_environment_by_pk(id: $id) {
            id
        }
    }
`;
export const UPDATE_ENVIRONMENT = gql`
    mutation UpdateEnvironment($id: Int!, $environmentName: String!) {
        update_environment_by_pk(pk_columns: {id: $id}, _set: {environment_name: $environmentName}) {
            id
            environment_name
        }
    }
`;
export const CREATE_ENVIRONMENT_INFO = gql`
mutation CreateEnvironmentInfo($environmentId: Int!, $name: String!, $context: String!, $blockInstallations: Boolean!, $probeName: String, $probeType: String, $probeAuthentication: String) {
    insert_environments_info(objects: {
        environment_id: $environmentId,
        name: $name,
        context: $context,
        block_installations: $blockInstallations,
        probe_name: $probeName,
        probe_type: $probeType,
        probe_authentication: $probeAuthentication
    }) {
        returning {
            id
            name
            context
            block_installations
            probe_name
            probe_type
            probe_authentication
            environment_id
        }
    }
}
`;

export const UPDATE_ENVIRONMENT_INFO = gql`
   mutation UpdateEnvironmentInfo($id: Int!, $name: String!, $context: String!, $blockInstallations: Boolean!, $probeName: String, $probeType: String, $probeAuthentication: String) {
    update_environments_info_by_pk(pk_columns: {id: $id}, _set: {
        name: $name,
        context: $context,
        block_installations: $blockInstallations,
        probe_name: $probeName,
        probe_type: $probeType,
        probe_authentication: $probeAuthentication
    }) {
        id
        name
        context
        block_installations
        probe_name
        probe_type
        probe_authentication
    }
}
`;

export const DELETE_ENVIRONMENT_AND_INFO = gql`
    mutation DeleteEnvironmentAndInfo($id: Int!) {
        delete_environments_info(where: { environment_id: { _eq: $id } }) {
            affected_rows
        }
        delete_environment_by_pk(id: $id) {
            id
        }
    }
`;
