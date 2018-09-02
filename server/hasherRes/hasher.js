var output = document.getElementById('hasher-output');
output.innerText += 'Output:\n\n'

var btnRom, btnHashes, btnHeader;
var detailRom, detailHashes, detailGeader;


$(document).ready(function() {
    // $('#btn-hash').on('click', function(e) {
    //     var romFile = document.getElementById('file').files[0];
    //     console.log(romFile);
    //     // hasher.getFileBytes(romFile).then(rom => processRom(rom, romFile.name));
    //     processRom(romFile);
    // });
    btnRom = $('#btn-rom');
    btnHeader = $('#btn-header');
    btnHashes = $('#btn-hashes');
    detailRom = $('#detail-rom');
    detailHeader = $('#detail-header');
    detailHashes = $('#detail-hashes');
    btnCopy = $('#btn-copy');

    // tab selection
    btnRom.on('click', function() { selectDetailTab(btnRom, detailRom); });
    btnHashes.on('click', function() { selectDetailTab(btnHashes, detailHashes); });
    btnHeader.on('click', function() { selectDetailTab(btnHeader, detailHeader); });

    btnCopy.on('click', function(){
        copyText($('#result-box-content').text());
        btnCopy.blur();
    });



    var fileInputBox = $('#file-input-box');
    fileInputBox.on('drop', onFileDrop);
    fileInputBox.on('dragdrop', onFileDrop);
    fileInputBox.on('dragover', onDragOver);
    fileInputBox.on('dragenter', onDragOver);
    fileInputBox.on('dragend', onDragEnd);
    fileInputBox.on('dragleave', onDragEnd);

    $('#file-input').on('change', onFileSelected)
});

function selectDetailTab(tab, content) {
     setClass(btnRom, btnRom == tab, 'tab-item-select');
     setClass(btnHeader, btnHeader == tab, 'tab-item-select');
     setClass(btnHashes, btnHashes == tab, 'tab-item-select');

     setClass(detailRom, detailRom == content, 'detail-box-content-selected');
     setClass(detailHashes, detailHashes == content, 'detail-box-content-selected');
     setClass(detailHeader, detailHeader == content, 'detail-box-content-selected');
}

function copyText(text) {
    var textContainer = $('<textarea>').addClass('clipboard-container');
    $(document.body).append(textContainer);
    textContainer.val(text);
    textContainer.select();
    document.execCommand('copy');
    textContainer.remove();
}
function setClass(obj, state, className){
    if(state){
        obj.addClass(className);
    }else {
        obj.removeClass(className);
    }
}

var regNameLookup = {
    file: "File",
    rom: "ROM",
}

function processRom(file) { // fileContents, fileName) {
    hasher.getRomData(file, i=>console.log(i))
        .then(function (result) {
            output.innerText += JSON.stringify(result, null, 4);
            
            $('#result-box-content').text(createSummary(result));


            var table = $('<table>');
            var romData = getRomData(result);
            var hashData = result.hashes.map(function(hashItem) {
                return {
                    label: (regNameLookup[hashItem.region.name] || hashItem.region.name) + ' ' + hashItem.algoName.toUpperCase(),
                    value: hashItem.value
                };
            })


            var hashDataExt = result.extendedData.filter(whereCategoryEquals('hashes'));
            var headerDataExt = result.extendedData.filter(whereCategoryEquals('header'));
            var romDataExt = result.extendedData.filter(whereCategoryEquals('rom'));
            
            hashDataExt.forEach(function (item) { hashData.push(item) });
            romDataExt.forEach(function (item) { romData.push(item) });

            detailHashes.empty().append(extDataToTable(hashData));
            detailHeader.empty().append(extDataToTable(headerDataExt));
            detailRom.empty().append(extDataToTable(romData));
            
            $('#file-input-outer').addClass('file-loaded');
            $('#platform-icon').attr('src', 'hasherRes/' + result.platform.name + '.png')
            $('#game-name').text(file.name);
            
        })
        .catch(console.error);
}

/**
 * Gets an array of {label: string, category: "rom", value: string} objects
 * @param {RomData} romData 
 */
function getRomData(romData) {
    var result = [];

    var fileSize = romData.hashes.find(function (hash) { return hash.region.name === 'file' }).region.length;
    var romSize =  romData.hashes.find(function (hash) { return hash.region.name === 'rom' }).region.length;

    result.push({ label: "Platform", value: romData.platform.longName });
    result.push({ label: "Format", value: romData.format });
    result.push({ label: "External Header", value: romData.hasExternalHeader });
    result.push({ label: "File size", value: fileSize + ' ($' + fileSize.toString(16) + ")" });
    result.push({ label: "Rom size", value: romSize + ' ($' + romSize.toString(16) + ")" });

    return result;
}

function createSummary(romData) {
    var fileHash = romData.hashes.find(function(item) { return item.region.name === 'file' && item.algoName === 'sha1'; }).value;
    var romHash = romData.hashes.find(function(item) { return item.region.name === 'rom' && item.algoName === 'sha1'; }).value;
    
    var dbString = "No database match.";
    if(romData.dbInfo.name) {
        dbString = "Database: " + romData.dbInfo.name + " (v. " + romData.dbInfo.version + ")";
    }
    
    var outputString = "";
    if(fileHash === romHash) {
        outputString += "File/ROM SHA-1: " + fileHash + "\n";
    } else {
        outputString += "File SHA-1: " + fileHash + "\n";
        outputString += "ROM SHA-1: " + romHash + "\n";
    }

    outputString += "Database match: " + romData.dbMatch + "\n";
    outputString += dbString + "\n";

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

/** 
 * Returns a predicate function that matches objects with a category property that
 * matches the specified value.
 */
function whereCategoryEquals(category) {
    return function(item) {
        return item.category === category;
    }
}

function onFileSelected(e) {
    var fileInput = $('#file-input')[0]
    if(fileInput.files && fileInput.files.length > 0) {
        processRom(fileInput.files[0]);
    }
}

function onFileDrop(e) {
    var dragEvent = e.originalEvent;
    console.log('drop');
    $('#file-input-box').removeClass('file-input-filedrag');
    dragEvent.preventDefault();
    if (dragEvent.dataTransfer.items && dragEvent.dataTransfer.items.length > 0) {
        // for (var i = 0; i < dragEvent.dataTransfer.items.length; i++) {
        //     // If dropped items aren't files, reject them
        //     if (dragEvent.dataTransfer.items[i].kind === 'file') {
        //         var file = dragEvent.dataTransfer.items[i].getAsFile();
        //         console.log('... file[' + i + '].name = ' + file.name);
        //     }
        // }
        var file = dragEvent.dataTransfer.items[0].getAsFile();
        console.log(file);
        processRom(file);
    }

    // removeDragData(dragEvent);

}

function onDragOver(ev) {
    console.log('File(s) in drop zone');
    $('#file-input-box').addClass('file-input-filedrag');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

function onDragEnd(ev) {
    console.log('File(s) left drop zone');
    $('#file-input-box').removeClass('file-input-filedrag');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}
function removeDragData(ev) {
    console.log('Removing drag data')

    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to remove the drag data
        ev.dataTransfer.items.clear();
    } else {
        // Use DataTransfer interface to remove the drag data
        ev.dataTransfer.clearData();
    }
}
