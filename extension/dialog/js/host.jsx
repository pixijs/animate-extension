
// Publish the application
function publish()
{
    fl.getDocumentDOM().publish();
}

// Browse for html and return the platform path
// to the file
function browseHTML()
{
    var uri = fl.browseForFileURL('save','Publish to HTML','HTML','html');
    if (uri)
    {
        return FLfile.uriToPlatformPath(uri);
    }
    return null;
}