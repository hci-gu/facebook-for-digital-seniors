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
    <template v-for="customCss of state.customCss">
      <h1>{{ customCss.name }}</h1>
      <label>
        <input
          v-model="customCss.value"
          @input="onChange()"
          type="range"
          :min="customCss.min"
          :max="customCss.max"
          step="1"
        />{{ customCss.value }}</label
      >
    </template>
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