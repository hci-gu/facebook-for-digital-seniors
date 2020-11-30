function match(pattern, url) {
  pattern = pattern.split('/')
  url = url.split('/')

  while (url.length) {
    const p = pattern.shift()
    if (p !== url.shift() && p !== '*') return false
  }
  return true
}

const changeBrowserAction = async tab => {
  if (
    match('https://www.facebook.com/*', tab.url) ||
    match('http://www.facebook.com/*', tab.url)
  ) {
    console.log('activated tab matched')
    setBrowserActionToPopup()
  } else {
    setBrowserActionToChangeTab()
    console.log("activated tab didn't match")
  }
}

const setBrowserActionToPopup = () => {
  browser.browserAction.setPopup({ popup: 'pages/menu.html' })
}

const setBrowserActionToChangeTab = () => {
  browser.browserAction.setPopup({ popup: '' })
}

browser.tabs.onActivated.addListener(async activeInfo => {
  const activatedTab = await browser.tabs.get(activeInfo.tabId)
  changeBrowserAction(activatedTab)
})
browser.tabs.onUpdated.addListener(async tabId => {
  const activatedTab = await browser.tabs.get(tabId)
  changeBrowserAction(activatedTab)
})
browser.windows.onFocusChanged.addListener(async () => {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true })
  if (tabs.length && tabs[0]) changeBrowserAction(tabs[0])
})

browser.browserAction.onClicked.addListener(async () => {
  let tabs = await browser.tabs.query({
    currentWindow: true,
    url: ['*://www.facebook.com/*', '*://www.facebook.se/*'],
  })

  if (tabs.length) {
    browser.tabs.highlight({
      tabs: [tabs[0].index],
    })
  } else {
    browser.tabs.create({
      url: 'https://www.facebook.com',
      active: true,
    })
  }
  setBrowserActionToPopup()
})

module.exports = {
  setBrowserActionToPopup,
  setBrowserActionToChangeTab,
}
