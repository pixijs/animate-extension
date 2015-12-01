#!/bin/bash

BUILD_TARGET=$1;
BUILD_SCHEME="";

# verify the command line args
if [ ${BUILD_TARGET} == "debug" ]; then
    BUILD_SCHEME="Debug";
elif [ ${BUILD_TARGET} == "release" ]; then
    BUILD_SCHEME="Release";
else
    echo "not a valid argument. please specify 'debug' or 'release'";
    exit 1;
fi

# build the xcode project to produce the plugin file
xcodebuild -project ../Plugin/SampleCreateJSPlugin/project/mac/SampleCreateJSPlugin.mp.xcodeproj -scheme SampleCreateJSPlugin.${BUILD_SCHEME} build

PLUGIN_FILE=../Plugin/SampleCreateJSPlugin/lib/mac/${BUILD_TARGET}/JiboPixiJSPlugin.fcm.plugin

# the plugin file needs to be placed in the eclipse project directory so it can be exported to a zxp
echo "Copy the plugin to the Eclipse Project directory";
rm -rf ../EclipseProject/ExtensionContent/plugin/lib/mac/JiboPixiJSPlugin.fcm.plugin
cp -r ${PLUGIN_FILE} ../EclipseProject/ExtensionContent/plugin/lib/mac/JiboPixiJSPlugin.fcm.plugin

# make sure the previous runs output has been cleared from the adobe flash extensions directory
echo "Deleting the previously created zxp file and the unpacked contents";
rm -rf /Library/Application\ Support/Adobe/CEP/extensions/JiboPixiJSPlugin/*

# create a staging folder and copy the /CSXS/manifest.xml file and the /ExtensionContent/ directory contents into it
# this step is recommended by the PACKAGING AND SIGNING ADOBE EXTENSIONS TECHNICAL NOTE document. (http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/creativesuite/pdfs/SigningTechNote_CC.pdf)
# note: this document is not hosted on the same website as the ZXPSignCmd tool (http://labs.adobe.com/downloads/extensionbuilder3.html)
echo "Setting up the staging folder for the ZXP file"
STAGING_FOLDER="../EclipseProject/PluginStagingDirectory"
rm -rf $STAGING_FOLDER
mkdir -p $STAGING_FOLDER

cp -R ../EclipseProject/.staged-extension/CSXS $STAGING_FOLDER/
cp -R ../EclipseProject/ExtensionContent/* $STAGING_FOLDER

# create the destination directory for where the plugin needs to be installed
rm -rf /Library/Application\ Support/Adobe/CEP/extensions/JiboPixiJSPlugin/*
mkdir -p /Library/Application\ Support/Adobe/CEP/extensions/JiboPixiJSPlugin

# create a zxp file in the adobe flash extensions directory from the previously created plugin
echo "Sign and create the ZXP file from the plugin";
./ZXPSignCmd -sign $STAGING_FOLDER /Library/Application\ Support/Adobe/CEP/extensions/JiboPixiJSPlugin/JiboPixiJSPlugin.zxp ../certificate.p12 password

# unpack the produced zxp file
tar -xzvf /Library/Application\ Support/Adobe/CEP/extensions/JiboPixiJSPlugin/JiboPixiJSPlugin.zxp -C /Library/Application\ Support/Adobe/CEP/extensions/JiboPixiJSPlugin

exit 0;
