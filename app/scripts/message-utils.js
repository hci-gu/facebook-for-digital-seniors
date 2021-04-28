//This function adds ack functionality for us by letting the user provide a messageHandler that returns a promise. The resolved value gets sent as ack to the sender
const addMessageHandlerWithAckAsPromise = (port, messageHandler) => {
  let respond = (id, payload) => {
    port.postMessage({
      type: id,
      payload: payload,
    })
  }

  const listener = async message => {
    if (Number.isInteger(message.type)) {
      // console.log('received ack');
      return
    }
    let response = await messageHandler(message)
    if (message.responseId) {
      respond(message.responseId, response)
    }
  }

  port.onMessage.addListener(listener)
}

const postMessageWithAck = function(message) {
  const me = this
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      me.onMessage.removeListener(responseListener)
      reject(new Error('no answer from backgroundscript'))
    }, 1000)

    const responseId = Math.floor(Math.random() * 1000000)
    const responseListener = async response => {
      if (response.type == responseId) {
        clearTimeout(timer)
        me.onMessage.removeListener(responseListener)
        return resolve(response.payload)
      }
    }

    me.onMessage.addListener(responseListener)
    message['responseId'] = responseId
    me.postMessage(message)
  })
}

export default {
  addMessageHandlerWithAckAsPromise,
  postMessageWithAck,
  postMessage: message => {
    const port = chrome.runtime.connect({ name: 'port-from-menu' })
    port.postMessage(message)
  },
}
