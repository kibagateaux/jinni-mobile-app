import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HomeConfig } from 'types/UserConfig';
import { UpdateWidgetConfigParams } from 'types/api';
import {
    HOME_CONFIG_STORAGE_SLOT,
    defaultHomeConfig,
    getAppConfig,
    getStorage,
    saveStorage,
} from 'utils/config';
import { getSpellBook } from 'utils/zkpid';

// TODO persist cache to local storage for better offline use once internet connection lost?
// https://www.apollographql.com/docs/react/caching/advanced-topics#persisting-the-cache
let client: ApolloClient;
export const getGqlClient = () =>
    client
        ? client
        : (client = new ApolloClient({
              uri: `${getAppConfig().API_URL}/graphql`,
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
        console.log('api:qu:verification ', `'${cleaned}'`, '---', majikMsg);
        console.log('api:qu:qu/mu', !!query, !!mutation);

        // getGqlClient().mutate({
        //     ...baseRequest,
        //     //   fetchPolicy: 'cache-first', // TODO add useCache: boolean to switch between query vs readQuery?
        //     mutation: gql`${cleaned}`,
        // }).then((req) => console.log("sample qu res", req))
        // .catch((err) => console.log("sample qu err", err))

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
    mutation jinni_activate(
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
        )
    }
`;

export const MU_SET_WIDGET = `
    mutation jinni_set_widget(
        $verification: SignedRequest!,
        $settings: [WidgetSettingsInput]!
    ) {
        jinni_set_widget(
            verification: $verification, 
            $settings: [WidgetSettingsInput]!
        )
    }
`;

export const getHomeConfig = async (username?: string): Promise<HomeConfig> => {
    const customConfig = await getStorage<HomeConfig>(HOME_CONFIG_STORAGE_SLOT);
    // console.log("custom config ", customConfig)
    // can only login from app so all changes MUST be saved locally if they exist on db
    if (!isEmpty(customConfig)) return customConfig!;
    // if not logged in then no reason to fetch custom config
    if (!username) return defaultHomeConfig;
    // if no internet connection, return default config
    if (!(await getNetworkState()).isNoosphere) return defaultHomeConfig;

    return axios
        .get(`${getAppConfig().API_URL}/scry/${username}/home-config/`)
        .then((response) => {
            AsyncStorage.setItem(HOME_CONFIG_STORAGE_SLOT, JSON.stringify(response.data));
            // console.log("Home:config:get: SUCC", response)
            return response.data as HomeConfig;
        })
        .catch((error) => {
            console.error('Home:config:get: ERR ', error);
            return defaultHomeConfig;
        });
};

export const saveHomeConfig = async ({
    username,
    widgets,
}: UpdateWidgetConfigParams): Promise<boolean> => {
    const config = await getStorage<HomeConfig>(HOME_CONFIG_STORAGE_SLOT);
    // TODO not sure if merge works with nested structs e.g. array in obj here. Add more tests
    // save locally first
    const newHomeConfig = await saveStorage<HomeConfig>(
        HOME_CONFIG_STORAGE_SLOT,
        { widgets: [...(config?.widgets ?? []), ...widgets] },
        true,
        defaultHomeConfig,
    );

    if (!username) return true;
    console.log('new home config saved', newHomeConfig);

    qu<string>({ mutation: MU_SET_WIDGET })({
        widgets: widgets.map((s) => ({
            ...s,
            widget_id: s.id,
            config: { provider_id: s.config!.providerId },
        })),
    })
        .then((res) => {
            console.log('Modal:SelectMulti:Save:response', res);
        })
        .catch((err) => {
            console.log('Modal:SelectMulti:Save:ERR', err);
        });

    // TODO figure out how to stub NetworkState in testing so we can test api calls/logic paths properly
    // jest.mock('utils/config').mockResolvedValue(noConnection)
    // if (!(await getNetworkState()).isNoosphere) {
    //     return true;
    // }

    // return await qu<boolean>('TODO query on front+backend')({ config: newHomeConfig })
    return Promise.resolve(false);
};
