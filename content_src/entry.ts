import {ReactBot} from "./ReactBot.js";

function load() {
    let reactBot = new ReactBot()
    document.body.appendChild(reactBot.wrapper)
}

if (document.readyState === 'loading') {
    console.log('test');
    document.addEventListener('DOMContentLoaded', load);
} else {
    console.log('test');
    load();
}
