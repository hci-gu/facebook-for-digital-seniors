<template>
  <div>
    <h1>DöljVisa:</h1>
    <label v-for="(item, index) of state.thingsToHide" :key="item.name">
      <input
        type="checkbox"
        :name="item.name"
        v-model="item.hide"
        :true-value="false"
        :false-value="true"
        @change="onChange()"
      />{{ item.name }}
    </label>
    <h1>Textstorlek</h1>
    <label
      ><input
        v-model="state.customCss[0].value"
        @input="onChange()"
        type="range"
        min="10"
        max="26"
        step="1"
      />{{ state.customCss[0].value }}</label
    >
  </div>
</template>

<script>
export default {
  data() {
    return {
      state: []
    };
  },
  watch: {},
  mounted() {
    console.log("mounted");
    let state = window.localStorage.getItem("state");
    if (state) {
      // TODO: error check the parsing
      this.state = JSON.parse(state);
    }
  },
  methods: {
    onChange() {
      this.sendMessage();
      this.storeState();
    },
    sendMessage() {
      console.log("skickar!!!");
      browser.tabs
        .query({ currentWindow: true, active: true })
        .then(tabs => {
          console.log(tabs);
          browser.tabs
            .sendMessage(tabs[0].id, this.state)
            .then(answer => console.log(answer))
            .catch(err => {
              console.error("sendMessage threw error:");
              console.error(err);
            });
        })
        .catch(err => {
          c;
          console.error(err);
        });
    },
    storeState() {
      console.log("storing state in localstorage");
      window.localStorage.setItem("state", JSON.stringify(this.state));
    }
  }
};
</script>

<style>
label {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 0 0 10px;
  display: block;
}

label:hover {
  background: #eee;
  cursor: pointer;
}
</style>