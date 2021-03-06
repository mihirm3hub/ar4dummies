/*
This is your site JavaScript code - you can add interactivity and carry out processing
- Initially the JS writes a message to the console, and moves a button you can add from the README
*/

// Print a message in the browser's dev tools console each time the page loads
// Use your menus or right-click / control-click and choose "Inspect" > "Console"
console.log("Hello ๐");

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
        const emojis = ['๐', '๐', '๐', '๐', '๐', '๐', '๐คฃ', '๐', '๐', '๐', '๐', '๐', '๐', '๐ฅฐ', '๐', '๐คฉ', '๐', '๐', '๐', '๐', '๐', '๐', '๐', '๐คช', '๐', '๐ค', '๐ค', '๐คญ', '๐คซ', '๐ค', '๐ค', '๐คจ', '๐', '๐', '๐ถ', '๐', '๐', '๐', '๐ฌ', '๐คฅ', '๐', '๐', '๐ช', '๐คค', '๐ด', '๐ท', '๐ค', '๐ค', '๐คข', '๐คฎ', '๐คง', '๐ฅต', '๐ฅถ', '๐ฅด', '๐ต', '๐คฏ', '๐ค ', '๐ฅณ', '๐', '๐ค', '๐ง', '๐', '๐', '๐', '๐ฎ', '๐ฏ', '๐ฒ', '๐ณ', '๐ฅบ', '๐ฆ', '๐ง', '๐จ', '๐ฐ', '๐ฅ', '๐ข', '๐ญ', '๐ฑ', '๐', '๐ฃ', '๐', '๐', '๐ฉ', '๐ซ', '๐ฅฑ', '๐ค', '๐ก', '๐ ', '๐คฌ', '๐', '๐ฟ', '๐']
        emoji.innerHTML = emojis[~~(Math.random() * emojis.length)];
    };
    setInterval(getRandomEmoji, 1000);
}
// This is a single line JS comment
/*
This is a comment that can span multiple lines 
- use comments to make your own notes!
*/
