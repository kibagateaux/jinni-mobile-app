import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { getAppConfig } from './config';

export const gqlClient = new ApolloClient({
    uri: getAppConfig().API_URL ?? 'localhost:8888/graphql',
    cache: new InMemoryCache(),

    // optional metadata
    name: 'jinni-health-mobile-app',
    version: '0.0.1',
});

export const MU_ACTIVATE_JINNI = gql`
    mutation activate_jinni(
        $verification: SignedRequest!
        $majik_msg: String!
        $player_id: String!
    ) {
        activate_jinni(verification: $verification, majik_msg: $majik_msg, player_id: $player_id) {
            ID
        }
    }
`;
