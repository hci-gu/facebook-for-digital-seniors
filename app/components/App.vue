<template>
  <div id="main-container">
    <fieldset>
      <legend>Dölj/Visa</legend>
      <div v-for="(item, index) of state.thingsToHide" :key="item.name">
        <label :for="item.id" class="checkbox-label">
          <input
            :id="item.id"
            type="checkbox"
            :name="item.name"
            v-model="item.hide"
            :true-value="false"
            :false-value="true"
            @change="onChange()"
          />
          {{ item.name }}
        </label>
      </div>
    </fieldset>
    <fieldset v-for="customCss of state.customCss">
      <legend>
        <label>
          <input
            type="checkbox"
            v-model="customCss.enabled"
            @change="onChange()"
          />
          {{ customCss.name }}</label
        >
      </legend>
      <label :for="customCss.id">
        <input
          :id="customCss.id"
          v-model="customCss.value"
          @input="onChange()"
          type="range"
          :min="customCss.min"
          :max="customCss.max"
          step="1"
        />
        {{ customCss.value }}</label
      >
    </fieldset>
    <fieldset>
      <legend>Mottagera</legend>
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="state.audienceSettings.replaceAudienceIconsWithText"
          @change="onChange()"
        />
        Visa mottagare med text istället för ikon
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="state.audienceSettings.highlightAudienceWhenPosting"
          @change="onChange()"
        />
        Belys mottagare när man skapar ny post
      </label>
    </fieldset>
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
body {
  font-family: "Fira Sans", sans-serif;
}
#main-container {
  width: 20rem;
}
fieldset {
  border-style: solid;
  border-color: #333;
  margin-bottom: 1rem;
}
legend {
  padding: 0.1rem 0.3rem 0.1rem 0.3rem;
  background-color: #333;
  color: #fff;
  font-size: 0.9rem;
}
.checkbox-label {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 0 0 10px;
  display: block;
}

.checkbox-label:hover {
  background: #eee;
  cursor: pointer;
}
</style>