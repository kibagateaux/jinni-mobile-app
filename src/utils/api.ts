import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { getAppConfig } from 'utils/config';
import { getSpellBook } from 'utils/zkpid';

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
    query?: string;
    mutation?: string;
}
// server has issues converting \n + \t to bytes and fucks with ecrecover verification
const cleanGql = (q: string) => q.replace(/[\n\t]/g, ' ');
export const qu =
    <T>({ query, mutation }: Query) =>
    async (variables: object): Promise<T> => {
        if (!query && !mutation) throw Error('');
        const spellbook = await getSpellBook();
        if (!spellbook) throw Error('No spellbok to cast spells'); // @DEV shouldnt be possible but incase

        const cleaned = query ? cleanGql(query) : cleanGql(mutation!);
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
                    signature: (await getSpellBook()).signMessage(cleaned),
                },
            },
            fetchPolicy: 'cache-first', // TODO add useCache: boolean to switch between query vs readQuery?
            optimisticResponse: true,
        });
    };

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
