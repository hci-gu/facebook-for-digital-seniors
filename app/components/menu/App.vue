<template>
  <div>
    <div v-if="!debug" class="container">
      {{stateEnabled ? 'Stäng av Klara Facebook' : 'Aktivera Klara Facebook'}}
      <div class="button-container">
        <button @click="toggleState" v-bind:class="{ disabled: stateEnabled }">På</button>
        <button @click="toggleState" v-bind:class="{ disabled: !stateEnabled }">Av</button>
      </div>
      <div class="button-container">
        <button @click="redoIntro">Gör om introduktionen</button>
      </div>
      <div class="button-container"></div>
      <div class="button-container">
        <button @click="openWeb" class="secondary">Lär dig mer om vår forskning</button>
      </div>
      <a class="show-more" @click="toggleShowmore">
        Fler alternativ
      </a>
      <div v-if="showMore">
        <div class="button-container">
          <button @click="uninstall" class="secondary">Avinstallera</button>
        </div>
        <div class="button-container">
          <button @click="removeExtension" class="secondary">Hoppa av</button>
        </div>
        <div class="button-container" v-if="debug">
          <button @click="sendDebug" class="secondary">DEBUG</button>
        </div>
      </div>
      <img v-bind:src="'/images/gu_logo.png'" style="width: 90px; margin-top: 10px;">
    </div>
  </div>
</template>

<script>
import messageUtils from "../../scripts/message-utils"
let backgroundPort
export default {
  data() {
    return {
      stateEnabled: false,
      showMore: false,
      debug: false,
    }
  },
  mounted() {
    backgroundPort = browser.runtime.connect({ name: 'port-from-menu' })
    backgroundPort.postMessageWithAck = messageUtils.postMessageWithAck
    this.sendMessageToBackground('stateEnabledRequest').then((response) => {
      this.stateEnabled = response
    })
  },
  methods: {
    async toggleState () {
      await this.sendMessageToBackground('toggleState')
      this.sendMessageToBackground('stateEnabledRequest').then((response) => {
        this.stateEnabled = response
      })
    },
    redoIntro() {
      if (confirm('Genom att göra om introduktionen så kommer du förlora alla dina nuvarande inställningar.')) {
        this.sendMessageToBackground('redoIntro').then((response) => {
          this.state = response
          window.close()
        })
      }
    },
    toggleShowmore() {
      this.showMore = !this.showMore
    },
    sendDebug() {
      this.sendMessageToBackground('debug')
    },
    openWeb() {
      chrome.tabs.create({ url: 'http://digitalaseniorer.org' })
    },
    contact() {
      chrome.tabs.create({ url: 'http://www.digitalaseniorer.org/kontakt' })
    },
    uninstall() {
      if (confirm('Är du säker på att du vill avinstallera tillägget?')) {
        this.sendMessageToBackground('uninstall').then(() => {
          window.close()
        })
      }
    },
    removeExtension() {
      if (confirm('Är du säker på att du vill hoppa av studien? Insamlad data och dina svar från formuläret kommer tas bort. Vill du bara sluta använda tillägget kan du avinstallera det istället.')) {
        this.sendMessageToBackground('deleteUser').then(() => {
          window.close()
        })
      }
    },
    sendMessageToBackground(type, payload) {
      return backgroundPort.postMessageWithAck({
        type: type,
        payload: payload,
      })
    },
  },
};
</script>

<style>
  html {
    width: 21rem;
  }
  * {
    box-sizing: border-box;
  }
  .container {
    border-radius: 12px;
    width: 20rem;
    padding: 1rem;
    overflow: hidden;
    background-color: white;

    display: flex;
    flex-direction: column; 
    justify-content: center;
    align-items: center;
  }
  .button-container {
    width: 100%;
    margin: 0.5rem 0; 
    display: flex;
    justify-content: space-around;
  }
  button, .button {
    width: 100%;
    height: 35px;
    font: inherit;
    cursor: pointer;
    outline: inherit;
    transition: all 0.2s ease;

    border-radius: 3px;
    border: 2px solid #4469b0;
    background-color: #4469b0;
    font-size: 17px !important;
    color: #fff;
  }
  button:nth-child(2) {
    margin-left: 1rem;
  }
  button:hover {
    opacity: 0.9;
  }
  button:active {
    background-color: #324e83;
  }
  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  button.secondary{
    background-color: #fff;
    color: #4469b0;
  }
  button.secondary:active {
    background-color: #fff;
    border-color: #324e83;
    color: #324e83;
  }
  .show-more {
    font-size: 13px;
    margin-top: 10px;
    cursor: pointer;

    color: #324e83;
    text-decoration: underline;
  }
</style>