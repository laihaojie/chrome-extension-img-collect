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
    padding: 2px 7px !important;
    background-color: red !important;
    border-radius: 10px !important;
    color: #fff !important;
    font-size: 12px !important;
  `)
  let itv = [];
  let img;
  let position;
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

          if (itv.length) {
            itv.forEach(clearTimeout)
          }

          // console.dir(img)
          position = getElementPosition(img)
          span.style.display = 'block';
          span.style.top = position.top + 8 + 'px';
          span.style.left = position.left + 80 + 'px';

          function mousemove(e) {
            // console.log('mousemove')
            const isOut = () => e.x < position.intRect.left || e.x > position.intRect.left + position.intRect.width || e.y < position.intRect.top || e.y > position.intRect.top + position.intRect.height;
            if (isOut()) {
              itv.push(setTimeout(() => {
                if (isOut()) {
                  span.style.display = 'none';
                  // console.log('hide')
                }

              }, 100))
              document.removeEventListener('mousemove', mousemove);
            }
          }
          document.addEventListener('mousemove', mousemove);
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

function getElementPosition(el) {
  // let top = 0
  // let left = 0
  // let element = el
  // while (element.offsetParent) {
  //   top += element.offsetTop
  //   left += element.offsetLeft
  //   element = element.offsetParent
  // }
  // return { top, left }



  let top = 0
  let left = 0
  const rect = el.getBoundingClientRect()
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
  top = rect.top + scrollTop
  left = rect.left + scrollLeft
  return { top, left, rect, intRect: rectToInt(rect) }

}

function rectToInt(rect) {
  return {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
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