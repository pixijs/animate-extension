/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright [2014] Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual 
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/


/*
 * PLUGIN DEVELOPERS MUST CHANGE VALUES OF ALL THE MACROS AND CONSTANTS IN THIS FILE 
 * IN ORDER TO AVOID ANY CLASH WITH OTHER PLUGINS.
 */


#ifndef _PLUGIN_CONFIGURATION_H_
#define _PLUGIN_CONFIGURATION_H_

#define PUBLISHER_NAME						"Jibo"
#define PUBLISHER_UNIVERSAL_NAME			"JiboPublisher"

/* The value of the PUBLISH_SETTINGS_UI_ID has to be the HTML extension ID used for Publish settings dialog*/
#define PUBLISH_SETTINGS_UI_ID				"JiboPixiJSPlugin.PublishSettings"

#define DOCTYPE_NAME						"JiboPixiJSPlugin"
#define DOCTYPE_UNIVERSAL_NAME				"JiboPixiJSPlugin"
#define DOCTYPE_DESCRIPTION					"This document can be used to author content for sample runtime"

/* The value of RUNTIME_FOLDER_NAME must be the name of the runtime folder present in EclipseProject/ExtensionContent. */
#define RUNTIME_FOLDER_NAME                 "SampleRuntime"

namespace CreateJS
{
    // {d30f8a0d-8234-44e1-9e30-ee48b415be9d}
    const FCM::FCMCLSID CLSID_DocType =
        {0xd30f8a0d, 0x8234, 0x44e1, {0x9e, 0x30, 0xee, 0x48, 0xb4, 0x15, 0xbe, 0x9d}};

    // {afeccca4-7b79-47e4-aa19-d5e646d47fbe}
    const FCM::FCMCLSID CLSID_FeatureMatrix =
        {0xafeccca4, 0x7b79, 0x47e4, {0xaa, 0x19, 0xd5, 0xe6, 0x46, 0xd4, 0x7f, 0xbe}};

	    // {8f6f8054-505f-472a-b602-f78cfc350563}
    const FCM::FCMCLSID CLSID_Publisher =
        {0x8f6f8054, 0x505f, 0x472a, {0xb6, 0x02, 0xf7, 0x8c, 0xfc, 0x35, 0x05, 0x63}};

    // {c19ef743-6c1a-4076-9ab2-d486a94f0393}
    const FCM::FCMCLSID CLSID_ResourcePalette =
        {0xc19ef743, 0x6c1a, 0x4076, {0x9a, 0xb2, 0xd4, 0x86, 0xa9, 0x4f, 0x03, 0x93}};

    // {95c69e19-de0f-4c8e-8388-e7d4d8db98c0}
    const FCM::FCMCLSID CLSID_TimelineBuilder =
        {0x95c69e19, 0xde0f, 0x4c8e, {0x83, 0x88, 0xe7, 0xd4, 0xd8, 0xdb, 0x98, 0xc0}};

    // {e31e2a88-f57e-4106-87dc-511623b10fb8}
    const FCM::FCMCLSID CLSID_TimelineBuilderFactory =
        {0xe31e2a88, 0xf57e, 0x4106, {0x87, 0xdc, 0x51, 0x16, 0x23, 0xb1, 0x0f, 0xb8}};
}


#endif // _PLUGIN_CONFIGURATION_H_