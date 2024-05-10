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