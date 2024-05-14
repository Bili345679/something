// ==UserScript==
// @name         url提取
// @namespace    http://tampermonkey.net/
// @version      2024-05-14
// @description  try to take over the world!
// @author       You
// @match        https://jandan.net/qa/MjAyNDA1MTQtNg==#comments
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jandan.net
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @match        *://*/*
// ==/UserScript==

GM_addStyle(`
  .getUrlSpan {
    cursor: pointer;
    color: #55F;
  }

  .getUrlSpan:hover {
    color: #88F;
  }

  .getUrlSpan:active {
    color: #33A;
  }
`);
(function() {
    'use strict';
    // 按下ctrl或alt时，网页中匹配到的的url将高亮显示
    // 再点击url，会根据是按下ctrl还是alt做出如下操作
    //  ctrl    在新标签打开url
    //  alt     复制该url
    // 该脚本由 github 用户 Bili345679 与 GPT-4 在上班摸鱼时间共同开发完成
    // jquery 引用自 bootcdn(https://www.bootcdn.cn/)
    // 如果有bug或者修改建议，请在 issues(https://github.com/Bili345679/something/issues) 内提出

    let ctrlPressed = false;
    let altPressed = false;
    let elemSelect = "*:visible:not(textarea,input,img,video,canvas,button,a,script,style,iframe,select,option,svg)";
    let originalTexts = new Map();

    document.addEventListener('keydown', function (event) {
        if (event.ctrlKey && !ctrlPressed) {
            ctrlPressed = true;
            $(elemSelect).each(replaceUrls);
        }
        if (event.altKey && !altPressed) {
            altPressed = true;
            $(elemSelect).each(replaceUrls);
        }
    });

    document.addEventListener('keyup', function (event) {
        if (event.key === 'Control') {
            ctrlPressed = false;
            $(elemSelect).each(restoreText);
        }
        if (event.key === 'Alt') {
            altPressed = false;
            $(elemSelect).each(restoreText);
        }
    });

    function replaceUrls(index, element) {
        // 获取元素的文本
        let text = element.textContent;

        if (text != element.innerHTML) {
            return;
        }

        // 匹配URL
        let urls = findUrlsInText(text);

        // 如果找到URL，将其替换为span标签
        if (urls) {
            urls.forEach(function (url) {
                let span = `<span class="getUrlSpan" data-url="${url}">${url}</span>`;
                text = text.replace(url, span);
            });
            originalTexts.set(element, element.innerHTML);
            element.innerHTML = text;
        }
    }

    function restoreText(index, element) {
        if (originalTexts.has(element)) {
            element.innerHTML = originalTexts.get(element);
            originalTexts.delete(element);
        }
    }

    // 为document添加click事件监听器
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('getUrlSpan')) {
            if (ctrlPressed) {
                // 当前标签跳转
                // window.location.href = event.target.dataset.url;

                // 新标签跳转
                event.preventDefault();
                var url = event.target.getAttribute('data-url');
                window.open(url, '_blank');
            }
            if (altPressed) {
                GM_setClipboard(event.target.dataset.url);  // 使用油猴的复制模块
            }
        }
    });

    function findUrlsInText(text) {
        var urlRegex = /(https?:\/\/[\w\.\/]+)/g;
        return text.match(urlRegex);
    }

})();