<template>
  <div id="main-container">
    <label class="checkbox-label">
      <input
        type="checkbox"
        v-model="stateEnabled"
        @change="toggleState()"
        :true-value="true"
        :false-value="false"
      />
      PÅ/AV
    </label>
    <div v-if="stateEnabled">
      <fieldset>
        <legend>Visa</legend>
        <div v-for="category of state.thingsToHide" :key="category.categoryName">
          <div>
            <p>{{ category.categoryName }}</p>
            <template v-for="(group, index) of category.groups">
              <collapsible
                class="margin-bottom"
                v-if="group.options"
                :group.sync="group"
                :key="index"
              ></collapsible>
              <div v-else :key="index">
                <label :for="group.option.id" class="single-checkbox-label">
                  <input
                    :id="group.option.id"
                    type="checkbox"
                    :name="group.option.name"
                    v-model="group.option.hide"
                    :true-value="false"
                    :false-value="true"
                  />
                  {{ group.option.name }}
                </label>
              </div>
            </template>

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
          </div>
        </div>
      </fieldset>
      <fieldset v-for="(customCss, index) of state.customCss" :key="index">
        <legend>
          <!-- <label>
          <input type="checkbox" v-model="customCss.enabled" />-->
          {{ customCss.name }}
          <!-- </label> -->
        </legend>
        <!-- <label :for="customCss.id"> -->
        <input
          style="width: 100%"
          :list="customCss.id"
          v-model="customCss.value"
          type="range"
          :min="customCss.min"
          :max="customCss.max"
          step="1"
        />
        <datalist :id="customCss.id">
          <option>50</option>
          <option label="1X">100</option>
          <option>150</option>
          <option label="2X">200</option>
        </datalist>
        <!-- {{ customCss.value }}</label> -->
      </fieldset>
      <fieldset v-if="state.audienceSettings">
        <legend>Mottagare</legend>
        <label class="checkbox-label">
          <input type="checkbox" v-model="state.audienceSettings.replaceAudienceIconsWithText" />
          Visa mottagare med text istället för ikon
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="state.audienceSettings.highlightAudienceWhenPosting" />
          Belys mottagare när man skapar ny post
        </label>
      </fieldset>
    </div>
  </div>
</template>

<script>
import Collapsible from "./Collapsible.vue";
import messageUtils from "../../scripts/message-utils";
let backgroundPort;
export default {
  data() {
    return {
      state: {},
      stateEnabled: false
    };
  },
  watch: {
    state: {
      deep: true,
      handler: function() {
        if (this.stateEnabled) {
          this.sendMessageToBackground("stateUpdate", this.state);
        }
      }
    }
  },
  mounted() {
    console.log("mounted");

    const messageFromBgHandler = message => {
      console.log("msg received from background:", message);
      switch (message.type) {
        case "stateUpdate":
          try {
            console.log("state update received");
            this.state = message.payload;
          } catch (err) {
            console.error(err);
            return "stateUpdate failed somewhere in popup";
          }
          return "performed your stateUpdate. Thaaaanx!!!";
        default:
          console.log("unknown message type", message.type);
          return Promise.resolve("unknown message type");
          break;
      }
    };

    backgroundPort = browser.runtime.connect({ name: "port-from-menu" });
    backgroundPort.postMessageWithAck = messageUtils.postMessageWithAck;
    messageUtils.addMessageHandlerWithAckAsPromise(
      backgroundPort,
      messageFromBgHandler
    );
    this.sendMessageToBackground("stateEnabledRequest").then(response => {
      this.stateEnabled = response;
      if (this.stateEnabled) {
        this.sendMessageToBackground("stateRequest").then(response => {
          this.state = response;
        });
      }
    });
  },
  methods: {
    async toggleState() {
      await this.sendMessageToBackground("toggleState");
      if (this.stateEnabled) {
        this.sendMessageToBackground("stateRequest").then(response => {
          this.state = response;
        });
      }
    },
    async sendMessageToBackground(type, payload) {
      return backgroundPort.postMessageWithAck({
        type: type,
        payload: payload
      });
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

input[type="range"] {
  cursor: pointer;
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

.margin-bottom {
  margin-bottom: 0.5rem;
}

.single-checkbox-label {
  margin: 10px;
  display: block;
}

/* .single-checkbox-label:hover {
  background: #eee;
  cursor: pointer;
} */

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

.checkbox-label:hover,
.single-checkbox-label:hover {
  background: #eee;
  cursor: pointer;
}
</style>