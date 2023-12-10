import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { getAppConfig } from './config';
import { getSpellBook } from './zkpid';

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

export const qu = (query: string) => async (variables: object) =>
    getGqlClient().query({
        // strip /n and /t to prevent weird error converting to byte array on server side on ecrecvoer
        query: gql`
            ${query.replace(/[\n\t]/g, ' ')}
        `,
        variables: {
            ...variables,
            verification: (await getSpellBook()).signMessage(query),
        },
        fetchPolicy: 'cache-first', // TODO add useCache: boolean to switch between query vs readQuery?
    });

export const mu = (mutation: string) => async (variables: object) =>
    getGqlClient().mutate({
        mutation: gql`
            ${mutation.replace(/[\n\t]/g, ' ')}
        `,
        variables: {
            ...variables,
            verification: (await getSpellBook()).signMessage(mutation),
        },

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

export const MU_SUBMIT_DATA = `
    mutation submit_data(
        $verification: SignedRequest!
        $data: [RawInputData]!
        $data_provider: DataProvider!
        $name: String!
    ) {
        submit_data(
            verification: $verification, 
            data: $data
            data_provider: $data_provider
            name: $name
        ) {
            ID
        }
    }
`;
