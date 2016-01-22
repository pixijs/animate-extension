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

#include "Writers/JSONOutputWriter.h"
#include "PluginConfiguration.h"
#include "HTTPServer.h"
#include "FCMPluginInterface.h"

#include <cstring>
#include <fstream>

#ifdef _WINDOWS
#include "Windows.h"
#endif

namespace PixiJS
{
    static const char* jsonWriterHtmlOutput =
        "<!DOCTYPE html>\r\n \
        <html>\r\n \
            <head> \r\n\
                <script src=\"%s/vendor/pixi.js\"></script> \r\n\
                <script src=\"%s/vendor/tweenjs-0.6.1.min.js\"></script> <!-- required for pixiflash's movieclip as described in the movieclip class documentation --> \r\n\
                <script src=\"%s/vendor/pixi-flash.js\"></script> \r\n\
                \r\n\
                <script src=\"%s/runtime/html/resourcemanager.js\"></script> \r\n\
                <script src=\"%s/runtime/html/utils.js\"></script> \r\n\
                <script src=\"%s/runtime/html/timelineanimator.js\"></script> \r\n\
                <script src=\"%s/runtime/html/player.js\"></script> \r\n\
                \r\n\
            </head>\r\n\
            \r\n\
            <body> \r\n\
                <canvas id=\"canvas\" width=\"%d\" height=\"%d\" style=\"background-color:#%06X\"> \r\n\
                alternate content \r\n\
                </canvas> \r\n\
            </body> \r\n\
            \r\n\
            <script type=\"text/javascript\"> \r\n\
                \r\n\
                var loader = PIXI.loader; \r\n\
                loader.add('Bpic', \"./%s/images/B.png\"); \r\n\
                loader.add('pixijs_flash_publish_json', \"./%s\"); \r\n\
                loader.once(\"complete\", handleComplete); \r\n\
                loader.load(); \r\n\
                function handleComplete(loader, args) { \r\n\
                    var canvas = document.getElementById(\"canvas\"); \r\n\
                    var stage = new pixiflash.Container(); \r\n\
                    var renderer = new PIXI.autoDetectRenderer(canvas.width, canvas.height, { \r\n\
                        view: document.getElementById(\"canvas\"), \r\n\
                        antialias: true \r\n\
                    }); \r\n\
                    \r\n\
                    //pass FPS and use that in the player \r\n\
                    init(stage, renderer, args.pixijs_flash_publish_json.data, %d); \r\n\
                } \r\n\
            </script> \r\n\
        </html>";


    /* -------------------------------------------------- JSONOutputWriter */

    FCM::Result JSONOutputWriter::StartDocument(const DOM::Utils::COLOR& background,
                                                FCM::U_Int32 stageHeight,
                                                FCM::U_Int32 stageWidth,
                                                FCM::U_Int32 fps)
    {
        OutputWriterBase::StartDocument(background, stageHeight, stageWidth, fps);
        
        FCM::U_Int32 backColor;

        m_HTMLOutput = new char[strlen(jsonWriterHtmlOutput) + FILENAME_MAX + (11 * strlen(RUNTIME_ROOT_FOLDER_NAME)) + 50];
        if (m_HTMLOutput == NULL)
        {
            return FCM_MEM_NOT_AVAILABLE;
        }

        backColor = (background.red << 16) | (background.green << 8) | (background.blue);
        sprintf(m_HTMLOutput, jsonWriterHtmlOutput,
            RUNTIME_ROOT_FOLDER_NAME,
            RUNTIME_ROOT_FOLDER_NAME,
            RUNTIME_ROOT_FOLDER_NAME,
            RUNTIME_ROOT_FOLDER_NAME,
            RUNTIME_ROOT_FOLDER_NAME,
            RUNTIME_ROOT_FOLDER_NAME,
            RUNTIME_ROOT_FOLDER_NAME,
            stageWidth, stageHeight, backColor,
            RUNTIME_ROOT_FOLDER_NAME,
            m_outputJSONFileName.c_str(),
            fps);

        return FCM_SUCCESS;
    }

    FCM::Result JSONOutputWriter::EndDocument()
    {
        OutputWriterBase::EndDocument();
        
        std::fstream file;
        
        // Write the HTML file (overwrite file if it already exists)
        Utils::OpenFStream(m_outputHTMLFile, file, std::ios_base::trunc|std::ios_base::out, m_pCallback);

        file << m_HTMLOutput;
        file.close();

        delete [] m_HTMLOutput;

        return FCM_SUCCESS;
    }
    
    FCM::Result JSONOutputWriter::StartPreview(const std::string& outFile, FCM::PIFCMCallback pCallback)
    {
        FCM::Result res = FCM_SUCCESS;
        
#ifdef USE_HTTP_SERVER
        
        // We are now about to start a web server
        std::string fileName;
        HTTPServer* server;
        ServerConfigParam config;
        
        Utils::GetFileName(outFile, fileName);
        
        server = HTTPServer::GetInstance();
        
        int numTries = 0;
        while (numTries < MAX_RETRY_ATTEMPT)
        {
            // Configure the web server
            config.port = Utils::GetUnusedLocalPort();
            Utils::GetParent(outFile, config.root);
            server->SetConfig(config);
            
            // Start the web server
            res = server->Start();
            if (FCM_SUCCESS_CODE(res))
            {
                // Launch the browser
                Utils::LaunchBrowser(outFile, config.port, pCallback);
                break;
            }
            numTries++;
        }
        
        if (numTries == MAX_RETRY_ATTEMPT)
        {
            Utils::Trace(pCallback, "Failed to start web server\n");
            res = FCM_GENERAL_ERROR;
        }
        
#endif // USE_HTTP_SERVER
        
        return res;
    }
    
    FCM::Result JSONOutputWriter::StopPreview(const std::string& outFile)
    {
        FCM::Result res = FCM_SUCCESS;
        
#ifdef USE_HTTP_SERVER
        
        HTTPServer* server;
        
        server = HTTPServer::GetInstance();
        if (server)
        {
            // Stop the web server just in case it is running
            server->Stop();
        }
        
#endif // USE_HTTP_SERVER
        
        return res;
    }

    JSONOutputWriter::JSONOutputWriter(
            FCM::PIFCMCallback pCallback,
            bool minify, 
            DataPrecision dataPrecision) :
        OutputWriterBase(pCallback, minify, dataPrecision)
    {
    }
};
