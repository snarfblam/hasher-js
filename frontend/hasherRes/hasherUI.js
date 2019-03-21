/*
    Hasher-js UI

    This file is *not* transpiled. It is written to work in browsers as-is, but
    may require a Promise polyfill.
*/

// @ts-check
"use strict";


///////////////////// Variables //////////////////////////////////////////////


// How do I declare a pre-existing global? (re: ts error checking)
var $ = $;
var Hasher = Hasher;

/** Contains a collection of jQuery objects for DOM elements */
var ui;

/** Set to true while a ROM is being processed */
var isHashing = false;

/** Length of time until the hashing modal will be shown, in milliseconds. */
var hashModalDelay = 250;

/** The Hasher object associated with the data currently being processed or displayed */
var hasher;

/** Lookup to for pretty casing of RomRegion names */
var regNameLookup = {
    file: "File",
    rom: "ROM",
};


///////////////////// Helper Functions ///////////////////////////////////////

/** Performs a jQuery call, but writes an error to the console if the selector
 *  does not match any elements on the page
 */
function $$(selector) {
    var result = $(selector);
    if (result.length == 0) console.error('bad selector', selector);
    return result;
}

/** Adds or removes one or more classes (space-separated) to a jQuery object
 *  based on the specified state.
 *  @param {*} obj jQuery object
 *  @param {boolean} state If true, the class(es) will be added, if false they'll be removed.
 *  @param {string} className Class(es) to add or remove
 */
function setClass(obj, state, className) {
    if (state) {
        obj.addClass(className);
    } else {
        obj.removeClass(className);
    }
}


///////////////////// Event Handlers /////////////////////////////////////////


/** Page initialization */
$(document).ready(function () {
    ui = {
        btnRom: $$('#btn-rom'),
        btnHeader: $$('#btn-header'),
        btnHashes: $$('#btn-hashes'),
        detailRom: $$('#detail-rom'),
        detailHeader: $$('#detail-header'),
        detailHashes: $$('#detail-hashes'),
        btnCopy: $$('#btn-copy'),
        fileInput: $$('#file-input'),
        fileInputBox: $$('#file-input-box'),
        abortHash: $$('#abort-hash'),
        chkSha1: $$('#chk-sha1'),
        file: {
            input: $$('#file-input'),
            inputBox: $$('#file-input-box'),
            inputBoxOuter: $$('#file-input-outer'),
            platformIcon: $$('#platform-icon'),
            gameName: $$('#game-name'),
        },
        progressBar: $$('#hash-progress'),
        progressBarMarker: $$('#hash-progress-marker'),
        outputSummary: $$('#result-box-content'),
        body: $$(document.body),
        output: document.getElementById('hasher-output'),
    };

    // tab selection
    ui.btnRom.on('click', function () { selectDetailTab(ui.btnRom, ui.detailRom); });
    ui.btnHashes.on('click', function () { selectDetailTab(ui.btnHashes, ui.detailHashes); });
    ui.btnHeader.on('click', function () { selectDetailTab(ui.btnHeader, ui.detailHeader); });
    ui.btnCopy.on('click', function () {
        copyText(ui.outputSummary.text());
        ui.btnCopy.blur();
    });

    // File drag and drop
    ui.fileInputBox.on('drop', onFileDrop);
    ui.fileInputBox.on('dragdrop', onFileDrop);
    ui.fileInputBox.on('dragover', onDragOver);
    ui.fileInputBox.on('dragenter', onDragOver);
    ui.fileInputBox.on('dragend', onDragEnd);
    ui.fileInputBox.on('dragleave', onDragEnd);

    // File dialog
    ui.fileInput.on('change', onFileSelected);

    // 'Cancel' button
    ui.abortHash.on('click', function (ev) { hasher.cancel(); });
});

/** Handles the selection of a file via the file dialog */
function onFileSelected(e) {
    var files = ui.file.input[0].files;
    if (files && files.length > 0) {
        processRom(files[0]);
    }
}

