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


function copyCode(button) {
 // const button = this;
  console.log(button.parentElement)
  const pre = button.parentElement.querySelector('pre');
  const copyText = button.parentElement.querySelector('#copy-text');
  let code = pre.querySelector("code");
  let text = code.innerText;
  navigator.clipboard.writeText(text).then(() => {
        // Alert the user that the action took place.
        // Nobody likes hidden stuff being done under the hood!
        copyText.innerHTML ="Copied"
         setTimeout(() => {
           copyText.innerHTML ="Copy"
         },500)
    });
}



//Get the button
var mybutton = document.getElementById("hoverBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}