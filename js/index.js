window.addEventListener('load', function () {
  const span = document.createElement('span');
  span.innerText = '收藏';

  span.setAttribute('style', `
    position: absolute !important;
    z-index: 9999999999 !important;
    top: 0 !important;
    left: 0 !important;
    width: auto !important;
    opacity: 1 !important;  
    cursor: pointer !important;
    text-align: center !important;
    vertical-align: middle !important;
    display: none !important;
    user-select: none !important;
  `)
  let itv;
  let img;
  span.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    console.log(img.src)
    sendMessageToBackground('Hello from content_script!');
  });

  document.body.appendChild(span);

  // 监听页面dom更新，更新后执行回调函数
  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type == 'childList') {
        handelBindEvent(mutation.target, 'mouseover', 'img', function (e) {
          img = e.target;
          // 判断图片真实宽高
          if (img.width < 100 || img.height < 100 || img.naturalHeight < 100 || img.naturalWidth < 100) {
            return;
          }

          console.dir(img)
          span.style.display = 'block';
          span.style.top = img.y + 8 + 'px';
          span.style.left = img.x + 8 + 'px';


          if (itv) {
            clearTimeout(itv);
          }

          document.addEventListener('mousemove', function (e) {
            if (e.x < img.x || e.x > img.x + img.width || e.y < img.y || e.y > img.y + img.height) {
              itv = setTimeout(() => {
                span.style.display = 'none';
              }, 150);
              document.removeEventListener('mousemove', arguments.callee);
            } else {

            }
          });
        });
      }
    });
  }).observe(document.body, {
    childList: true,
    subtree: true,
  });

});


function handelBindEvent(target, type, selector, fn) {
  const imgs = target.querySelectorAll(selector);
  for (let i = 0; i < imgs.length; i++) {
    if (imgs[i].hasAttribute(`data-has-${type}-event`)) {
      continue;
    }
    imgs[i].setAttribute(`data-has-${type}-event`, true);
    imgs[i].addEventListener(type, fn);
  }
}

function sendMessageToBackground(msg) {
  chrome.runtime.sendMessage({ from: 'content_script', message: msg });
}


// 监听来自 background (Service Worker) 的消息
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.from === 'background') {
    console.log('Received from background:', msg.message);
  }
});