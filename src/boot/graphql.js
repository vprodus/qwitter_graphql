import {
  subscriptionExchange,
  createClient,
  dedupExchange,
  fetchExchange,
} from "@urql/core";
import { offlineExchange } from "@urql/exchange-graphcache";
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage";
import urql from "@urql/vue";
import { Socket } from "phoenix";
import { make, pipe, toObservable } from "wonka";

const socket = new Socket("ws://localhost:4000/socket", {});

socket.connect();
const absintheChannel = socket.channel("__absinthe__:control");
absintheChannel.join();

export const absintheExchange = subscriptionExchange({
  forwardSubscription({ query, variables }) {
    let subscriptionChannel;
    const source = make((observer) => {
      const { next } = observer;

      absintheChannel.push("doc", { query, variables }).receive("ok", (v) => {
        const subscriptionId = v.subscriptionId;

        if (subscriptionId) {
          subscriptionChannel = socket.channel(subscriptionId);
          subscriptionChannel.on("subscription:data", (value) => {
            next(value.result);
          });
        }
      });

      return () => {
        subscriptionChannel?.leave();
      };
    });

    return pipe(source, toObservable);
  },
});

const cacheExchange = offlineExchange({
  storage: makeDefaultStorage({
    idbName: "qweeter",
  }),
});

export const client = createClient({
  url: "http://localhost:4000/api",
  exchanges: [dedupExchange, fetchExchange, cacheExchange, absintheExchange],
});

export default ({ app }) => {
  app.use(urql, client);
};
