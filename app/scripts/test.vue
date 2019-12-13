<template>
  <div>
    <h1>{{ msg }}</h1>
    <label v-for="(item, index) of controlledElements" :key="item.name">
      <input
        type="checkbox"
        :name="item.name"
        v-model="item.hide"
        :true-value="false"
        :false-value="true"
        @change="onChange()"
      />{{ item.name }}
    </label>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: "Dölj/Visa:",
      controlledElements: []
    };
  },
  watch: {},
  mounted() {
    console.log("mounted");
    let controlledElements = window.localStorage.getItem("controlledElements");
    if (controlledElements) {
      // TODO: error check the parsing
      this.controlledElements = JSON.parse(controlledElements);
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
            .sendMessage(tabs[0].id, {
              controlledElements: this.controlledElements
            })
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
      window.localStorage.setItem(
        "controlledElements",
        JSON.stringify(this.controlledElements)
      );
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