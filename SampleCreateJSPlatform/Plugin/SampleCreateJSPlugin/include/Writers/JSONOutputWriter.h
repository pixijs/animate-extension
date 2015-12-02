/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright [2013] Adobe Systems Incorporated
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

/**
 * @file  JSONOutputWriter.h
 *
 * @brief This writer produced an HTML file, a JSON file describing the Flash scene / animation timeline, and copies a series of 
 * JavaScript classes to be able to interpret the JSON animation file and play back the Flash scene.
 *
 */

#ifndef JSON_OUTPUT_WRITER_H_
#define JSON_OUTPUT_WRITER_H_

#include "Writers/OutputWriterBase.h"
#include "Utils.h"
#include <string>
#include <vector>
#include <map>

#define MAX_RETRY_ATTEMPT               10

/* -------------------------------------------------- Forward Decl */

class JSONNode;

/* -------------------------------------------------- Class Decl */

namespace JiboPixiJS
{
    class JSONOutputWriter : public OutputWriterBase
    {
    public:
        // Marks the begining of the Document
        virtual FCM::Result StartDocument(const DOM::Utils::COLOR& background,
                                  FCM::U_Int32 stageHeight,
                                  FCM::U_Int32 stageWidth,
                                  FCM::U_Int32 fps) override;

        // Marks the end of the Document
        virtual FCM::Result EndDocument() override;
        
        // Start a preview for the output content for this writer
        virtual FCM::Result StartPreview(const std::string& outFile, FCM::PIFCMCallback pCallback) override;
        
        // Stop a preview for the output content for this writer
        virtual FCM::Result StopPreview(const std::string& outFile) override;

        JSONOutputWriter(FCM::PIFCMCallback pCallback, bool minify, DataPrecision dataPrecision);
    };
};

#endif // OUTPUT_WRITER_H_
