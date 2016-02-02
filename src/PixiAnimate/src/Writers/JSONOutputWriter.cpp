//
//  JSONOutputWriter.cpp
//  PixiAnimate.mp
//
//  Created by Matt Bittarelli on 11/24/15.
//
//

#include "Writers/JSONOutputWriter.h"

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

#include <cstring>
#include <fstream>
#include <map>
#include <iostream>
#include <sstream>
#include <string>
#include <iterator>
#include "FlashFCMPublicIDs.h"
#include "FCMPluginInterface.h"
#include "libjson.h"
#include "Utils.h"
#include "FrameElement/ISound.h"
#include "Service/Image/IBitmapExportService.h"
#include "Service/TextLayout/ITextLinesGeneratorService.h"
#include "Service/TextLayout/ITextLine.h"
#include "Service/Sound/ISoundExportService.h"
#include "GraphicFilter/IDropShadowFilter.h"
#include "GraphicFilter/IAdjustColorFilter.h"
#include "GraphicFilter/IBevelFilter.h"
#include "GraphicFilter/IBlurFilter.h"
#include "GraphicFilter/IGlowFilter.h"
#include "GraphicFilter/IGradientBevelFilter.h"
#include "GraphicFilter/IGradientGlowFilter.h"
#include "Utils/ILinearColorGradient.h"
#include <math.h>
#include "Writers/JSONTimelineWriter.h"
#include "HTTPServer.h"

#ifdef _WINDOWS
#include "Windows.h"
#endif

namespace PixiJS
{
    static const std::string moveTo = "M";
    static const std::string lineTo = "L";
    static const std::string bezierCurveTo = "Q";
    static const std::string space = " ";
    static const std::string comma = ",";
    static const std::string semiColon = ";";
    
    static const FCM::Float GRADIENT_VECTOR_CONSTANT = 16384.0;
    
    /* -------------------------------------------------- JSONOutputWriter */
    
