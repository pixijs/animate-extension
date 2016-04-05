/*global fl, FLfile */

/*eslint-disable no-unused-vars */

// Publish the application
function publish() {
    fl.getDocumentDOM().publish();
}

// Get the document URI
function getParentPath() {
    var path = fl.getDocumentDOM().path;
    if (path) {
        return path; // get the directory
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
        return FLfile.uriToPlatformPath(uri);
    }
    return null;
}

/*eslint-enable no-unused-vars */