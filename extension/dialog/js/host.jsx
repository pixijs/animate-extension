
// Publish the application
function publish() {
    fl.getDocumentDOM().publish();
}

// Get the document URI
function getParentURI() {
    var uri = fl.getDocumentDOM().pathURI;
    if (uri) {
        return basedir(uri); // get the directory
    }
    return null; // Document not saved yet
}

// Get the name of the document without the extension
function getDocumentName() {
    return fl.getDocumentDOM().name.replace(/\.[a-zA-Z]{3}$/, '');
}

// Browse for JS and return the platform path
function browseOutputFile() {
    var uri = fl.browseForFileURL('save','Publish to JavaScript','JS','js');
    if (uri) { 
        var file = uri.replace(/^.+\//, '');
        var path = relative(getParentURI(), basedir(uri));
        var relativePath = path ? path + "/" : "";
        return relativePath + file;
    }
    return null;
}

function basedir(uri) {
    return uri.substr(0, uri.lastIndexOf('/'));
}

// Display relative path
function relative(from, to) {
    from = from.replace(/^file\:\/\/\/?/, '');
    to = to.replace(/^file\:\/\/\/?/, '');

    var fromParts = trimArray(from.split('/'));
    var toParts = trimArray(to.split('/'));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
        }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
}


// returns an array with empty elements removed from either end of the input
// array or the original array if no elements need to be removed
function trimArray(arr) {
    var lastIndex = arr.length - 1;
    var start = 0;
    for (; start <= lastIndex; start++) {
        if (arr[start])
            break;
    }

    var end = lastIndex;
    for (; end >= 0; end--) {
        if (arr[end])
            break;
    }

    if (start === 0 && end === lastIndex)
        return arr;
    if (start > end)
        return [];
    return arr.slice(start, end + 1);
}