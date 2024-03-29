// ==UserScript==
// @name         Who Blue - Tampermonkey edition
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Who Blue as a tampermonkey script, based on code from @wesbos
// @author       wesbos (https://twitter.com/wesbos), mdbell
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    //Proxy that lets you listen for changes to the page URL
    //Taken from: https://stackoverflow.com/a/64927639
    window.history.pushState = new Proxy(window.history.pushState, {
        apply: (target, thisArg, argArray) => {
            go();
            return target.apply(thisArg, argArray);
        },
    });
    go(); // run on the current page
})();

// The rest is from https://github.com/wesbos/who-blue/blob/main/scripts/content.js

const wait = (amount = 0) => new Promise(resolve => setTimeout(resolve, amount));

async function isBlue() {
    const checkmark = document.querySelector(`[aria-label*="verified accounts"]`);

    if (!checkmark) return false;

    // click it
    checkmark.click();
    // wait for a bit
    await wait(50);
    const blueText = Array.from(document.querySelectorAll('span')).find(span => span.innerText.includes('subscribed to Twitter Blue'));

    checkmark.click();

    if (blueText) return true;
    return false;
}

function markAsBlue() {
    const check = document.querySelector(`[aria-label*="verified accounts"] svg`);
    const otherCheck = document.querySelector(`svg[aria-label="Verified account"]`)

    if (!check) return;
    [check, otherCheck].filter(check => check.style).forEach(check => {
        check.style.rotate = `0.5turn`;
        check.style.fill = `#ee8383`;
    });
}

async function go() {
    await waitForTimeline();
    console.log('checking if blue')
    await wait(500);
    const isBlueCheck = await isBlue();
    if (isBlueCheck) {
        console.log('IS BLUE')
        markAsBlue();
    }
}

async function waitForTimeline() {
    return new Promise((resolve, reject) => {
        const interval = setInterval(function() {
            console.log('checking for timeline...');
            const timeline = document.querySelector(`[aria-label="Home timeline"]`);

            if(timeline){
                console.log('IT WORKED')
                clearInterval(interval);
                resolve();
            }
        }, 50);
    });
}
