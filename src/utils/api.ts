import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import _, { isEmpty } from 'lodash';
import { HomeConfig } from 'types/UserConfig';
import { UpdateWidgetConfigParams } from 'types/api';
import {
    HOME_CONFIG_STORAGE_SLOT,
    ID_PLAYER_SLOT,
    defaultHomeConfig,
    getAppConfig,
    getNetworkState,
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

// java/clojure server has issues converting \n + \t to bytes and fucks with ecrecover verification
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
        jinni_activate(
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
        $widgets: [WidgetSettingInput]!
    ) {
        jinni_set_widget(
            verification: $verification, 
            widgets: $widgets
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

    return qu({ query: 'TODO' })({ player_id: await getStorage(ID_PLAYER_SLOT) })
        .then((response) => {
            if (response?.data) {
                saveHomeConfig({ widgets: response.data.widgets });
                // console.log("Home:config:get: SUCC", response)
                return response.data as HomeConfig;
            }
        })
        .catch((error) => {
            console.error('Home:config:get: ERR ', error);
            return defaultHomeConfig;
        });
};

export const saveHomeConfig = async ({
    widgets,
    merge,
}: UpdateWidgetConfigParams): Promise<HomeConfig> => {
    console.log('home config deduped 1!!!', merge, widgets);
    const config = await getStorage<HomeConfig>(HOME_CONFIG_STORAGE_SLOT);
    // merge new and existing widget configs. only one widget per id allowed (eventually uniq by id + target_uuid)
    // const deduped = _(config?.widgets ?? []) // start sequence
    //     .keyBy('id') // create map
    //     .merge(_.keyBy(widgets, 'id')) // create map of existing config and merge it to new configs
    //     .values() // merged map back to array
    //     .value()
    const merged = !merge
        ? widgets
        : [
              ...widgets,
              ...(config?.widgets.filter((w) => !_.find(widgets, { id: w.id })) ?? []), // dedupe widgets that are already in saved config
          ];

    console.log(
        'home config deduped 2!!!',
        merged,
        // deduped.find((w) => w.id === 'maliksmajik-avatar-viewer'),
    );
    // const deduped2 = _.uniqBy([...config?.widgets ?? [], ...widgets], '')

    const newConfig = await saveStorage<HomeConfig>(
        HOME_CONFIG_STORAGE_SLOT,
        { ...config, widgets: merged },
        merge,
        // defaultHomeConfig,
    );
    // TODO if merged === newConfig. Dont send API request

    console.log('!!! new home config saved!!!', newConfig);
    const playerId = await getStorage(ID_PLAYER_SLOT);
    console.log('utils:api:saveHomeConifg:playerId', playerId);
    if (!playerId) return newConfig!;

    // TODO figure out how to stub NetworkState in testing so we can test api calls/logic paths properly
    // jest.mock('utils/config').mockResolvedValue(noConnection)
    // if (!(await getNetworkState()).isNoosphere) {
    //     return true;
    // }

    return qu<string>({ mutation: MU_SET_WIDGET })({
        widgets: merged.map(({ id, provider, priority = 0, config }) => ({
            id,
            provider,
            priority,
            ...(config ?? {}),
        })),
    })
        .then((res) => {
            console.log('utils:api:saveHomeConfig:response', res);
            return newConfig!;
        })
        .catch((err) => {
            console.log('utils:api:saveHomeConfig:ERR', err);
            return newConfig!;
        });
};
