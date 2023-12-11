import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { getAppConfig } from 'utils/config';
import { getSpellBook } from 'utils/zkpid';
import { memoize } from 'lodash';

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

interface Query {
    query: string;
    mutation?: string;
}
interface Mutation {
    mutation: string;
    query?: string;
}
type GqlReq = Query | Mutation;
// server has issues converting \n + \t to bytes and fucks with ecrecover verification
const cleanGql = (q: string) => q.replace(/[\n\t]/g, ' ');
export const qu =
    <T>({ query, mutation }: GqlReq) =>
    async (variables: object): Promise<T> => {
        console.log('api:qu: ', getAppConfig().API_URL, query, mutation);
        if (!query && !mutation) throw Error('No query provided');
        const spellbook = await getSpellBook();
        if (!spellbook) throw Error('No spellbok to cast spells'); // @DEV shouldnt be possible but incase

        const cleaned = query ? cleanGql(query) : cleanGql(mutation!);
        console.log('api:qu: ', spellbook.address);
        return getGqlClient().query({
            ...(query
                ? {
                      query: gql`
                          ${cleaned}
                      `,
                  }
                : {
                      mutation: gql`
                          ${cleaned}
                      `,
                  }),
            variables: {
                ...variables,
                verification: {
                    _raw_query: cleaned,
                    signature: spellbook.signMessage(cleaned),
                },
            },
            fetchPolicy: 'cache-first', // TODO add useCache: boolean to switch between query vs readQuery?
            optimisticResponse: true,
        });
    };

export const QU_PROVIDER_ID = `
    mutation provider_id(
        $verification: SignedRequest!,
        $provider: String!,
        $playerId: String!
    ) {
        provider_id(
            verification: $verification, 
            provider: $provider,
            player_id: $playerId
        ) {
            provider_id
        }
    }
`;

export const MU_ACTIVATE_JINNI = `
    mutation activate_jinni(
        $verification: SignedRequest!,
        $majik_msg: String!,
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
        $verification: SignedRequest!,
        $data_provider: DataProvider!,
        $data: [RawInputData]!,
        $name: String!
    ) {
        submit_data(
            verification: $verification, 
            data_provider: $data_provider,
            data: $data,
            name: $name
        ) {
            ID
        }
    }
`;

// frequent helper functions + extra caching
/**
 * @description fetches the players id on integrations platform to use in abilities and widgets
 * @dev custom resolver func so cache based on values not object identity
 * @param playerId
 * @param provider
 * @returns id on provider or null
 */
export const getProviderId = (playerId: string) => (provider: string) =>
    memoize(qu<string | null>({ query: QU_PROVIDER_ID }), JSON.stringify)({ playerId, provider });
