// src/lib/queries.ts
import { gql } from '@apollo/client/core';

export const GET_ENVIRONMENT = gql`
    query GetEnvironment {
        environment {
            id
            environment_name
        }
    }
`;

export const GET_ENVIRONMENTS_INFO = gql`
query GetEnvironmentsInfo {
    environments_info {
        id
        name
        context
        block_installations
        probe_name
        probe_type
        probe_authentication
        environment_id
        environment {
            id
            environment_name
        }
    }
}
`;

export const GET_ENVIRONMENT_INFO_BY_ID = gql`
    query GetEnvironmentInfoById($id: Int!) {
        environments_info(where: {environment_id: {_eq: $id}}) {
            id
            name
            context
            block_installations
            probe_name
            probe_type
            probe_authentication
            environment_id
            environment {
                id
                environment_name
            }
        }
    }
`;