/** Handles file selection via drag and drop */
function onFileDrop(e) {
    ui.file.inputBox.removeClass('file-input-filedrag');

    var dragEvent = e.originalEvent;
    dragEvent.preventDefault();

    if (dragEvent.dataTransfer.items && dragEvent.dataTransfer.items.length > 0) {
        var file = dragEvent.dataTransfer.items[0].getAsFile();
        processRom(file);
    } else if (dragEvent.dataTransfer.files && dragEvent.dataTransfer.files.length > 0) {
        processRom(dragEvent.dataTransfer.files[0]);
    }
}

function onDragOver(ev) {
    ui.file.inputBox.addClass('file-input-filedrag');

    // Prevent default behavior (Prevent file from being downloaded/opened in browser)
    ev.preventDefault();
    ev.stopPropagation();
}

function onDragEnd(ev) {
    ui.file.inputBox.removeClass('file-input-filedrag');

    // Prevent default behavior (Prevent file from being downloaded/opened in browser)
    ev.preventDefault();
    ev.stopPropagation();
}


///////////////////// UI Manipulation ////////////////////////////////////////


/** Selects the specified tab and tab page
 *  @param {*} tab jQuery object representing the tab
 *  @param {*} content jQuery object representing the tab page
 */
function selectDetailTab(tab, content) {
    // Select specified tab
    setClass(ui.btnRom, ui.btnRom == tab, 'tab-item-select');
    setClass(ui.btnHeader, ui.btnHeader == tab, 'tab-item-select');
    setClass(ui.btnHashes, ui.btnHashes == tab, 'tab-item-select');

    // Select specified tab page
    setClass(ui.detailRom, ui.detailRom == content, 'detail-box-content-selected');
    setClass(ui.detailHashes, ui.detailHashes == content, 'detail-box-content-selected');
    setClass(ui.detailHeader, ui.detailHeader == content, 'detail-box-content-selected');
}

/** Copies the specified text to the clipboard
 *  @param {string} text 
 */
function copyText(text) {
    var textContainer = $('<textarea>').addClass('clipboard-container');
    ui.body.append(textContainer);
    textContainer.val(text);
    textContainer.select();
    document.execCommand('copy');
    textContainer.remove();
}

/** Prompts the display the hashing progress modal. */
function displayHashingModal() {
    // The modal does not actually become visible until after a short period so
    // that it does not quickly flash on and off the screen for small files.

    $(document.body).addClass('modal modal-kill');
    setTimeout(displayFullHashingModal, hashModalDelay);
}

/** Displays the hashing progress modal.
 *  Invoked after the 'grace period' by displayHashingModal. */
function displayFullHashingModal() {
    if (isHashing) {
        var randX = ~~(Math.random() * 80);
        var randY = ~~(Math.random() * 5);
        ui.progressBar.css({ backgroundPosition: randX * 6 + 'px ' + randY * 8 + 'px' });

        updateHashProgress(0);
        $(document.body).removeClass('modal-kill');
        $(document.body).addClass('modal modal-hashing');
    }
}

/** Hides the hashing progress modal */
function hideHashingModal() {
    $(document.body).removeClass('modal modal-kill modal-hashing');
}

/** Updates the hashing progress bar */
function updateHashProgress(amt) {
    var ticks = ~~(amt * 80); // ~~ truncate
    ui.progressBarMarker.css({ left: ticks * 6 + 'px' });
}


///////////////////// ROM Processing /////////////////////////////////////////