    FCM::Result JSONOutputWriter::StartOutput()
    {
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::EndOutput()
    {
        return FCM_SUCCESS;
    }
    
    // no-op. subclasses should implement this method
    FCM::Result JSONOutputWriter::StartDocument(const DOM::Utils::COLOR& background,
                                                FCM::U_Int32 stageHeight,
                                                FCM::U_Int32 stageWidth,
                                                FCM::U_Int32 fps)
    {

        FCM::U_Int32 backColor = (background.red << 16) | (background.green << 8) | (background.blue);

        // Convert the backColor INT to a hex string e.g., ffffff
        std::stringstream sstream;
        sstream << std::hex << backColor;

        std::string outputName;
        Utils::GetFileNameWithoutExtension(m_outputFile, outputName);

        #ifdef _DEBUG

            Utils::Trace(m_pCallback, " -> Data output %s\n", m_outputDataFile.c_str());

        #endif

        // Template substitutions are created e.g., ${imagesPath} replaced with path to images
        m_substitutions["imagesPath"] = m_imagesPath;
        m_substitutions["libsPath"] = m_libsPath;
        m_substitutions["soundsPath"] = m_soundsPath;
        m_substitutions["htmlPath"] = m_htmlPath;
        m_substitutions["outputFile"] = m_outputFile;
        m_substitutions["outputName"] = outputName;
        m_substitutions["stageName"] = m_stageName;
        m_substitutions["electronPath"] = m_electronPath;
        m_substitutions["width"] = Utils::ToString(stageWidth);
        m_substitutions["height"] = Utils::ToString(stageHeight);
        m_substitutions["background"] = sstream.str();
        m_substitutions["fps"] = Utils::ToString(fps);
        m_substitutions["nameSpace"] = m_nameSpace;

        return FCM_SUCCESS;
    }
    
    FCM::Result JSONOutputWriter::EndDocument()
    {
        m_pRootNode->push_back(*m_pShapeArray);
        m_pRootNode->push_back(*m_pBitmapArray);
        m_pRootNode->push_back(*m_pSoundArray);
        m_pRootNode->push_back(*m_pTextArray);
        m_pRootNode->push_back(*m_pTimelineArray);
        
        JSONNode firstNode(JSON_NODE);
        firstNode.push_back(*m_pRootNode);

        // Write the JSON file (overwrite file if it already exists)
        Save(m_outputDataFile, firstNode.write_formatted());
        
        // Get the path to the templates folder
        std::string templatesPath;
        Utils::GetExtensionPath(templatesPath, m_pCallback);
        templatesPath += TEMPLATE_FOLDER_NAME;

        // Output the HTML templates
        if (m_html)
        {
            SaveFromTemplate(templatesPath + "index.html", m_basePath + m_htmlPath);
        }

        // Output the electron path
        if (m_electron)
        {
            SaveFromTemplate(templatesPath + "package.json", m_basePath + "package.json");
            SaveFromTemplate(templatesPath + "main.js", m_basePath + m_electronPath);
        }

        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::StartDefineTimeline()
    {
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::EndDefineTimeline(
                                                    FCM::U_Int32 resId,
                                                    FCM::StringRep16 pName,
                                                    ITimelineWriter* pTimelineWriter)
    {
        JSONTimelineWriter* pWriter = static_cast<JSONTimelineWriter*> (pTimelineWriter);
        
        pWriter->Finish(resId, pName);
        
        m_pTimelineArray->push_back(*(pWriter->GetRoot()));
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::StartDefineShape()
    {
        m_shapeElem = new JSONNode(JSON_NODE);
        ASSERT(m_shapeElem);
        
        m_pathArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pathArray);
        m_pathArray->set_name("path");
        
        return FCM_SUCCESS;
    }
    
    
    // Marks the end of a shape
    FCM::Result JSONOutputWriter::EndDefineShape(FCM::U_Int32 resId)
    {
        m_shapeElem->push_back(JSONNode(("charid"), PixiJS::Utils::ToString(resId)));
        m_shapeElem->push_back(*m_pathArray);
        
        m_pShapeArray->push_back(*m_shapeElem);
        
        delete m_pathArray;
        delete m_shapeElem;
        
        return FCM_SUCCESS;
    }
    
    
    // Start of fill region definition
    FCM::Result JSONOutputWriter::StartDefineFill()
    {
        m_pathElem = new JSONNode(JSON_NODE);
        ASSERT(m_pathElem);
        
        m_pathCmdStr.clear();
        
        return FCM_SUCCESS;
    }
    
    
    // Solid fill style definition
    FCM::Result JSONOutputWriter::DefineSolidFillStyle(const DOM::Utils::COLOR& color)
    {
        std::string colorStr = Utils::ToString(color);

        float myalpha = (float)(color.alpha / 255.0);
        std::string colorOpacityStr = PixiJS::Utils::ToString(myalpha, m_dataPrecision);
        
        m_pathElem->push_back(JSONNode("color", colorStr.c_str()));
        m_pathElem->push_back(JSONNode("colorOpacity", colorOpacityStr.c_str()));
        
        return FCM_SUCCESS;
    }
    
    
    // Bitmap fill style definition
    FCM::Result JSONOutputWriter::DefineBitmapFillStyle(
                                                        FCM::Boolean clipped,
                                                        const DOM::Utils::MATRIX2D& matrix,
                                                        FCM::S_Int32 height,
                                                        FCM::S_Int32 width,
                                                        const std::string& libPathName,
                                                        DOM::LibraryItem::PIMediaItem pMediaItem)
    {
        if (!m_images)
        {
            return FCM_SUCCESS;
        }

        FCM::Result res;
        std::string name;
        JSONNode bitmapElem(JSON_NODE);
        std::string bitmapPath;
        std::string bitmapName;
        
        bitmapElem.set_name("image");
        
        bitmapElem.push_back(JSONNode(("height"), PixiJS::Utils::ToString(height)));
        bitmapElem.push_back(JSONNode(("width"), PixiJS::Utils::ToString(width)));
        
        FCM::AutoPtr<FCM::IFCMUnknown> pUnk;
        std::string bitmapRelPath;
        std::string bitmapExportPath = m_outputImageFolder + "/";
        
        FCM::Boolean alreadyExported = GetImageExportFileName(libPathName, name);
        if (!alreadyExported)
        {
            if (!m_imageFolderCreated)
            {
                res = Utils::CreateDir(m_outputImageFolder, m_pCallback);
                if (!(FCM_SUCCESS_CODE(res)))
                {
                    Utils::Trace(m_pCallback, "Output image folder (%s) could not be created\n", m_outputImageFolder.c_str());
                    return res;
                }
                m_imageFolderCreated = true;
            }
            CreateImageFileName(libPathName, name);
            SetImageExportFileName(libPathName, name);
        }
        
        bitmapExportPath += name;
        
        bitmapRelPath = "./";
        bitmapRelPath += m_imagesPath;
        bitmapRelPath += "/";
        bitmapRelPath += name;
        
        res = m_pCallback->GetService(DOM::FLA_BITMAP_SERVICE, pUnk.m_Ptr);
        ASSERT(FCM_SUCCESS_CODE(res));
        
        FCM::AutoPtr<DOM::Service::Image::IBitmapExportService> bitmapExportService = pUnk;
        if (bitmapExportService)
        {
            FCM::AutoPtr<FCM::IFCMCalloc> pCalloc;
            FCM::StringRep16 pFilePath = Utils::ToString16(bitmapExportPath, m_pCallback);
            res = bitmapExportService->ExportToFile(pMediaItem, pFilePath, 100);
            ASSERT(FCM_SUCCESS_CODE(res));
            
            pCalloc = PixiJS::Utils::GetCallocService(m_pCallback);
            ASSERT(pCalloc.m_Ptr != NULL);
            
            pCalloc->Free(pFilePath);
        }
        
        bitmapElem.push_back(JSONNode(("bitmapPath"), bitmapRelPath));
        
        DOM::Utils::MATRIX2D matrix1 = matrix;
        matrix1.a /= 20.0;
        matrix1.b /= 20.0;
        matrix1.c /= 20.0;
        matrix1.d /= 20.0;
        
        bitmapElem.push_back(JSONNode(("patternUnits"), "userSpaceOnUse"));
        bitmapElem.push_back(JSONNode(("patternTransform"), Utils::ToString(matrix1, m_dataPrecision).c_str()));
        
        m_pathElem->push_back(bitmapElem);
        
        return FCM_SUCCESS;
    }
    
    
    // Start Linear Gradient fill style definition
    FCM::Result JSONOutputWriter::StartDefineLinearGradientFillStyle(
                                                                     DOM::FillStyle::GradientSpread spread,
                                                                     const DOM::Utils::MATRIX2D& matrix)
    {
        DOM::Utils::POINT2D point;
        
        m_gradientColor = new JSONNode(JSON_NODE);
        ASSERT(m_gradientColor);
        m_gradientColor->set_name("linearGradient");
        
        point.x = -GRADIENT_VECTOR_CONSTANT / 20;
        point.y = 0;
        Utils::TransformPoint(matrix, point, point);
        
        m_gradientColor->push_back(JSONNode("x1", Utils::ToString(point.x, m_dataPrecision)));
        m_gradientColor->push_back(JSONNode("y1", Utils::ToString(point.y, m_dataPrecision)));
        
        point.x = GRADIENT_VECTOR_CONSTANT / 20;
        point.y = 0;
        Utils::TransformPoint(matrix, point, point);
        
        m_gradientColor->push_back(JSONNode("x2", Utils::ToString(point.x, m_dataPrecision)));
        m_gradientColor->push_back(JSONNode("y2", Utils::ToString(point.y, m_dataPrecision)));
        
        m_gradientColor->push_back(JSONNode("spreadMethod", Utils::ToString(spread)));
        
        m_stopPointArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_stopPointArray);
        m_stopPointArray->set_name("stop");
        
        return FCM_SUCCESS;
    }
    
    
    // Sets a specific key point in a color ramp (for both radial and linear gradient)
    FCM::Result JSONOutputWriter::SetKeyColorPoint(
                                                   const DOM::Utils::GRADIENT_COLOR_POINT& colorPoint)
    {
        JSONNode stopEntry(JSON_NODE);
        FCM::Float offset;
        
        offset = (float)((colorPoint.pos * 100) / 255.0);
        
        stopEntry.push_back(JSONNode("offset", Utils::ToString(offset, m_dataPrecision)));
        stopEntry.push_back(JSONNode("stopColor", Utils::ToString(colorPoint.color)));
        stopEntry.push_back(JSONNode("stopOpacity", Utils::ToString((colorPoint.color.alpha / 255.0), m_dataPrecision)));
        
        m_stopPointArray->push_back(stopEntry);
        
        return FCM_SUCCESS;
    }
    
    
    // End Linear Gradient fill style definition
    FCM::Result JSONOutputWriter::EndDefineLinearGradientFillStyle()
    {
        m_gradientColor->push_back(*m_stopPointArray);
        m_pathElem->push_back(*m_gradientColor);
        
        delete m_stopPointArray;
        delete m_gradientColor;
        
        return FCM_SUCCESS;
    }
    
    
    // Start Radial Gradient fill style definition
    FCM::Result JSONOutputWriter::StartDefineRadialGradientFillStyle(
                                                                     DOM::FillStyle::GradientSpread spread,
                                                                     const DOM::Utils::MATRIX2D& matrix,
                                                                     FCM::S_Int32 focalPoint)
    {
        DOM::Utils::POINT2D point;
        DOM::Utils::POINT2D point1;
        DOM::Utils::POINT2D point2;
        
        m_gradientColor = new JSONNode(JSON_NODE);
        ASSERT(m_gradientColor);
        m_gradientColor->set_name("radialGradient");
        
        point.x = 0;
        point.y = 0;
        Utils::TransformPoint(matrix, point, point1);
        
        point.x = GRADIENT_VECTOR_CONSTANT / 20;
        point.y = 0;
        Utils::TransformPoint(matrix, point, point2);
        
        FCM::Float xd = point1.x - point2.x;
        FCM::Float yd = point1.y - point2.y;
        FCM::Float r = sqrt(xd * xd + yd * yd);
        
        FCM::Float angle = atan2(yd, xd);
        float focusPointRatio = focalPoint / (float)255.0;
        float fx = -r * focusPointRatio * cos(angle);
        float fy = -r * focusPointRatio * sin(angle);
        
        m_gradientColor->push_back(JSONNode("cx", "0"));
        m_gradientColor->push_back(JSONNode("cy", "0"));
        m_gradientColor->push_back(JSONNode("r", Utils::ToString((float) r, m_dataPrecision)));
        m_gradientColor->push_back(JSONNode("fx", Utils::ToString((float) fx, m_dataPrecision)));
        m_gradientColor->push_back(JSONNode("fy", Utils::ToString((float) fy, m_dataPrecision)));
        
        FCM::Float scaleFactor = (GRADIENT_VECTOR_CONSTANT / 20) / r;
        DOM::Utils::MATRIX2D matrix1 = {};
        matrix1.a = matrix.a * scaleFactor;
        matrix1.b = matrix.b * scaleFactor;
        matrix1.c = matrix.c * scaleFactor;
        matrix1.d = matrix.d * scaleFactor;
        matrix1.tx = matrix.tx;
        matrix1.ty = matrix.ty;
        
        m_gradientColor->push_back(JSONNode("gradientTransform", Utils::ToString(matrix1, m_dataPrecision)));
        m_gradientColor->push_back(JSONNode("spreadMethod", Utils::ToString(spread)));
        
        m_stopPointArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_stopPointArray);
        m_stopPointArray->set_name("stop");
        
        return FCM_SUCCESS;
    }
    
    
    // End Radial Gradient fill style definition
    FCM::Result JSONOutputWriter::EndDefineRadialGradientFillStyle()
    {
        m_gradientColor->push_back(*m_stopPointArray);
        m_pathElem->push_back(*m_gradientColor);
        
        delete m_stopPointArray;
        delete m_gradientColor;
        
        return FCM_SUCCESS;
    }
    
    
    // Start of fill region boundary
    FCM::Result JSONOutputWriter::StartDefineBoundary()
    {
        return StartDefinePath();
    }
    
    
    // Sets a segment of a path (Used for boundary, holes)
    FCM::Result JSONOutputWriter::SetSegment(const DOM::Utils::SEGMENT& segment)
    {
        if (m_firstSegment)
        {
            if (segment.segmentType == DOM::Utils::LINE_SEGMENT)
            {
                m_pathCmdStr.append(PixiJS::Utils::ToString((double)(segment.line.endPoint1.x), m_dataPrecision));
                m_pathCmdStr.append(space);
                m_pathCmdStr.append(PixiJS::Utils::ToString((double)(segment.line.endPoint1.y), m_dataPrecision));
                m_pathCmdStr.append(space);
            }
            else
            {
                m_pathCmdStr.append(PixiJS::Utils::ToString((double)(segment.quadBezierCurve.anchor1.x), m_dataPrecision));
                m_pathCmdStr.append(space);
                m_pathCmdStr.append(PixiJS::Utils::ToString((double)(segment.quadBezierCurve.anchor1.y), m_dataPrecision));
                m_pathCmdStr.append(space);
            }
            m_firstSegment = false;
        }
        
        if (segment.segmentType == DOM::Utils::LINE_SEGMENT)
        {
            m_pathCmdStr.append(lineTo);
            m_pathCmdStr.append(space);
            m_pathCmdStr.append(PixiJS::Utils::ToString((double)(segment.line.endPoint2.x), m_dataPrecision));
            m_pathCmdStr.append(space);
            m_pathCmdStr.append(PixiJS::Utils::ToString((double)(segment.line.endPoint2.y), m_dataPrecision));
            m_pathCmdStr.append(space);
        }
        else
        {
            m_pathCmdStr.append(bezierCurveTo);
            m_pathCmdStr.append(space);
            m_pathCmdStr.append(PixiJS::Utils::ToString((double)(segment.quadBezierCurve.control.x), m_dataPrecision));
            m_pathCmdStr.append(space);
            m_pathCmdStr.append(PixiJS::Utils::ToString((double)(segment.quadBezierCurve.control.y), m_dataPrecision));
            m_pathCmdStr.append(space);
            m_pathCmdStr.append(PixiJS::Utils::ToString((double)(segment.quadBezierCurve.anchor2.x), m_dataPrecision));
            m_pathCmdStr.append(space);
            m_pathCmdStr.append(PixiJS::Utils::ToString((double)(segment.quadBezierCurve.anchor2.y), m_dataPrecision));
            m_pathCmdStr.append(space);
        }
        
        return FCM_SUCCESS;
    }
    
    
    // End of fill region boundary
    FCM::Result JSONOutputWriter::EndDefineBoundary()
    {
        return EndDefinePath();
    }
    
    
    // Start of fill region hole
    FCM::Result JSONOutputWriter::StartDefineHole()
    {
        return StartDefinePath();
    }
    
    
    // End of fill region hole
    FCM::Result JSONOutputWriter::EndDefineHole()
    {
        return EndDefinePath();
    }
    
    
    // Start of stroke group
    FCM::Result JSONOutputWriter::StartDefineStrokeGroup()
    {
        // No need to do anything
        return FCM_SUCCESS;
    }
    
    
    // Start solid stroke style definition
    FCM::Result JSONOutputWriter::StartDefineSolidStrokeStyle(
                                                              FCM::Double thickness,
                                                              const DOM::StrokeStyle::JOIN_STYLE& joinStyle,
                                                              const DOM::StrokeStyle::CAP_STYLE& capStyle,
                                                              DOM::Utils::ScaleType scaleType,
                                                              FCM::Boolean strokeHinting)
    {
        m_strokeStyle.type = SOLID_STROKE_STYLE_TYPE;
        m_strokeStyle.solidStrokeStyle.capStyle = capStyle;
        m_strokeStyle.solidStrokeStyle.joinStyle = joinStyle;
        m_strokeStyle.solidStrokeStyle.thickness = thickness;
        m_strokeStyle.solidStrokeStyle.scaleType = scaleType;
        m_strokeStyle.solidStrokeStyle.strokeHinting = strokeHinting;
        
        return FCM_SUCCESS;
    }
    
    
    // End of solid stroke style
    FCM::Result JSONOutputWriter::EndDefineSolidStrokeStyle()
    {
        // No need to do anything
        return FCM_SUCCESS;
    }
    
    
    // Start of stroke
    FCM::Result JSONOutputWriter::StartDefineStroke()
    {
        m_pathElem = new JSONNode(JSON_NODE);
        ASSERT(m_pathElem);
        
        m_pathCmdStr.clear();
        StartDefinePath();
        
        return FCM_SUCCESS;
    }
    
    
    // End of a stroke
    FCM::Result JSONOutputWriter::EndDefineStroke()
    {
        m_pathElem->push_back(JSONNode("d", m_pathCmdStr));
        
        if (m_strokeStyle.type == SOLID_STROKE_STYLE_TYPE)
        {
            m_pathElem->push_back(JSONNode("strokeWidth",
                                           PixiJS::Utils::ToString((double)m_strokeStyle.solidStrokeStyle.thickness, m_dataPrecision).c_str()));
            m_pathElem->push_back(JSONNode("fill", "none"));
            m_pathElem->push_back(JSONNode("strokeLinecap", Utils::ToString(m_strokeStyle.solidStrokeStyle.capStyle.type).c_str()));
            m_pathElem->push_back(JSONNode("strokeLinejoin", Utils::ToString(m_strokeStyle.solidStrokeStyle.joinStyle.type).c_str()));
            
            if (m_strokeStyle.solidStrokeStyle.joinStyle.type == DOM::Utils::MITER_JOIN)
            {
                m_pathElem->push_back(JSONNode(
                                               "stroke-miterlimit",
                                               PixiJS::Utils::ToString((double)m_strokeStyle.solidStrokeStyle.joinStyle.miterJoinProp.miterLimit,
                                                                           m_dataPrecision).c_str()));
            }
            m_pathElem->push_back(JSONNode("pathType", "Stroke"));
        }
        m_pathArray->push_back(*m_pathElem);
        
        delete m_pathElem;
        
        m_pathElem = NULL;
        
        return FCM_SUCCESS;
    }
    
    
    // End of stroke group
    FCM::Result JSONOutputWriter::EndDefineStrokeGroup()
    {
        // No need to do anything
        return FCM_SUCCESS;
    }
    
    
    // End of fill style definition
    FCM::Result JSONOutputWriter::EndDefineFill()
    {
        m_pathElem->push_back(JSONNode("d", m_pathCmdStr));
        m_pathElem->push_back(JSONNode("pathType", JSON_TEXT("Fill")));
        m_pathElem->push_back(JSONNode("stroke", JSON_TEXT("none")));
        
        m_pathArray->push_back(*m_pathElem);
        
        delete m_pathElem;
        
        m_pathElem = NULL;
        
        return FCM_SUCCESS;
    }
    
    
    // Define a bitmap
    FCM::Result JSONOutputWriter::DefineBitmap(
                                               FCM::U_Int32 resId,
                                               FCM::S_Int32 height,
                                               FCM::S_Int32 width,
                                               const std::string& libPathName,
                                               DOM::LibraryItem::PIMediaItem pMediaItem)
    {
        if (!m_images)
        {
            return FCM_SUCCESS;
        }

        FCM::Result res;
        JSONNode bitmapElem(JSON_NODE);
        std::string bitmapPath;
        std::string bitmapName;
        std::string name;
        
        bitmapElem.set_name("image");
        
        bitmapElem.push_back(JSONNode(("charid"), PixiJS::Utils::ToString(resId)));
        bitmapElem.push_back(JSONNode(("height"), PixiJS::Utils::ToString(height)));
        bitmapElem.push_back(JSONNode(("width"), PixiJS::Utils::ToString(width)));
        
        FCM::AutoPtr<FCM::IFCMUnknown> pUnk;
        std::string bitmapRelPath;
        std::string bitmapExportPath = m_outputImageFolder + "/";
        
        FCM::Boolean alreadyExported = GetImageExportFileName(libPathName, name);
        if (!alreadyExported)
        {
            if (!m_imageFolderCreated)
            {
                res = Utils::CreateDir(m_outputImageFolder, m_pCallback);
                if (!(FCM_SUCCESS_CODE(res)))
                {
                    Utils::Trace(m_pCallback, "Output image folder (%s) could not be created\n", m_outputImageFolder.c_str());
                    return res;
                }
                m_imageFolderCreated = true;
            }
            CreateImageFileName(libPathName, name);
            SetImageExportFileName(libPathName, name);
        }
        
        bitmapExportPath += name;
        
        bitmapRelPath = "./";
        bitmapRelPath += m_imagesPath;
        bitmapRelPath += "/";
        bitmapRelPath += name;
        
        res = m_pCallback->GetService(DOM::FLA_BITMAP_SERVICE, pUnk.m_Ptr);
        ASSERT(FCM_SUCCESS_CODE(res));
        
        FCM::AutoPtr<DOM::Service::Image::IBitmapExportService> bitmapExportService = pUnk;
        if (bitmapExportService)
        {
            FCM::AutoPtr<FCM::IFCMCalloc> pCalloc;
            FCM::StringRep16 pFilePath = Utils::ToString16(bitmapExportPath, m_pCallback);
            res = bitmapExportService->ExportToFile(pMediaItem, pFilePath, 100);
            ASSERT(FCM_SUCCESS_CODE(res));
            
            pCalloc = PixiJS::Utils::GetCallocService(m_pCallback);
            ASSERT(pCalloc.m_Ptr != NULL);
            
            pCalloc->Free(pFilePath);
        }
        
        bitmapElem.push_back(JSONNode(("bitmapPath"), bitmapRelPath));
        
        m_pBitmapArray->push_back(bitmapElem);
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::StartDefineClassicText(
                                                         FCM::U_Int32 resId,
                                                         const DOM::FrameElement::AA_MODE_PROP& aaModeProp,
                                                         const std::string& displayText,
                                                         const TEXT_BEHAVIOUR& textBehaviour)
    {
        JSONNode aaMode(JSON_NODE);
        JSONNode behaviour(JSON_NODE);
        
        m_pTextElem = new JSONNode(JSON_NODE);
        ASSERT(m_pTextElem != NULL);
        
        m_pTextElem->set_name("text");
        m_pTextElem->push_back(JSONNode(("charid"), PixiJS::Utils::ToString(resId)));
        
        aaMode.set_name("aaMode");
        aaMode.push_back(JSONNode(("mode"), PixiJS::Utils::ToString(aaModeProp.aaMode)));
        if (aaModeProp.aaMode == DOM::FrameElement::ANTI_ALIAS_MODE_CUSTOM)
        {
            aaMode.push_back(JSONNode(("thickness"),
                                      PixiJS::Utils::ToString(aaModeProp.customAAModeProp.aaThickness, m_dataPrecision)));
            aaMode.push_back(JSONNode(("sharpness"),
                                      PixiJS::Utils::ToString(aaModeProp.customAAModeProp.aaSharpness, m_dataPrecision)));
        }
        m_pTextElem->push_back(aaMode);
        
        m_pTextElem->push_back(JSONNode(("txt"), displayText));
        
        behaviour.set_name("behaviour");
        
        if (textBehaviour.type == 0)
        {
            // Static Text
            behaviour.push_back(JSONNode(("type"), "Static"));
            behaviour.push_back(JSONNode(("flow"), PixiJS::Utils::ToString(textBehaviour.u.staticText.flow)));
            behaviour.push_back(JSONNode(("orientation"), PixiJS::Utils::ToString(textBehaviour.u.staticText.orientationMode)));
        }
        else if (textBehaviour.type == 1)
        {
            // Dynamic text
            behaviour.push_back(JSONNode(("type"), "Dynamic"));
            behaviour.push_back(JSONNode(("name"), textBehaviour.name));
            behaviour.push_back(JSONNode(("isBorderDrawn"), textBehaviour.u.dynamicText.borderDrawn ? "true" : "false"));
            behaviour.push_back(JSONNode(("lineMode"), PixiJS::Utils::ToString(textBehaviour.u.dynamicText.lineMode)));
            behaviour.push_back(JSONNode(("isRenderAsHTML"), textBehaviour.u.dynamicText.renderAsHtml ? "true" : "false"));
            behaviour.push_back(JSONNode(("isScrollable"), textBehaviour.u.dynamicText.scrollable ? "true" : "false"));
        }
        else
        {
            // Input text
            behaviour.push_back(JSONNode(("type"), "Input"));
            behaviour.push_back(JSONNode(("name"), textBehaviour.name));
            behaviour.push_back(JSONNode(("isBorderDrawn"), textBehaviour.u.inputText.borderDrawn ? "true" : "false"));
            behaviour.push_back(JSONNode(("lineMode"), PixiJS::Utils::ToString(textBehaviour.u.inputText.lineMode)));
            behaviour.push_back(JSONNode(("isRenderAsHTML"), textBehaviour.u.inputText.renderAsHtml ? "true" : "false"));
            behaviour.push_back(JSONNode(("isScrollable"), textBehaviour.u.inputText.scrollable ? "true" : "false"));
            behaviour.push_back(JSONNode(("isPassword"), textBehaviour.u.inputText.password ? "true" : "false"));
        }
        
        behaviour.push_back(JSONNode(("isSelectable"), textBehaviour.selectable  ? "true" : "false"));
        
        m_pTextElem->push_back(behaviour);
        
        // Start a paragraph array
        m_pTextParaArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pTextParaArray != NULL);
        
        m_pTextParaArray->set_name("paras");
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::StartDefineParagraph(
                                                       FCM::U_Int32 startIndex,
                                                       FCM::U_Int32 length,
                                                       const DOM::FrameElement::PARAGRAPH_STYLE& paragraphStyle)
    {
        m_pTextPara = new JSONNode(JSON_NODE);
        ASSERT(m_pTextPara != NULL);
        
        m_pTextPara->push_back(JSONNode(("startIndex"), PixiJS::Utils::ToString(startIndex)));
        m_pTextPara->push_back(JSONNode(("length"), PixiJS::Utils::ToString(length)));
        m_pTextPara->push_back(JSONNode(("indent"), PixiJS::Utils::ToString(paragraphStyle.indent)));
        m_pTextPara->push_back(JSONNode(("leftMargin"), PixiJS::Utils::ToString(paragraphStyle.leftMargin)));
        m_pTextPara->push_back(JSONNode(("rightMargin"), PixiJS::Utils::ToString(paragraphStyle.rightMargin)));
        m_pTextPara->push_back(JSONNode(("linespacing"), PixiJS::Utils::ToString(paragraphStyle.lineSpacing)));
        m_pTextPara->push_back(JSONNode(("alignment"), PixiJS::Utils::ToString(paragraphStyle.alignment)));
        
        m_pTextRunArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pTextRunArray != NULL);
        
        m_pTextRunArray->set_name("textRun");
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::StartDefineTextRun(
                                                     FCM::U_Int32 startIndex,
                                                     FCM::U_Int32 length,
                                                     const TEXT_STYLE& textStyle)
    {
        JSONNode textRun(JSON_NODE);
        JSONNode style(JSON_NODE);
        
        textRun.push_back(JSONNode(("startIndex"), PixiJS::Utils::ToString(startIndex)));
        textRun.push_back(JSONNode(("length"), PixiJS::Utils::ToString(length)));
        
        style.set_name("style");
        style.push_back(JSONNode("fontName", textStyle.fontName));
        style.push_back(JSONNode("fontSize", PixiJS::Utils::ToString(textStyle.fontSize)));
        style.push_back(JSONNode("fontColor", PixiJS::Utils::ToString(textStyle.fontColor)));
        style.push_back(JSONNode("fontStyle", textStyle.fontStyle));
        style.push_back(JSONNode("letterSpacing", PixiJS::Utils::ToString(textStyle.letterSpacing)));
        style.push_back(JSONNode("isRotated", textStyle.rotated ? "true" : "false"));
        style.push_back(JSONNode("isAutoKern", textStyle.autoKern ? "true" : "false"));
        style.push_back(JSONNode("baseLineShiftStyle", PixiJS::Utils::ToString(textStyle.baseLineShiftStyle)));
        style.push_back(JSONNode("link", textStyle.link));
        style.push_back(JSONNode("linkTarget", textStyle.linkTarget));
        
        textRun.push_back(style);
        m_pTextRunArray->push_back(textRun);
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::EndDefineTextRun()
    {
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::EndDefineParagraph()
    {
        m_pTextPara->push_back(*m_pTextRunArray);
        delete m_pTextRunArray;
        m_pTextRunArray = NULL;
        
        m_pTextParaArray->push_back(*m_pTextPara);
        delete m_pTextPara;
        m_pTextPara = NULL;
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::EndDefineClassicText()
    {
        m_pTextElem->push_back(*m_pTextParaArray);
        
        delete m_pTextParaArray;
        m_pTextParaArray = NULL;
        
        m_pTextArray->push_back(*m_pTextElem);
        
        delete m_pTextElem;
        m_pTextElem = NULL;
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::DefineSound(
                                              FCM::U_Int32 resId,
                                              const std::string& libPathName,
                                              DOM::LibraryItem::PIMediaItem pMediaItem)
    {
        FCM::Result res;
        JSONNode soundElem(JSON_NODE);
        std::string soundPath;
        std::string soundName;
        std::string name;
        
        soundElem.set_name("sound");
        soundElem.push_back(JSONNode(("charid"), PixiJS::Utils::ToString(resId)));
        
        FCM::AutoPtr<FCM::IFCMUnknown> pUnk;
        std::string soundRelPath;
        std::string soundExportPath = m_outputSoundFolder + "/";
        
        if (!m_soundFolderCreated)
        {
            res = Utils::CreateDir(m_outputSoundFolder, m_pCallback);
            if (!(FCM_SUCCESS_CODE(res)))
            {
                Utils::Trace(m_pCallback, "Output sound folder (%s) could not be created\n", m_outputSoundFolder.c_str());
                return res;
            }
            m_soundFolderCreated = true;
        }
        
        CreateSoundFileName(libPathName, name);
        soundExportPath += name;
        
        soundRelPath = "./";
        soundRelPath += m_soundsPath;
        soundRelPath += "/";
        soundRelPath += name;
        
        res = m_pCallback->GetService(DOM::FLA_SOUND_SERVICE, pUnk.m_Ptr);
        ASSERT(FCM_SUCCESS_CODE(res));
        FCM::AutoPtr<DOM::Service::Sound::ISoundExportService> soundExportService = pUnk;
        if (soundExportService)
        {
            FCM::AutoPtr<FCM::IFCMCalloc> pCalloc;
            FCM::StringRep16 pFilePath = Utils::ToString16(soundExportPath, m_pCallback);
            res = soundExportService->ExportToFile(pMediaItem, pFilePath);
            ASSERT(FCM_SUCCESS_CODE(res));
            pCalloc = PixiJS::Utils::GetCallocService(m_pCallback);
            ASSERT(pCalloc.m_Ptr != NULL);
            pCalloc->Free(pFilePath);
        }
        
        soundElem.push_back(JSONNode(("soundPath"), soundRelPath));
        m_pSoundArray->push_back(soundElem);
        
        return FCM_SUCCESS;
    }
    
    JSONOutputWriter::JSONOutputWriter(
        FCM::PIFCMCallback pCallback, 
        std::string& basePath,
        std::string& outputFile,
        std::string& imagesPath,
        std::string& soundsPath,
        std::string& htmlPath,
        std::string& libsPath,
        std::string& stageName,
        std::string& nameSpace,
        std::string& electronPath,
        bool html,
        bool libs,
        bool images,
        bool sounds,
        bool compactShapes,
        bool compressJS,
        bool loopTimeline,
        bool electron,
        DataPrecision dataPrecision)
    : m_pCallback(pCallback),
    m_outputFile(outputFile),
    m_outputDataFile(basePath + outputFile + "on"),
    m_outputImageFolder(basePath + imagesPath),
    m_outputSoundFolder(basePath + soundsPath),
    m_basePath(basePath),
    m_imagesPath(imagesPath),
    m_soundsPath(soundsPath),
    m_htmlPath(htmlPath),
    m_libsPath(libsPath),
    m_stageName(stageName),
    m_nameSpace(nameSpace),
    m_electronPath(electronPath),
    m_html(html),
    m_libs(libs),
    m_images(images),
    m_sounds(sounds),
    m_compactShapes(compactShapes),
    m_compressJS(compressJS),
    m_loopTimeline(loopTimeline),
    m_electron(electron),
    m_shapeElem(NULL),
    m_pathArray(NULL),
    m_pathElem(NULL),
    m_firstSegment(false),
    m_imageFileNameLabel(0),
    m_soundFileNameLabel(0),
    m_imageFolderCreated(false),
    m_soundFolderCreated(false),
    m_dataPrecision(dataPrecision)
    {
        m_pRootNode = new JSONNode(JSON_NODE);
        ASSERT(m_pRootNode);
        m_pRootNode->set_name("DOMDocument");
        
        m_pShapeArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pShapeArray);
        m_pShapeArray->set_name("Shape");
        
        m_pTimelineArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pTimelineArray);
        m_pTimelineArray->set_name("Timeline");
        
        m_pBitmapArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pBitmapArray);
        m_pBitmapArray->set_name("Bitmaps");
        
        m_pTextArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pTextArray);
        m_pTextArray->set_name("Text");
        
        m_pSoundArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pSoundArray);
        m_pSoundArray->set_name("Sounds");
        m_strokeStyle.type = INVALID_STROKE_STYLE_TYPE;
    }
    
    
    JSONOutputWriter::~JSONOutputWriter()
    {
        delete m_pBitmapArray;
        delete m_pSoundArray;
        
        delete m_pTimelineArray;
        
        delete m_pShapeArray;
        
        delete m_pTextArray;
        
        delete m_pRootNode;
    }
    
    
    FCM::Result JSONOutputWriter::StartDefinePath()
    {
        m_pathCmdStr.append(moveTo);
        
        // Jibo (mlb) - disabling the minified stuff for right now.
        //        if (!m_minify)
        //        {
        m_pathCmdStr.append(space);
        //        }
        
        m_firstSegment = true;
        
        return FCM_SUCCESS;
    }
    
    FCM::Result JSONOutputWriter::EndDefinePath()
    {
        // No need to do anything
        return FCM_SUCCESS;
    }

    
    FCM::Result JSONOutputWriter::PostPublishStep(const std::string& outputFolder, FCM::PIFCMCallback pCallback)
    {
        // No-op
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

    
    FCM::Result JSONOutputWriter::CreateImageFileName(const std::string& libPathName, std::string& name)
    {
        std::string str;
        size_t pos;
        std::string fileLabel;
        
        fileLabel = Utils::ToString(m_imageFileNameLabel);
        name = "Image" + fileLabel;
        m_imageFileNameLabel++;
        
        str = libPathName;
        
        // DOM APIs do not provide a way to get the compression of the image.
        // For time being, we will use the extension of the library item name.
        pos = str.rfind(".");
        if (pos != std::string::npos)
        {
            if (str.substr(pos + 1) == "jpg")
            {
                name += ".jpg";
            }
            else if (str.substr(pos + 1) == "png")
            {
                name += ".png";
            }
            else
            {
                name += ".png";
            }
        }
        else
        {
            name += ".png";
        }
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result JSONOutputWriter::CreateSoundFileName(const std::string& libPathName, std::string& name)
    {
        std::string str;
        size_t pos;
        std::string fileLabel;
        
        fileLabel = Utils::ToString(m_soundFileNameLabel);
        name = "Sound" + fileLabel;
        m_soundFileNameLabel++;
        
        str = libPathName;
        
        // DOM APIs do not provide a way to get the compression of the sound.
        // For time being, we will use the extension of the library item name.
        pos = str.rfind(".");
        if (pos != std::string::npos)
        {
            if (str.substr(pos + 1) == "wav")
            {
                name += ".WAV";
            }
            else if (str.substr(pos + 1) == "mp3")
            {
                name += ".MP3";
            }
            else
            {
                name += ".MP3";
            }
        }
        else
        {
            name += ".MP3";
        }
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Boolean JSONOutputWriter::GetImageExportFileName(const std::string& libPathName, std::string& name)
    {
        std::map<std::string, std::string>::iterator it = m_imageMap.find(libPathName);
        
        name = "";
        
        if (it != m_imageMap.end())
        {
            // Image already exported
            name = it->second;
            return true;
        }
        
        return false;
    }
    
    
    void JSONOutputWriter::SetImageExportFileName(const std::string& libPathName, const std::string& name)
    {
        // Assumption: Name is not already present in the map
        ASSERT(m_imageMap.find(libPathName) == m_imageMap.end());
        
        m_imageMap.insert(std::pair<std::string, std::string>(libPathName, name));
    }

    bool JSONOutputWriter::SaveFromTemplate(const std::string &templatePath, const std::string &outputPath)
    {
        std::ifstream inFile(templatePath.c_str());
        if (!inFile)
        {
            return false;
        }
        std::stringstream strStream;
        strStream << inFile.rdbuf();
        std::string content(strStream.str());

        std::map<std::string, std::string>::const_iterator i;
        for(i = m_substitutions.begin(); i != m_substitutions.end(); i++)
        {
            ReplaceAll("${" + i->first + "}", i->second, content);
        }

        // Save the file
        Save(outputPath, content);

        return true;
    }

    void JSONOutputWriter::ReplaceAll(const std::string &from, const std::string &to, std::string& content)
    {
        size_t start_pos = 0;
        while((start_pos = content.find(from, start_pos)) != std::string::npos)
        {
            content.replace(start_pos, from.length(), to);
            start_pos += to.length();
        }
    }

    void JSONOutputWriter::Save(const std::string &outputFile, const std::string &content)
    {
        std::fstream file;
        Utils::OpenFStream(outputFile, file, std::ios_base::trunc|std::ios_base::out, m_pCallback);
        file << content;
        file.close();
    }
};
