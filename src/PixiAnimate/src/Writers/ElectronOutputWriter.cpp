//
//  ElectronOutputWriter.cpp
//  PixiAnimate.mp
//
//  Created by Matt Bittarelli on 11/23/15.
//
//
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

#include "Writers/ElectronOutputWriter.h"
#include "PluginConfiguration.h"

#include <cstring>
#include <fstream>

#ifdef _WINDOWS
#include "Windows.h"
#endif

namespace PixiJS
{
    static const char* electronWriterHtmlOutput =
    "<!DOCTYPE html> \r\n\
    <html> \r\n\
        <head> \r\n\
        <script src=\"%s/vendor/tweenjs-0.6.1.min.js\"> </script> \r\n\
        </head> \r\n\
        \r\n\
        <body> \r\n\
        <canvas id=\"canvas\" width=\"%d\" height=\"%d\" style=\"background-color:#%06X\"> \r\n\
        alternate content \r\n\
        </canvas> \r\n\
        </body> \r\n\
        \r\n\
        <script> \r\n\
            require('./node_modules/babel/register'); \r\n\
            require('./%s/runtime/electron/runtimeMain')(\"./%s\", %d); \r\n\
        </script> \r\n\
    </html>";
    
    static const char* electronWriterMainJSOutput =
        "const electron = require('electron'); \r\n\
        const app = electron.app;  // Module to control application life. \r\n\
        const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window. \r\n\
        \r\n\
        // Report crashes to our server. \r\n\
        electron.crashReporter.start(); \r\n\
        \r\n\
        // Keep a global reference of the window object, if you don't, the window will \r\n\
        // be closed automatically when the JavaScript object is garbage collected. \r\n\
        var mainWindow = null; \r\n\
        \r\n\
        // Quit when all windows are closed. \r\n\
        app.on('window-all-closed', function() { \r\n\
            app.quit(); \r\n\
        }); \r\n\
        \r\n\
        // This method will be called when Electron has finished \r\n\
        // initialization and is ready to create browser windows. \r\n\
        app.on('ready', function() { \r\n\
            // Create the browser window. \r\n\
            mainWindow = new BrowserWindow({width: %d, height: %d}); \r\n\
            \r\n\
            // and load the index.html of the app. \r\n\
            mainWindow.loadURL('file://' + __dirname + '/%s'); \r\n\
            \r\n\
            // Open the DevTools. \r\n\
            mainWindow.webContents.openDevTools(); \r\n\
            \r\n\
            // Emitted when the window is closed. \r\n\
            mainWindow.on('closed', function() { \r\n\
                // Dereference the window object, usually you would store windows \r\n\
                // in an array if your app supports multi windows, this is the time \r\n\
                // when you should delete the corresponding element. \r\n\
                mainWindow = null; \r\n\
            }); \r\n\
        });";
    
    static const char* electronWriterPackageJSONOutput =
    "{ \r\n\
        \"name\": \"adobe-flash-pixijs\", \r\n\
        \"version\": \"1.0.0\", \r\n\
        \"description\": \"Exported Adobe Flash content using the Pixi.js renderer.\", \r\n\
        \"main\": \"%s\", \r\n\
        \"scripts\": { \r\n\
            \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\" \r\n\
        }, \r\n\
        \"author\": \"Jibo Inc\", \r\n\
        \"license\": \"ISC\", \r\n\
        \"dependencies\": { \r\n\
            \"babel\": \"^5.3.3\" \r\n\
        } \r\n\
    }";
    
    /* -------------------------------------------------- ElectronOutputWriter */
    
    FCM::Result ElectronOutputWriter::StartOutput(std::string& outputFileName)
    {
        OutputWriterBase::StartOutput(outputFileName);
        
        std::string parent;
        
        Utils::GetParent(outputFileName, parent);
        
        m_outputMainJSFileName = "main.js";
        m_outputMainJSFilePath = parent + m_outputMainJSFileName;
        
        m_outputPackageJSONFileName = "package.json";
        m_outputPackageJSONFilePath = parent + m_outputPackageJSONFileName;
        
        return FCM_SUCCESS;
    }
    
