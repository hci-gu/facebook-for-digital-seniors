<template>
  <div id="main-container">
    <div v-if="state.simpleMode">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="stateEnabled"
          :true-value="true"
          :false-value="false"
        />
        PÅ/AV
      </label>
    </div>
    <div v-else>
      <fieldset>
        <legend>Visa</legend>
        <div
          v-for="category of state.thingsToHide"
          :key="category.categoryName"
        >
          <div>
            <p>{{ category.categoryName }}</p>
            <template v-for="(group, index) of category.groups">
              <collapsible
                class="margin-bottom"
                v-if="group.options"
                :group.sync="group"
                :key="index"
              >
              </collapsible>
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
          <input type="checkbox" v-model="customCss.enabled" /> -->
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
  </div>
</template>

<script>
import Collapsible from './Collapsible.vue';
export default {
  data() {
    return {
      state: {},
      stateEnabled: false
    };
  },
  watch: {
    stateEnabled: {
      handler: function() {
        this.sendMessageToBackground('toggleState').then(() => {
          this.sendMessageToBackground('stateRequest').then(response => {
            console.log('got state!!!', response);
            this.state = response;
          });
        });
      }
    }
  },
  mounted() {
    console.log('mounted');

    window.addEventListener('keydown', evt => {
      console.log('keydown: ', evt.key);
      if (!this.state) return;
      if (evt.key == 'b') {
        this.state.simpleMode = !this.state.simpleMode;
        this.state.globalToggle = true;
      }
    });

    // TODO: Have the contentscript do this automatically when started
    // this.sendMessageToPage("fetchLabelsRequest", null).then(response => {
    //   this.state = response;
    // });

    this.sendMessageToBackground('stateRequest').then(response => {
      console.log('got state!!!', response);
      this.state = response;
    });

    this.sendMessageToBackground('stateEnabledRequest').then(response => {
      this.stateEnabled = response;
      this.sendMessageToBackground();
    });

    browser.runtime.onMessage.addListener(message => {
      console.log('msg received from background:', message);
      switch (message.type) {
        case 'stateUpdate':
          try {
            console.log('state update received');
            this.state = message.payload;
          } catch (err) {
            console.error(err);
            return 'stateUpdate failed somewhere in popup';
          }
          return 'performed your stateUpdate. Thaaaanx!!!';
        default:
          console.log('unknown message type', message.type);
          return Promise.resolve('unknown message type');
          break;
      }
    });
  },
  methods: {
    sendStateUpdate(sendState) {
      this.sendMessageToPage('stateUpdate', sendState);
    },
    async sendMessageToPage(type, payload) {
      console.log('Sending to page: ', type, payload);
      return browser.tabs
        .query({ currentWindow: true, active: true })
        .then(tabs => {
          // console.log(tabs);
          return browser.tabs
            .sendMessage(tabs[0].id, {
              type: type,
              payload: payload
            })
            .then(answer => {
              console.log('answer from page: ', answer);
              return answer;
            })
            .catch(err => {
              console.error('sendStateUpdate threw error:');
              return Promise.reject(console.error(err));
            });
        })
        .catch(err => {
          console.error(err);
          return Promise.reject(err);
        });
    },
    async sendMessageToBackground(type, payload) {
      console.log('sending to background: ', type, payload);
      return browser.runtime.sendMessage({
        type: type,
        payload: payload
      });
      // try {
      //   let response = await browser.runtime.sendMessage({
      //     type: type,
      //     payload: payload
      //   });
      // } catch (err) {
      //   console.error(err);
      //   return Promis.reject("fuuuck you!!!");
      // }
      // if (response) {
      //   console.log("msg to background response: ", response);
      //   return response;
      // }
      // return Promis.reject("fuuuck you!!!");
    }
  },
  components: {
    Collapsible
  }
};
</script>

<style>
body {
  font-family: 'Fira Sans', sans-serif;
  --x: 1.5rem;
  margin: var(--x) var(--x) var(--x) var(--x);

  --inner-border-property: 1px solid #ccc;
}

html {
  overflow-y: overlay; /* scrollbar jump fix */
}

input[type='range'] {
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