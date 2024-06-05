// src/lib/apolloClient.ts
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from '@apollo/client/link/http';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

const httpLink = new HttpLink({
    uri: 'http://localhost:8080/v1/graphql',
});

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
});

    loadDevMessages();
    loadErrorMessages();


export default client;
