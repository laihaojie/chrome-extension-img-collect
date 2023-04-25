
window.onload = function () {
  // popup.js
  const backgroundPort = chrome.runtime.connect({ name: 'popup' });

  // 发送消息到 background (Service Worker)
  backgroundPort.postMessage('Hello from popup!');

  // 监听来自 background (Service Worker) 的消息
  backgroundPort.onMessage.addListener((msg) => {
    if (msg.from === 'content_script') {
      console.log('Received from content_script:', msg.message);
    }
  });

  
}