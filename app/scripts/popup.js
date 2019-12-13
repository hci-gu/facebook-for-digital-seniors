console.log(`'Gunnar är bäst`);

// import Vue from "vue/dist/vue.esm.js";

// new Vue({
//   el: "#extension-menu",
//   data: {
//     hideStories: false
//   }
// });

import Vue from "vue";
import test from "./test.vue";

new Vue({
  el: "#extension-menu",
  render: h => h(test)
});
