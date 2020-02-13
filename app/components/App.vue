<template>
  <div id="main-container">
    <fieldset>
      <legend>Visa</legend>
      <div v-for="(item, index) of state.thingsToHide" :key="item.sectionName">
        <p>{{ item.sectionName }}</p>
        <!-- <label
          v-if="item.sectionOption != undefined"
          :for="item.sectionOption.id"
          class="checkbox-label"
        >
          <input
            :id="item.sectionOption.id"
            type="checkbox"
            :name="item.sectionOption.name"
            v-model="item.sectionOption.hide"
            :true-value="false"
            :false-value="true"
            @change="onChange()"
          />

          {{ item.sectionOption.name }}
        </label> -->
        <input
          :id="'collapse-checkbox-' + index"
          class="collapsible-checkbox"
          type="checkbox"
          checked
        />
        <label :for="'collapse-checkbox-' + index" class="collapsible-label" />
        <div class="collapsible">
          <div v-for="(item, index) of item.options" :key="item.name">
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
        </div>
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
    <fieldset v-if="state.audienceSettings">
      <legend>Mottagare</legend>
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
  padding-top: 0.6rem;
  padding-bottom: 0;
  margin-bottom: 1rem;
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

.checkbox-label:hover {
  background: #eee;
  cursor: pointer;
}

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

.collapsible-checkbox:checked + .collapsible-label + .collapsible {
  max-height: 20rem;
}

.collapsible {
  max-height: 0;
  overflow: hidden;
  border: var(--inner-border-property);
  border-width: 0 1px;

  transition: max-height 0.7s ease-in-out;
}
</style>