    FCM::Result ElectronOutputWriter::StartDocument(const DOM::Utils::COLOR& background,
                                                    FCM::U_Int32 stageHeight,
                                                    FCM::U_Int32 stageWidth,
                                                    FCM::U_Int32 fps)
    {
        OutputWriterBase::StartDocument(background, stageHeight, stageWidth, fps);
        
        FCM::U_Int32 backColor = (background.red << 16) | (background.green << 8) | (background.blue);
        
        // dynamically fill in html file content
        m_HTMLOutput = new char[strlen(electronWriterHtmlOutput) + FILENAME_MAX + (11 * strlen(RUNTIME_ROOT_FOLDER_NAME)) + 50];
        if (m_HTMLOutput == NULL)
        {
            return FCM_MEM_NOT_AVAILABLE;
        }
        
        sprintf(m_HTMLOutput, electronWriterHtmlOutput,
                RUNTIME_ROOT_FOLDER_NAME,
                stageWidth, stageHeight, backColor,
                RUNTIME_ROOT_FOLDER_NAME, m_outputJSONFileName.c_str(), fps);
        
        // dynamically fill in main.js file content
        m_MainJSOutput = new char[strlen(electronWriterMainJSOutput) + FILENAME_MAX + (11 * strlen(RUNTIME_ROOT_FOLDER_NAME)) + 50];
        if (m_MainJSOutput == NULL)
        {
            return FCM_MEM_NOT_AVAILABLE;
        }
        
        std::string htmlFileName = "";
        Utils::GetFileName(m_outputHTMLFile, htmlFileName);
        sprintf(m_MainJSOutput, electronWriterMainJSOutput,
                stageWidth, stageHeight,
                htmlFileName.c_str());
        
        // dynmically fill in package.json file content
        m_PackageJSONOutput = new char[strlen(electronWriterPackageJSONOutput) + FILENAME_MAX + (11 * strlen(RUNTIME_ROOT_FOLDER_NAME)) + 50];
        if (m_PackageJSONOutput == NULL)
        {
            return FCM_MEM_NOT_AVAILABLE;
        }
        
        sprintf(m_PackageJSONOutput, electronWriterPackageJSONOutput,
                m_outputMainJSFileName.c_str());
        
        return FCM_SUCCESS;
    }
    
    FCM::Result ElectronOutputWriter::EndDocument()
    {
        OutputWriterBase::EndDocument();
        
        std::fstream file;

        // Write the HTML file (overwrite file if it already exists)
        Utils::OpenFStream(m_outputHTMLFile, file, std::ios_base::trunc|std::ios_base::out, m_pCallback);
        
        file << m_HTMLOutput;
        file.close();
        
        delete [] m_HTMLOutput;
        
        // Write the main.js file (overwrite file if it already exists)
        Utils::OpenFStream(m_outputMainJSFilePath, file, std::ios_base::trunc|std::ios_base::out, m_pCallback);
        
        file << m_MainJSOutput;
        file.close();
        
        delete [] m_MainJSOutput;
        
        // Write the package.json file (overwrite file if it already exists)
        Utils::OpenFStream(m_outputPackageJSONFilePath, file, std::ios_base::trunc|std::ios_base::out, m_pCallback);
        
        file << m_PackageJSONOutput;
        file.close();
        
        delete [] m_PackageJSONOutput;
        
        return FCM_SUCCESS;
    }
    
    FCM::Result ElectronOutputWriter::PostPublishStep(const std::string& outputFolder, FCM::PIFCMCallback pCallback)
    {
        #ifdef _WINDOWS
            // currently this operation is not supported on windows!
            Utils::Trace("Running npm install on your project directory is currently not supported under windows", pCallback);
        #else
            std::string str = "/usr/local/bin/node /usr/local/bin/npm install --prefix '" + outputFolder + "'";
            FILE* file = popen(str.c_str(), "r");
            pclose(file);
        #endif // _WINDOWS
        
        return FCM_SUCCESS;
    }
    
    FCM::Result ElectronOutputWriter::StartPreview(const std::string& outFile, FCM::PIFCMCallback pCallback)
    {
        #ifdef _WINDOWS
            // currently this operation is not supported on windows!
            Utils::Trace("Previewing an electron project is currently not supported under windows", pCallback);
        #else
            std::string parentDirectory = "";
            Utils::GetParent(outFile, parentDirectory);
            std::string str = "/usr/local/bin/node /usr/local/bin/electron '" + parentDirectory + "'";
            popen(str.c_str(), "r");
        #endif // _WINDOWS

        return FCM_SUCCESS;
    }
    
    FCM::Result ElectronOutputWriter::StopPreview(const std::string& outFile)
    {
        #ifdef _WINDOWS
            // currently this operation is not supported on windows!
        #else
            // shut down previously running versions of electron
            std::string parentDirectory = "";
            Utils::GetParent(outFile, parentDirectory);
            // ps aux find's everything that's running
            // grep is searching for any process with the string 'electron' followed by the parent directory.
            //   (excluding the grep process itself)
            // awk is printing the second string returned by the grep (which is the pid)
            // kill is operating over all pids returned in this way
            std::string str = "kill $(ps aux | grep '\\<.*[e]lectron.*\\> '" + parentDirectory + "'' | awk '{print $2}')";
            popen(str.c_str(), "r");
        #endif // _WINDOWS
        
        return FCM_SUCCESS;
    }
    
    ElectronOutputWriter::ElectronOutputWriter(
                                       FCM::PIFCMCallback pCallback,
                                       bool minify,
                                       DataPrecision dataPrecision) :
        m_outputMainJSFilePath(""),
        m_outputMainJSFileName(""),
        m_outputPackageJSONFileName(""),
        m_outputPackageJSONFilePath(""),
        m_MainJSOutput(NULL),
        m_PackageJSONOutput(NULL),
        OutputWriterBase(pCallback, minify, dataPrecision)
    {
    }
};
