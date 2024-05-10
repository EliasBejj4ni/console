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
