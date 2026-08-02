// Opens onboarding tab automatically on first install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" ) {
    chrome.tabs.create({
      url: chrome.runtime.getURL("tabs/onboarding.html"),
      active: true,
    })
  }
})

export {}