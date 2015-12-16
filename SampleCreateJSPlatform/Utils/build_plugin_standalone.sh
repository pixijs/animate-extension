#!/bin/bash

BUILD_TARGET=$1;
OUTPUT_PATH=$2;

BUILD_SCHEME="";

# verify the command line args
if [ ${BUILD_TARGET} == "debug" ]; then
    BUILD_SCHEME="Debug";
elif [ ${BUILD_TARGET} == "release" ]; then
    BUILD_SCHEME="Release";
else
    echo "first parameter not a valid argument. please specify 'debug' or 'release'";
    exit 1;
fi

if [ ${OUTPUT_PATH} == "" ]; then
	echo "second parameter not a valid argument. please specify a path to create the plugin.";
fi

# build the xcode project to produce the plugin file
xcodebuild -project ../Plugin/SampleCreateJSPlugin/project/mac/SampleCreateJSPlugin.mp.xcodeproj -scheme SampleCreateJSPlugin.${BUILD_SCHEME} build

PLUGIN_FILE=../Plugin/SampleCreateJSPlugin/lib/mac/${BUILD_TARGET}/JiboPixiJSPlugin.fcm.plugin

# the plugin file needs to be placed in the eclipse project directory so it can be exported to a zxp
echo "Copy the plugin to output directory";
cp -r ${PLUGIN_FILE} ${OUTPUT_PATH}/JiboPixiJSPlugin.fcm.plugin