function processRom(file) {
    isHashing = true;
    displayHashingModal();

    var sha1Only = ui.chkSha1[0].checked;
    var algoList = sha1Only ? ['sha1'] : null;
    hasher = new Hasher(file);
    hasher.getRomData(algoList, updateHashProgress).then(function (result) {
        isHashing = false;
        hideHashingModal();
        ui.output.innerText += JSON.stringify(result, null, 4);
        ui.outputSummary.text(createSummary(result));

        // Grab random bits from RomData to show in the details panes
        var romDetails = getRomDetails(result);
        var hashDetails = result.hashes.map(function (hashItem) {
            return {
                label: (regNameLookup[hashItem.region.name] || hashItem.region.name) + ' ' + hashItem.algoName.toUpperCase(),
                value: hashItem.value
            };
        });

        // Grab additional 'extended data' to show in the detail panes
        var hashDataExt = result.extendedData.filter(whereCategoryEquals('hashes'));
        var headerDataExt = result.extendedData.filter(whereCategoryEquals('header'));
        var romDataExt = result.extendedData.filter(whereCategoryEquals('rom'));

        // Mash em together
        hashDataExt.forEach(function (item) { hashDetails.push(item); });
        romDataExt.forEach(function (item) { romDetails.push(item); });

        // Update detail panes
        ui.detailHashes.empty().append(extDataToTable(hashDetails));
        ui.detailHeader.empty().append(extDataToTable(headerDataExt));
        ui.detailRom.empty().append(extDataToTable(romDetails));

        // Update file box
        ui.file.inputBoxOuter.addClass('file-loaded');
        ui.file.platformIcon.attr('src', 'hasherRes/' + result.platform.name + '.png');
        ui.file.gameName.text(file.name);

    })
        .catch(console.error);
}

/** 
 * Returns a predicate function that matches objects with a category property that
 * matches the specified value.
 */
function whereCategoryEquals(category) {
    return function (item) {
        return item.category === category;
    };
}


/**
 * Gets an array of {label: string, category: "rom", value: string} objects
 * @param {*} romData 
 */
function getRomDetails(romData) {
    var result = [];

    var fileSize = romData.hashes.find(function (hash) { return hash.region.name === 'file'; }).region.length;
    var romSize = romData.hashes.find(function (hash) { return hash.region.name === 'rom'; }).region.length;

    result.push({ label: "Platform", value: romData.platform.longName });
    result.push({ label: "Format", value: romData.format });
    result.push({ label: "External Header", value: romData.hasExternalHeader });
    result.push({ label: "File size", value: fileSize + ' ($' + fileSize.toString(16) + ")" });
    result.push({ label: "Rom size", value: romSize + ' ($' + romSize.toString(16) + ")" });

    return result;
}

var getHash = function (region, algo) { return function (item) { return item.region.name === region && item.algoName === algo; }; };
var valOrNull = function (item) { return item ? item.value : null; };
var formatHash = function (name, value) { return value ? name + ": " + value + "\n" : ""; };

function createSummary(romData) {
    var fileHash = valOrNull(romData.hashes.find(getHash('file', 'sha1')));
    var romHash = valOrNull(romData.hashes.find(getHash('rom', 'sha1')));
    var fileHashCrc = valOrNull(romData.hashes.find(getHash('file', 'crc32')));
    var romHashCrc = valOrNull(romData.hashes.find(getHash('rom', 'crc32')));

    var dbString = "No database match.";
    var dbMatch = "";
    if (romData.dbInfo.name && romData.dbInfo.name !== 'not found') {
        dbString = "Database: " + romData.dbInfo.name + " (v. " + romData.dbInfo.version + ")\n";
        dbMatch = "Database match: " + romData.dbMatch + "\n";
    }

    var outputString = "";

    outputString += dbMatch; // "Database match: " + romData.dbMatch + "\n";
    outputString += dbString; // dbString + "\n";

    var sha1matches = fileHash === romHash;
    var crc32matches = fileHashCrc === romHashCrc;

    if (sha1matches) {
        outputString += formatHash("File/ROM SHA-1", fileHash);
    } else {
        outputString += formatHash("File SHA-1", fileHash);
    }
    if (crc32matches) {
        outputString += formatHash("File/ROM CRC32", fileHashCrc);
    } else {
        outputString += formatHash("File CRC32", fileHashCrc);
    }
    if (!sha1matches) {
        outputString += formatHash("ROM SHA-1", romHash);
    }
    if (!crc32matches) {
        outputString += formatHash("ROM CRC32", romHashCrc);
    }

    return outputString;
}


function extDataToTable(extData) {
    var table = $('<table>');
    extData.forEach(function (entry) {
        var value = entry.value;
        if (value === 'true' || value === true) value = "Yes";
        if (value === 'false' || value === false) value = "No";
        var row = $('<tr>');
        row.append($('<td>').text(entry.label));
        row.append($('<td>').text(value));
        table.append(row);
    });

    return table;
}