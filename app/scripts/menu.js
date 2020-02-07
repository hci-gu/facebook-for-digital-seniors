console.log(`Gunnar är bäst`);

import Vue from "vue";
import App from "../components/App.vue";

new Vue({
  el: "#extension-menu",
  render: h => h(App)
});
