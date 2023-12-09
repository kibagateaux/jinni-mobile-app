import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { getAppConfig } from './config';

// TODO persist cache to local storage for better offline use once internet connection lost?
// https://www.apollographql.com/docs/react/caching/advanced-topics#persisting-the-cache

let client: ApolloClient;
export const getGqlClient = () =>
    client
        ? client
        : (client = new ApolloClient({
              uri: getAppConfig().API_URL ?? 'localhost:8888/graphql',
              cache: new InMemoryCache(),

              // optional metadata
              name: 'jinni-health-mobile-app',
              version: '0.0.1',
          }));

export const qu = (query: string) => (variables: object) =>
    getGqlClient().query({
        query: gql`
            ${query}
        `,
        variables,
        fetchPolicy: 'cache-first', // TODO add useCache: boolean to switch between query vs readQuery?
    });

export const mu = (mutation: string) => (variables: object) =>
    getGqlClient().mutate({
        mutation: gql`
            ${mutation}
        `,
        variables,

        optimisticResponse: true,
    });

export const MU_ACTIVATE_JINNI = `
    mutation activate_jinni(
        $verification: SignedRequest!
        $majik_msg: String!
        $player_id: String!
    ) {
        activate_jinni(
            verification: $verification, 
            majik_msg: $majik_msg, 
            player_id: $player_id
        ) {
            ID
        }
    }
`;
