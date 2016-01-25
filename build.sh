#!/bin/bash

BUILD_TARGET=$1;
BUILD_SCHEME="";

error(){
    echo -e "\033[31m \xe2\x98\x82  $1\033[0m";
}

log(){
    echo -e "\033[32m \xe2\x98\x80  $1\033[0m";
}

source build/properties.conf

# verify the command line args
if [ "${BUILD_TARGET}" = "debug" ]; then
    PLUGIN_TEMP_FILE=$PLUGIN_TEMP_DEBUG
    BUILD_SCHEME="Debug";
elif [ "${BUILD_TARGET}" = "release" ]; then
    PLUGIN_TEMP_FILE=$PLUGIN_TEMP_RELEASE
    BUILD_SCHEME="Release";
else
    echo ;
    error "Not a valid argument. Please specify 'debug' or 'release'";
    echo ;
    exit 1;
fi

echo ;

# build the xcode project to produce the plugin file
xcodebuild -project $XCODEPROJ -scheme PixiAnimateExtension.${BUILD_SCHEME} build > /dev/null

# the plugin file needs to be placed in the eclipse project directory so it can be exported to a zxp
log "Copy the plugin to the Eclipse Project directory";
rm -rf ${PLUGIN_FILE}
cp -r ${PLUGIN_TEMP_FILE} ${PLUGIN_FILE}

# make sure the previous runs output has been cleared from the adobe flash extensions directory
log "Deleting the previously created zxp file and the unpacked contents";
rm -rf $INSTALL_FOLDER/*

# create the destination directory for where the plugin needs to be installed
mkdir -p "${INSTALL_FOLDER}"

log "Setting up the staging folder for the ZXP file"
rm -rf $BUNDLE_ID
mkdir -p $BUNDLE_ID
cp -R $PROJECT_CONTENT/* $BUNDLE_ID

# create a zxp file in the adobe flash extensions directory from the previously created plugin
log "Sign and create the ZXP file from the plugin";
OUT=$($PACKAGER -sign $BUNDLE_ID $OUTPUT_FILE $PACKAGER_CERT $PACKAGER_PASS -tsa https://timestamp.geotrust.com/tsa)
log "${OUT}"

log "Installing the ZXP file";
cp $OUTPUT_FILE "${INSTALL_FOLDER}/${OUTPUT_NAME}"

# unpack the produced zxp file
tar -xzf "${INSTALL_FOLDER}/${OUTPUT_NAME}" -C "${INSTALL_FOLDER}"
rm -rf "${INSTALL_FOLDER}/${OUTPUT_NAME}"

log "Cleaning up the temporary staging folder"
rm -rf $BUNDLE_ID

echo ;
exit 0;