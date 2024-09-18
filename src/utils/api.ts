import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import _, { isEmpty } from 'lodash';
import { HomeConfig } from 'types/UserConfig';
import { ApiResponse, UpdateWidgetConfigParams } from 'types/api';
import {
    HOME_CONFIG_STORAGE_SLOT,
    ID_JINNI_SLOT,
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
        console.log('api:qu:qu/mu', !!query, !!mutation);
        console.log('api:qu:vars', variables);
        console.log('api:qu:verification ', `'${cleaned}'`, '---', majikMsg);

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

export const MU_WAITLIST_NPC = `
    mutation jinni_waitlist_npc(
        $verification: SignedRequest!
    ) {
        jinni_waitlist_npc(
            verification: $verification
        )
    }
`;

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

export const MU_JOIN_CIRCLE = `
    mutation join_circle(
        $verification: SignedRequest!,
        $majik_msg: String!,
        $player_id: String!,
        $jinni_id: String
    ) {
        join_circle(
            verification: $verification, 
            majik_msg: $majik_msg, 
            player_id: $player_id,
            jinni_id: $jinni_id
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
        $jinni_id: String!,
        $widgets: [WidgetSettingInput]!
    ) {
        jinni_set_widget(
            verification: $verification, 
            jinni_id: $jinni_id,
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

    const jid = await getStorage<string>(ID_JINNI_SLOT);
    if (!jid) defaultHomeConfig;

    return qu<HomeConfig>({ query: 'TODO' })({ jinni_id: jid })
        .then((response) => {
            // TODO standardize return format for API e.g. nested in all top level or { :data }?
            if (response?.widgets) {
                saveHomeConfig({ jinniId: jid!, widgets: response.widgets });
                // console.log("Home:config:get: SUCC", response)
                return response as HomeConfig;
            }

            return defaultHomeConfig;
        })
        .catch((error) => {
            console.error('Home:config:get: ERR ', error);
            return defaultHomeConfig;
        });
};

export const joinWaitlist = (): Promise<string | null> => {
    return qu<ApiResponse<{ jinni_waitlist_npc: string }>>({ mutation: MU_WAITLIST_NPC })({})
        .then((newJid) => {
            const parsedJid = newJid.data.jinni_waitlist_npc;
            if (newJid) return saveStorage<string>(ID_JINNI_SLOT, parsedJid);
            return null;
        })
        .catch((e) => {
            console.log('utils:api:joinWaitlist: Error', e);
            return null;
        });
};

export const saveHomeConfig = async ({
    jinniId,
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
        jinni_id: jinniId,
        widgets: merged.map(({ id, provider, priority = 5, config }) => ({
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
