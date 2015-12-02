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
 * @file  OutputWriter.h
 *
 * @brief This file contains declarations for a output writer.
 */

#ifndef ELECTRON_OUTPUT_WRITER_H_
#define ELECTRON_OUTPUT_WRITER_H_

#include "OutputWriterBase.h"
#include "Utils.h"
#include <string>
#include <vector>
#include <map>

/* -------------------------------------------------- Forward Decl */

class JSONNode;

/* -------------------------------------------------- Class Decl */

namespace JiboPixiJS
{
    class ElectronOutputWriter : public OutputWriterBase
    {
    public:
        // Marks the begining of the output
        virtual FCM::Result StartOutput(std::string& outputFileName) override;
        
        // Marks the begining of the Document
        virtual FCM::Result StartDocument(const DOM::Utils::COLOR& background,
                                  FCM::U_Int32 stageHeight,
                                  FCM::U_Int32 stageWidth,
                                  FCM::U_Int32 fps) override;
        
        // Marks the end of the Document
        virtual FCM::Result EndDocument() override;

        virtual FCM::Result PostPublishStep(const std::string& outputFolder, FCM::PIFCMCallback pCallback) override;
        
        // Start a preview for the output content for this writer
        virtual FCM::Result StartPreview(const std::string& outFile, FCM::PIFCMCallback pCallback) override;
        
        // Stop a preview for the output content for this writer
        virtual FCM::Result StopPreview(const std::string& outFile) override;
        
        ElectronOutputWriter(FCM::PIFCMCallback pCallback, bool minify, DataPrecision dataPrecision);
        
    private:
        std::string m_outputMainJSFilePath;
        
        std::string m_outputMainJSFileName;
        
        std::string m_outputPackageJSONFileName;
        
        std::string m_outputPackageJSONFilePath;
        
        char* m_MainJSOutput;
        
        char* m_PackageJSONOutput;
    };
};

#endif // ELECTRON_OUTPUT_WRITER_H_
