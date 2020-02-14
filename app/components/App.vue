<template>
  <div id="main-container">
    <fieldset>
      <legend>Visa</legend>
      <div v-for="category of state.thingsToHide" :key="category.categoryName">
        <div>
          <p>{{ category.categoryName }}</p>
          <collapsible
            :group.sync="group"
            v-for="(group, index) of category.groups"
            :key="index"
          >
          </collapsible>

          <label
            v-for="option of category.options"
            :key="option.name"
            :for="option.id"
            class="checkbox-label"
          >
            <input
              :id="option.id"
              type="checkbox"
              :name="option.name"
              v-model="option.hide"
              :true-value="false"
              :false-value="true"
            />
            {{ option.name }}
          </label>
          <!-- {{ category.groups ? category.groups[0] : "" }} -->
        </div>
      </div>
    </fieldset>
    <fieldset v-for="(customCss, index) of state.customCss" :key="index">
      <legend>
        <label>
          <input type="checkbox" v-model="customCss.enabled" />
          {{ customCss.name }}</label
        >
      </legend>
      <label :for="customCss.id">
        <input
          :id="customCss.id"
          v-model="customCss.value"
          type="range"
          :min="customCss.min"
          :max="customCss.max"
          step="1"
        />
        {{ customCss.value }}</label
      >
    </fieldset>
    <fieldset v-if="state.audienceSettings">
      <legend>Mottagare</legend>
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="state.audienceSettings.replaceAudienceIconsWithText"
        />
        Visa mottagare med text istället för ikon
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="state.audienceSettings.highlightAudienceWhenPosting"
        />
        Belys mottagare när man skapar ny post
      </label>
    </fieldset>
  </div>
</template>

<script>
import Collapsible from "./Collapsible.vue";
export default {
  data() {
    return {
      state: []
    };
  },
  watch: {
    state: {
      deep: true,
      handler: function(newState, oldState) {
        this.sendStateUpdate();
        this.storeState();
      }
    }
  },
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
      this.sendStateUpdate();
      this.storeState();
    },
    sendStateUpdate() {
      console.log("skickar!!!");
      browser.tabs
        .query({ currentWindow: true, active: true })
        .then(tabs => {
          console.log(tabs);
          browser.tabs
            .sendMessage(tabs[0].id, {
              type: "stateUpdate",
              payload: this.state
            })
            .then(answer => console.log(answer))
            .catch(err => {
              console.error("sendStateUpdate threw error:");
              console.error(err);
            });
        })
        .catch(err => {
          console.error(err);
        });
    },
    storeState() {
      console.log("storing state in localstorage");
      window.localStorage.setItem("state", JSON.stringify(this.state));
    }
  },
  components: {
    Collapsible
  }
};
</script>

<style>
body {
  font-family: "Fira Sans", sans-serif;
  --x: 1.5rem;
  margin: var(--x) var(--x) var(--x) var(--x);

  --inner-border-property: 1px solid #ccc;
}

html {
  overflow-y: overlay; /* scrollbar jump fix */
}

#main-container {
  width: 20rem;
}

fieldset {
  border-style: solid;
  border-color: #333;
  /* padding-top: 0.6rem;
  padding-bottom: 0.6rem; */
  margin-bottom: 1rem;
}

fieldset p {
  margin-top: 0.2;
  margin-bottom: 0.1rem;
}

legend {
  padding: 0.1rem 0.3rem 0.1rem 0.3rem;
  background-color: #333;
  color: #fff;
  font-size: 0.9rem;
}

.checkbox-label {
  border: var(--inner-border-property);
  border-width: 0 0 1px;
  padding: 10px;
  /* margin: 0 0 10px; */
  display: block;
}

.checkbox-label[disabled]:hover,
.checkbox-label[disabled] {
  color: #888;
  background-color: unset;
}

.checkbox-label:last-of-type {
  border-bottom: none;
}

.checkbox-label:hover {
  background: #eee;
  cursor: pointer;
}
/* 
.collapsible-label {
  --collapsible-label-bg-color: #eee;
  border: var(--inner-border-property);
  background-color: var(--collapsible-label-bg-color);
  border-radius: 0.5rem;
  padding: 10px;
  margin: 0 0 0px;
  display: block;

  transition: border-radius 0.3s ease-in-out;
}

.collapsible-label::before {
  content: " ";
  display: inline-block;

  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 5px solid currentColor;

  vertical-align: middle;
  margin-right: 0.7rem;
  transform: translateY(-2px);

  transition: transform 0.2s ease-out;
}

.collapsible-checkbox:checked + .collapsible-label::before {
  transform: rotate(90deg) translateX(-3px);
}

.collapsible-checkbox:checked + .collapsible-label {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.collapsible-checkbox {
  display: none;
}

.collapsible-checkbox:not(:checked) + .collapsible-label + .collapsible {
  max-height: 0;

  border-color: white;
}

.collapsible {
  max-height: 20rem;
  overflow: hidden;
  border: var(--inner-border-property);
  border-width: 0 1px 1px;

  transition: max-height 0.7s ease-in-out, border-color 0.5s ease-in-out;
} */
</style>