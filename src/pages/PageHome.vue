<template>
  <suspense>
    <template #default>
      <home />
    </template>
    <template #fallback>
      <span>Loading...</span>
    </template>
  </suspense>
</template>

<script>
import { defineComponent } from "vue";
import Home from "../components/Home.vue";
export default defineComponent({
  name: "PageAbout",
  components: { Home },
});
</script>
