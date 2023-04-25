let popupPort;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.from === 'content_script') {
    // 收到来自 content_script 的消息
    console.log('Received from content_script:', request.message);

    // 将消息发送到 popup，如果 popup 已打开
    if (popupPort) {
      popupPort.postMessage({ from: 'content_script', message: request.message });
    }
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    popupPort = port;

    // 监听 popup 的消息
    popupPort.onMessage.addListener((msg) => {
      console.log('Received from popup:', msg);

      // 向 content_script 发送消息
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { from: 'background', message: msg });
      });
    });

    // 当 popup 断开连接时清除 port
    popupPort.onDisconnect.addListener(() => {
      popupPort = null;
    });
  }
});
