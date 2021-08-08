<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            class="new-qweet"
            bottom-slots
            v-model="newQweetContent"
            placeholder="What's happening?"
            counter
            maxlength="280"
            autogrow
          >
            <template v-slot:before>
              <q-avatar size="xl">
                <img src="https://cdn.quasar.dev/img/avatar5.jpg" />
              </q-avatar>
            </template>
          </q-input>
        </div>
        <div class="col col-shrink">
          <q-btn
            @click="addNewQweet"
            :disable="!newQweetContent"
            class="q-mb-lg"
            rounded
            color="primary"
            label="Qweet"
            no-caps
          />
        </div>
      </div>
      <!-- {{ data.qweets }} -->
      <q-separator class="divider" size="10px" color="grey-2" />
      <q-list separator>
        <transition-group
          appear
          enter-active-class="animated fadeIn slower"
          leave-active-class="animated fadeOut slower"
        >
          <q-item v-for="qweet in qweets" :key="qweet.date" class="q-py-md">
            <q-item-section avatar top>
              <q-avatar>
                <img src="https://cdn.quasar.dev/img/avatar5.jpg" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-subtitle1">
                <strong>Vadim</strong>
                <span class="text-grey-7">
                  @vprodus
                  <br class="lt-md" />
                  &bull; {{ relativeDate(qweet.date) }}
                </span>
              </q-item-label>
              <q-item-label class="qweet-content text-body1">
                {{ qweet.content }}
              </q-item-label>
              <div class="row justify-between q-mt-sm qweet-icons">
                <q-btn
                  flat
                  round
                  color="grey"
                  size="sm"
                  icon="far fa-comment"
                />
                <q-btn
                  flat
                  round
                  color="grey"
                  size="sm"
                  icon="fas fa-retweet"
                />
                <q-btn
                  flat
                  round
                  @click="toggledLiked(qweet.id)"
                  :color="qweet.liked ? 'pink' : 'grey'"
                  size="sm"
                  :icon="qweet.liked ? 'fas fa-heart' : 'far fa-heart'"
                />
                <q-btn
                  @click="deleteQweet(qweet.id)"
                  flat
                  round
                  color="grey"
                  size="sm"
                  icon="fas fa-trash"
                />
              </div>
            </q-item-section>
          </q-item>
        </transition-group>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { formatDistance } from "date-fns";
import { useStore } from "../store/store";

export default defineComponent({
  name: "PageHome",
  async setup() {
    const newQweetContent = ref("");
    const store = useStore();

    onMounted(() => store.addedQweets());

    if (!store.getState().qweets.loaded) {
      await store.getQweets();
    }

    const relativeDate = (value) =>
      formatDistance(value, new Date(), { addSuffix: true });

    const addNewQweet = async () => {
      await store.createQweet(newQweetContent.value);
      newQweetContent.value = "";
    };

    const deleteQweet = async (id) => {
      await store.deleteQweet(id);
    };

    const toggledLiked = async (id) => {
      await store.toggledLiked(id);
    };

    return {
      newQweetContent,
      relativeDate,
      addNewQweet,
      deleteQweet,
      toggledLiked,
      qweets: computed(() =>
        store.state.qweets.ids.reduce((acc, id) => {
          const theQweet = store.state.qweets.all.get(id);
          if (!theQweet) {
            throw Error("This post was not found");
          }
          return acc.concat(theQweet);
        }, [])
      ),
    };
  },
});
</script>
<style lang="sass">
.new-qweet
    textarea
      font-size: 19px
      line-height: 1.4 !important
.divider
    border-top: 1px solid
    border-bottom: 1px solid
    border-color: $grey-5
.qweet-content
    white-space: pre-line
.qweet-icons
    margin-left: -5px
</style>
