import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import _, { isEmpty } from 'lodash';
import { HomeConfigMap } from 'types/UserConfig';
import { ApiResponse, HomeConfigResponse, UpdateWidgetConfigParams } from 'types/api';
import {
    HOME_CONFIG_STORAGE_SLOT,
    ID_JINNI_SLOT,
    PROOF_MALIKS_MAJIK_SLOT,
    getAppConfig,
    // getNetworkState,
    getStorage,
    itemAbilityToWidgetConfig,
    saveStorage,
} from 'utils/config';
import { getSpellBook } from 'utils/zkpid';
import { debug, track } from './logging';
import { JubJubSigResponse } from 'types/GameMechanics';
import { signWithId } from './zkpid';

// TODO persist cache to local storage for better offline use once internet connection lost?
// https://www.apollographql.com/docs/react/caching/advanced-topics#persisting-the-cache
const httpLink = createHttpLink({
    uri: `${getAppConfig().API_URL}/graphql`,
    credentials: 'omit', // Prevent cookies from being sent
});

let client: ApolloClient;
export const getGqlClient = () =>
    client
        ? client
        : (client = new ApolloClient({
              link: httpLink,
              //   uri: `${getAppConfig().API_URL}/graphql`,
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
    // TODO refactor typoes for ApiResponse + errors
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

        const response = query
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

        if (response.error) {
            debug(response.error, {
                user: { id: spellbook.address },
                tags: {
                    api: true,
                },
                extra: {
                    query,
                    mutation,
                    variables,
                },
            });

            throw Error(response.err);
        } else {
            return response;
        }
    };

export const QU_GET_PLAYER_CONFIG = `
    query get_home_config(
        $verification: SignedRequest!
        $player_id: String!
    ) {
        get_home_config(
            verification: $verification,
            player_id: $player_id
        ) {
            jinni_id
            jinni_type
            summoner
            last_divi_ts
            widgets {
                id
                priority
                provider
                provider_id
            }
        }
    }
`;

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
    mutation jinni_join_circle(
        $verification: SignedRequest!,
        $majik_msg: String!,
        $player_id: String!,
        $jinni_id: String
    ) {
        jinni_join_circle(
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

export const localSaveHomeConfig = async (jinniConfig: HomeConfigMap, merge = true) =>
    saveStorage<HomeConfigMap>(HOME_CONFIG_STORAGE_SLOT, jinniConfig, merge);

export const getHomeConfig = async (pid?: string, forceRefresh = false): Promise<HomeConfigMap> => {
    // if not logged in then no reason to fetch custom config

    // no local config and no internet to make request. return nil
    // TODO doesnt work on tests OR web yet
    // if (!(await getNetworkState()).isNoosphere) return {};

    console.log('getHomeConfig pid', pid);
    if (!pid) return {};

    const customConfig = await getStorage<HomeConfigMap>(HOME_CONFIG_STORAGE_SLOT);
    console.log('getHomeConfig local config', customConfig);
    // console.log("custom config ", customConfig)
    // can only login from app so all changes MUST be saved locally if they exist on db
    if (!forceRefresh && !isEmpty(customConfig)) return customConfig!;

    return qu<ApiResponse<{ get_home_config: HomeConfigResponse[] }>>({
        query: QU_GET_PLAYER_CONFIG,
    })({ player_id: pid })
        .then((response) => {
            console.log('Home:config:get: SUCC', response.data);
            if (response?.data?.get_home_config.length) {
                const jinniConfigs: HomeConfigMap = response.data.get_home_config.reduce(
                    (agg, j) => ({
                        ...agg,
                        [j.jinni_id]: {
                            summoner: j.summoner,
                            type: j.jinni_type,
                            widgets: j.widgets.map((w) =>
                                itemAbilityToWidgetConfig(w.provider, w.id),
                            ),
                        },
                    }),
                    {},
                );
                console.log('Home:config:get: SUCC', pid, response.data, jinniConfigs);

                return localSaveHomeConfig(jinniConfigs, false).then((config) => config);
            }

            return {}; // no player. return nil
        })
        .catch((error) => {
            console.log('Home:config:get: ERR ', error);
            return customConfig; // couldn't load. fallback to old default
        });
};

export const saveHomeConfig = async ({
    jinniId,
    widgets,
    merge,
    ...otherVals
}: UpdateWidgetConfigParams): Promise<HomeConfigMap> => {
    console.log('home config deduped 1!!!', merge, widgets);
    const config = await getStorage<HomeConfigMap>(HOME_CONFIG_STORAGE_SLOT);

    // TODO need better if branching if jid in config already to handle widget merge and initJinniConfig

    const mergedWidgets =
        !merge && widgets
            ? widgets
            : [
                  ...(widgets ?? []),
                  // remove any widgets in existing storage that are in new config list too
                  // dont have map of widgetId=>config bc might want multiple widgets of same ID e.g. spotify-share-playlist
                  ...(config?.[jinniId]?.widgets.filter((w) => !_.find(widgets, { id: w.id })) ??
                      []),
              ];

    console.log(
        'home config deduped 2!!!',
        mergedWidgets,
        // deduped.find((w) => w.id === 'maliksmajik-avatar-viewer'),
    );

    // remove UI display stuff for simplified API data requirements
    const finalWidgi = mergedWidgets.map(({ id, provider, priority = 5, config }) => ({
        id,
        provider,
        priority,
        ...(config ?? {}),
    }));

    const newConfig = (await localSaveHomeConfig(
        {
            [jinniId]: { ...(config?.[jinniId] ?? {}), widgets: mergedWidgets },
        },
        merge,
    ))!;
    // TODO if mergedWidgets === newConfig. Dont send API request

    console.log('!!! new home config saved!!!', newConfig);
    const playerId = (await getSpellBook()).address;
    console.log('utils:api:saveHomeConifg:playerId', playerId);
    if (!playerId) return newConfig; // should always exist now

    // TODO figure out how to stub NetworkState in testing so we can test api calls/logic paths properly
    // jest.mock('utils/config').mockResolvedValue(noConnection)
    // if (!(await getNetworkState()).isNoosphere) {
    //     return true;
    // }

    return qu<string>({ mutation: MU_SET_WIDGET })({
        jinni_id: jinniId,
        widgets: finalWidgi,
        ...otherVals,
    })
        .then((res) => {
            console.log('utils:api:saveHomeConfig:response', res);
            // TODO save uuids? would help with eventual constistency with local state. if no uuid on wiget then havent saved
            // distributed system principle: only ever pull. Never know if they updated through another UI. At ods with local first/self-hosted to an degree tho
            return newConfig!;
        })
        .catch((err) => {
            console.log('utils:api:saveHomeConfig:ERR', err);
            return config ?? {};
        });
};

export type SignatureValidityParams<T> = {
    signature: JubJubSigResponse;
    args: T;
};

export type JoinCircleValidityArgs = {
    msg: string; // the string sent directly to halo chip
    playerId: string;
    jinniId?: string;
};

export type SignatureValidityResponse = {
    isValid: boolean;
    message?: string; // success or error message for UI
};

export type SignatureValidityCheck<T> = (
    params: SignatureValidityParams<T>,
) => Promise<SignatureValidityResponse>;
export interface JoinParams {
    playerId: string;
    jinniId?: string;
}

export const getSummonMsg = (args: JoinParams) =>
    `summon:${args.jinniId ? `${args.jinniId}.` : ''}${args.playerId}`;

export const baseCircleValidity: SignatureValidityCheck<JoinCircleValidityArgs> = async (
    params,
) => {
    console.log('Inv:maliksmajik:join-circle:base validity check: ', params);
    if (!params.signature)
        return {
            isValid: false,
            message: 'No majik msg to cast spell',
        };

    if (!params.args.playerId) {
        return {
            isValid: false,
            message: 'No player to join circle',
        };
    }

    if (params.args.msg !== getSummonMsg(params.args)) {
        return {
            isValid: false,
            message: 'Invalid signed msg to join circle',
        };
    }

    return {
        isValid: true,
        message: 'basic check passed',
    };
};

// jinniId can be null because we can fetch from backend based on jubmoji ID
export const joinCircle =
    (userFlow: string, checkValidity?: SignatureValidityCheck<JoinCircleValidityArgs>) =>
    async ({ playerId, jinniId }: JoinParams): Promise<boolean> => {
        // final HoF return value
        console.log('utils:api:joinCircle:pid+jid params', playerId, jinniId);
        // TODO should have circle's jinni-id as param
        // rn hack it by having each summoner only have 1 circle and handle proof -> jinn mapping on backend
        try {
            track(userFlow, {
                spell: userFlow,
                activityType: 'initiated',
            });

            // const address = await getStorage<string>(ID_PLAYER_SLOT)

            if (!playerId) {
                throw new Error('No player ID to join circle');
            }

            // TODO signWithID(playerId + jinni-id)
            const messageToSign = getSummonMsg({ playerId, jinniId });
            const result = await signWithId(messageToSign);

            console.log('Inv:maliksmajik:join-circle:sig', messageToSign, result);

            if (!result) {
                track(userFlow, {
                    spell: userFlow,
                    jubmoji: result?.etherAddress,
                    signature: result?.signature?.ether,
                    messageToSign,
                    circle: jinniId,
                    activityType: 'circle-sig-failed',
                });
                return false;
            }

            const validityArgs: SignatureValidityParams<JoinCircleValidityArgs> = {
                signature: result,
                args: { msg: messageToSign, playerId, jinniId },
            };

            const baseCheck = await baseCircleValidity(validityArgs);
            if (!baseCheck.isValid) {
                track(userFlow, {
                    spell: userFlow,
                    jubmoji: result.etherAddress,
                    signature: result.signature.ether,
                    circle: jinniId,
                    messageToSign,
                    activityType: 'invalid-circle-validity',
                    error: baseCheck.message,
                });
                return false;
            }

            // customized per flow checks e.g. master djinn before saving to API
            if (checkValidity) {
                const { isValid, message: validityMsg } = await checkValidity(validityArgs);
                console.log('is valid custom check ', isValid, validityMsg);
                if (!isValid) {
                    track(userFlow, {
                        spell: userFlow,
                        jubmoji: result.etherAddress,
                        signature: result.signature.ether,
                        messageToSign,
                        circle: jinniId,
                        activityType: 'invalid-flow-validity',
                        error: validityMsg,
                    });
                    return false;
                }
            }

            // const circles = await getStorage<SummoningProofs>(PROOF_MALIKS_MAJIK_SLOT);
            // if (circles?.[result.etherAddress]) {
            //     track(userFlow, {
            //         spell: userFlow,
            //         signature: result.signature.ether,
            //         jubmoji: result.etherAddress,
            //         messageToSign,
            //         circle: jinniId,
            //         activityType: 'already-joined',
            //     });
            //     return false;
            // }

            // also used to create circle. If no circle for card that signs then generates with current player as the owner
            const response = await qu<ApiResponse<{ jinni_join_circle: string }>>({
                mutation: MU_JOIN_CIRCLE,
            })({
                majik_msg: result.signature.ether,
                player_id: playerId,
                jinni_id: jinniId, // TODO only null on create circle
            });

            console.log('maliksmajik:join-circle:res', response);

            if (!response || response?.error) {
                track(userFlow, {
                    spell: userFlow,
                    signature: result.signature.ether,
                    summoner: result.etherAddress,
                    circle: jinniId,
                    messageToSign,
                    activityType: 'api-error',
                    error: response?.error,
                });
                return false;
            }

            // save locally. for ux onboaring purposes, we can try again if api call fails
            await saveStorage(
                PROOF_MALIKS_MAJIK_SLOT,
                { [result.etherAddress]: result.signature },
                true,
            );

            const jid = response.data.jinni_join_circle;
            track(userFlow, {
                spell: userFlow,
                summoner: result.etherAddress,
                circle: jid,
                activityType: 'success',
            });

            return jid ? true : false;
        } catch (e) {
            console.log('Mani:Jinni:MysticCrypt:ERROR --', e);
            throw e;
        }
    };
