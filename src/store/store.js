import { reactive, readonly } from "vue";
import { client } from "../boot/graphql";
import { pipe, subscribe } from "wonka";
import { gql } from "@urql/core";

class Store {
  constructor(inital) {
    this.state = reactive(inital);
  }

  getState() {
    return readonly(this.state);
  }

  async getQweets() {
    const QUERY = gql`
      {
        qweets {
          content
          date
          liked
          id
        }
      }
    `;
    const qweetState = {
      ids: [],
      all: new Map(),
      loaded: true,
    };
    const res = await client
      .query(QUERY, { requestPolicy: "network-only" })
      .toPromise();
    for (const qweet of res.data.qweets) {
      qweetState.ids.push(qweet.id);
      qweetState.all.set(qweet.id, qweet);
    }
    qweetState.loaded = false;
    this.state.qweets = qweetState;
  }

  async deleteQweet(id) {
    const res = await client
      .mutation(
        gql`
          mutation ($id: ID!) {
            deleteQweet(id: $id) {
              id
            }
          }
        `,
        { id }
      )
      .toPromise();
    //     this.state.qweets.all.delete(res.data.deleteQweet);
    //     this.state.qweets.ids = this.state.qweets.ids.filter((a) => a !== id);
  }

  async createQweet(content) {
    const res = await client
      .mutation(
        gql`
          mutation ($content: String, $date: Int) {
            createQweet(content: $content, date: $date) {
              id
              date
            }
          }
        `,
        { content, date: Date.now() }
      )
      .toPromise();
  }

  async toggledLiked(id) {
    const res = await client
      .mutation(
        gql`
          mutation ($id: ID!) {
            toggleLiked(id: $id) {
              id
            }
          }
        `,
        { id }
      )
      .toPromise();
  }

  addedQweets() {
    const newQweets = gql`
      subscription {
        qweetChange {
          id
          content
          date
          liked
          status
        }
      }
    `;
    const { _unsubscribe } = pipe(
      client.subscription(newQweets),
      subscribe((res) => {
        const { id, status, content, liked, date } = res.data.qweetChange;
        if (status === "del") {
          this.state.qweets.all.delete(id);
          this.state.qweets.ids = this.state.qweets.ids.filter((a) => a !== id);
        } else {
          const pos = this.state.qweets.ids.findIndex((v) => v === id);
          this.state.qweets.all.set(id, { date, content, id, liked, status });
          if (pos === -1) {
            this.state.qweets.ids = [id, ...this.state.qweets.ids];
          }
        }
      })
    );
  }
}

const store = new Store({
  qweets: {
    all: new Map(),
    ids: [],
    loaded: false,
  },
});

export function useStore() {
  return store;
}
