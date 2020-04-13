// ==UserScript==
// @name         NSLSC CSV Export
// @namespace    http://mdbell.me/
// @version      1.0
// @description  Exports your payments and interest charges into a format that YNAB likes!
// @author       You
// @match        https://*.canada.ca/*loantransactionhistory.aspx
// @grant        none
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @require https://raw.github.com/openexchangerates/accounting.js/master/accounting.min.js
// ==/UserScript==

var default_payee= "NSLSC";
var interest_memo= "Interest";
var payment_memo = "Payment";

var exportBtn = document.createElement("a");
exportBtn.href = "#";
exportBtn.innerHTML = "<i class='fa fa-save' aria-hidden='true'></i> Export To CSV (YNAB)";
exportBtn.target= "_blank";
exportBtn.download = "loan.csv";
exportBtn.onclick = exportCSV;

$("#ctl00_ContentMain_lnkPrintLstYY").before(exportBtn);

function exportCSV(){
    var csv = "data:text/csv;charset=utf-8,Date, Payee, Memo, Outflow, Inflow\n";
    var table = $("#tgrid > tbody > tr");
    table.each(function(index, row){
        var data = mapRow(row.cells);
        //skip rows with no balance/amount (the current interest charges, as well as the opening/closing balances)
        if(data.balance == 0 || data.amount == 0){
            return;
        }
        //add our payment
        csv += data.date + ',' + default_payee + ',' + payment_memo + ',,' + Math.abs(data.amount) + '\n';
        //add the interest charge
        csv += data.date + ',' + default_payee + ',' + interest_memo + ',' + Math.abs(data.interest) + ',\n';

    });
    exportBtn.href=csv;
    return true;
}
function mapRow(cells){
    var res = {};
    //date
    res.date = formatStr(cells[0].textContent);
    res.desc = formatStr(cells[1].textContent);
    res.amount = accounting.unformat(cells[2].textContent);
    res.interest = accounting.unformat(cells[3].textContent);
    res.principal = accounting.unformat(cells[4].textContent);
    res.balance = accounting.unformat(cells[5].textContent);
    return res;
}

function formatStr(str){
    return str.replace('\n', '').trim();
}