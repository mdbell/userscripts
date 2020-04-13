// ==UserScript==
// @name         NSLSC CSV Export
// @namespace    http://mdbell.me/
// @version      1.1
// @description  Exports your payments and interest charges into a format that YNAB likes!
// @author       mdbell
// @match        https://*.canada.ca/*loantransactionhistory.aspx
// @grant       GM.getValue
// @grant       GM.setValue
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @require https://raw.github.com/openexchangerates/accounting.js/master/accounting.min.js
// ==/UserScript==

var default_payee= "NSLSC";
var interest_memo= "Interest";
var payment_memo = "Payment";

var exportNew = $(`<a target="_blank" href="#">
<i class='fa fa-save' aria-hidden='true'></i> Export CSV (New)
</a>`).click(function(){return exportCSV(exportNew, false)});

var exportAll =$(`<a href="#">
<i class='fa fa-save' aria-hidden='true'></i> Export CSV (All)
</a>`).click(function(){return exportCSV(exportAll, true)});

var lastUpdateSpan = $(`<span style="padding-right: 1em;">Loading...</span>`);
var lastUpdate = new Date();

//add the elements
$("#ctl00_ContentMain_lnkPrintLstYY").before(exportNew).before(exportAll);
$(exportNew).before(lastUpdateSpan);

//load the saved exported date...
loadDate("last_update").then(updateExportDate);

function updateExportDate(date){
    lastUpdate = date;
    lastUpdateSpan.text("Last Export:" + date.toLocaleDateString() + " " + date.toLocaleTimeString());
    saveDate("last_update", lastUpdate);
}

function exportCSV(source, downloadAll){
    var csv = "data:text/csv;charset=utf-8,Date, Payee, Memo, Outflow, Inflow\n";
    var table = $("#tgrid > tbody > tr");
    var count = 0;
    table.each(function(index, row){
        var data = mapRow(row.cells);
        //skip rows with no balance/amount (the current interest charges, as well as the opening/closing balances)
        //also skip if the date is before our last update
        if(data.balance == 0 || data.amount == 0 || (!downloadAll && data.date < lastUpdate)){
            return;
        }
        count += 2;
        //add our payment
        csv += formatDate(data.date) + ',' + default_payee + ',' + payment_memo + ',,' + Math.abs(data.amount) + '\n';
        //add the interest charge
        csv += formatDate(data.date) + ',' + default_payee + ',' + interest_memo + ',' + Math.abs(data.interest) + ',\n';

    });
    if(count > 0){
        updateExportDate(new Date());
        $(source).attr("href", csv).attr("download", "loan_" + lastUpdate.getTime() + ".csv");
        return true;
    }else{
        alert("No new transactions!");
        return false;
    }
}

function saveDate(key, date){
    return GM.setValue(key, date.toISOString());
}

function loadDate(key, deflt=new Date()) {
    var defStr = deflt.toISOString();
    return GM.getValue(key, deflt.toISOString()).then(function(value){return new Date(value);});
}

function mapRow(cells){
    var res = {};
    //date
    res.date = getDate(cells[0].textContent);
    res.desc = formatStr(cells[1].textContent);
    res.amount = accounting.unformat(cells[2].textContent);
    res.interest = accounting.unformat(cells[3].textContent);
    res.principal = accounting.unformat(cells[4].textContent);
    res.balance = accounting.unformat(cells[5].textContent);
    return res;
}

//taken from: https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function getDate(str){
    return new Date(formatStr(str));
}

function formatStr(str){
    return str.replace('\n', '').trim();
}
