// ==UserScript==
// @name         GBHub
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Get that senior developer position boys.
// @author       mdbell
// @match        https://github.com/mdbell
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @require      https://raw.githubusercontent.com/mdbell/gameboy.js/master/dist/gameboy.min.js?1
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const GAME_WIDTH = 160;
    const GAME_HEIGHT = 144;
    waitForKeyElements (".js-calendar-graph-svg", node =>{
        let container = resize(node);
        //fix-ish the width
        let el = $('div.container-xl:nth-child(2)');
        el.addClass('container-x2');
        el.removeClass('container-xl')
        let file = $('<input>', {'id':'file', 'type': 'file'});
        node.after(file);
        //install the emulator
        var g = new GameboyJS.Gameboy(container.get(0));
    });

    function resize(node){
        //get the container
        let container = node.children('g').first();
        let rows = container.children('g');
        let origW = rows.length;
        let origH = 0;
        //correct the width
        do{
            let lastRow = rows.last();
            let newRow = lastRow.clone();
            //extract the x transaltion
            let xTran = lastRow.attr('transform').substr(10);
            xTran = Number(xTran.substr(0, xTran.indexOf(','))) + 14
            newRow.attr('transform', `translate(${xTran}, 0)`);
            lastRow.after(newRow)
            rows = container.children('g');
        }while(rows.length < GAME_WIDTH);

        //correct the height
        rows.each((i, node) => {
            let row = $(node)
            let rects = row.children('rect');
            if(rects.length > origH){
                origH = rects.length;
            }
            //reset data values
            rects.each((j, rect) => {
                rect.setAttribute('data-level', 3)
            })
            do{
                let lastRect = rects.last();
                let newRect = lastRect.clone();
                let y = Number(lastRect.attr('y')) + 13;
                newRect.attr('y', y);
                lastRect.after(newRect)
                rects = row.children('rect');
            }while(rects.length < GAME_HEIGHT);
        });
        let deltaW = GAME_WIDTH - origW;
        let deltaH = GAME_HEIGHT - origH;
        let width = Number(node.attr('width'))
        let height = Number(node.attr('height'))
        width += deltaW * 14;
        height += deltaH * 14;
        node.attr('width', width);
        node.attr('height', height);
        return container;
    }
})();
