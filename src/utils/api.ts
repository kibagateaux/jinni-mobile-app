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
              uri: `${getAppConfig().API_URL}` ?? 'http://localhost:8888/graphql',
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
export const cleanGql = (q: string) => q.replace(/[\n\t]/g, ' ').replace(/[\s]{2,}/g, ' ');
export const qu =
    <T>({ query, mutation }: GqlReq) =>
    async (variables: object): Promise<T> => {
        console.log('api:qu: ', getAppConfig().API_URL, query, mutation);
        if (!query && !mutation) throw Error('No query provided');
        const spellbook = await getSpellBook();
        if (!spellbook) throw Error('No spellbok to cast spells'); // @DEV shouldnt be possible but incase
        console.log('api:qu:PlayerId ', spellbook.address);

        const cleaned = query ? cleanGql(query) : cleanGql(mutation!);
        const majikMsg = await spellbook.signMessage(cleaned);
        const baseRequest = {
            variables: {
                ...variables,
                verification: {
                    _raw_query: cleaned,
                    signature: majikMsg,
                },
            },
        };
        console.log('api:qu:(player, vars)', spellbook.address, variables);
        console.log("api:qu:verification '", cleaned, "'", majikMsg);
        console.log('api:qu:client', getGqlClient());
        console.log('api:qu:qu/mu', !!query, !!mutation);
        // console.log("api:qu:req ", await getGqlClient().query({
        //     ...baseRequest,
        //   //   fetchPolicy: 'cache-first', // TODO add useCache: boolean to switch between query vs readQuery?
        //     query: gql`${cleaned}`,
        // }));
        return query
            ? getGqlClient().query({
                  ...baseRequest,
                  //   fetchPolicy: 'cache-first', // TODO add useCache: boolean to switch between query vs readQuery?
                  query: gql`
                      ${cleaned}
                  `,
              })
            : getGqlClient().mutate({
                  ...baseRequest,
                  //   optimisticResponse: true,
                  mutation: gql`
                      ${cleaned}
                  `,
              });
    };

export const MU_ACTIVATE_JINNI = `
    mutation(
        $verification: SignedRequest!,
        $majik_msg: String!,
        $player_id: String!
    ) {
        activate_jinni(
            verification: $verification, 
            majik_msg: $majik_msg, 
            player_id: $player_id
        )
    }
`;

export const MU_SUBMIT_DATA = `
    mutation(
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
        )
    }
`;
