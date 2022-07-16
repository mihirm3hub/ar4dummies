/*
This is your site JavaScript code - you can add interactivity and carry out processing
- Initially the JS writes a message to the console, and moves a button you can add from the README
*/

// Print a message in the browser's dev tools console each time the page loads
// Use your menus or right-click / control-click and choose "Inspect" > "Console"
console.log("Hello 🌎");
/* 
Make the "Click me!" button move when the visitor clicks it:
- First add the button to the page by following the "Next steps" in the README
*/
const btn = document.querySelector("#qrBtn"); // Get the button from the page
// Detect clicks on the button
if (btn) {
  btn.onclick = function () {
    console.log("clicked");
  };
}

const emoji = document.querySelector("#emoji");
if (emoji) {
  const getRandomEmoji = () => {
    const emojis = [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🤧",
      "🥵",
      "🥶",
      "🥴",
      "😵",
      "🤯",
      "🤠",
      "🥳",
      "😎",
      "🤓",
      "🧐",
      "😕",
      "😟",
      "🙁",
      "😮",
      "😯",
      "😲",
      "😳",
      "🥺",
      "😦",
      "😧",
      "😨",
      "😰",
      "😥",
      "😢",
      "😭",
      "😱",
      "😖",
      "😣",
      "😞",
      "😓",
      "😩",
      "😫",
      "🥱",
      "😤",
      "😡",
      "😠",
      "🤬",
      "😈",
      "👿",
      "💀",
    ];
    emoji.innerHTML = emojis[~~(Math.random() * emojis.length)];
  };
  setInterval(getRandomEmoji, 1000);
}
// This is a single line JS comment
/*
This is a comment that can span multiple lines 
- use comments to make your own notes!

    (function () {
        var script = document.createElement("script");
        script.onload = function () {
            var stats = new Stats();
            document.body.appendChild(stats.dom);
            requestAnimationFrame(function loop() {
                stats.update();
                requestAnimationFrame(loop);
            });
        };
        script.src = "//mrdoob.github.io/stats.js/build/stats.min.js";
        document.head.appendChild(script);
    })();*/

$(document).ready(function(){

  textAreaAdjust(document.getElementById('script-src') );
});

function textAreaAdjust(o) {
  o.style.height = "1px";
  o.style.height = (o.scrollHeight)+"px";
}

function copyCode(button) {
 // const button = this;
  console.log(button.parentElement)
  const pre = button.parentElement.querySelector('pre');
  let code = pre.querySelector("code");
  let text = code.innerText;
  navigator.clipboard.writeText(text);
}



