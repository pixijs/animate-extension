//
//  OutputWriterBase.cpp
//  PixiAnimateExtension.mp
//
//  Created by Matt Bittarelli on 11/24/15.
//
//

#include "Writers/OutputWriterBase.h"

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
    
    /* -------------------------------------------------- OutputWriterBase */
    
    FCM::Result OutputWriterBase::StartOutput(std::string& outputFileName)
    {
        std::string parent;
        std::string jsonFile;
        
        Utils::GetParent(outputFileName, parent);
        Utils::GetFileNameWithoutExtension(outputFileName, jsonFile);
        m_outputHTMLFile = outputFileName;
        m_outputJSONFileName = jsonFile + ".json";
        m_outputJSONFilePath = parent + jsonFile + ".json";
        m_outputImageFolder = parent + IMAGE_FOLDER;
        m_outputSoundFolder = parent + SOUND_FOLDER;
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result OutputWriterBase::EndOutput()
    {
        
        return FCM_SUCCESS;
    }
    
    // no-op. subclasses should implement this method
    FCM::Result OutputWriterBase::StartDocument(const DOM::Utils::COLOR& background,
                                                FCM::U_Int32 stageHeight,
                                                FCM::U_Int32 stageWidth,
                                                FCM::U_Int32 fps)
    {
        return FCM_SUCCESS;
    }
    
    FCM::Result OutputWriterBase::EndDocument()
    {
        std::fstream file;
        m_pRootNode->push_back(*m_pShapeArray);
        m_pRootNode->push_back(*m_pBitmapArray);
        m_pRootNode->push_back(*m_pSoundArray);
        m_pRootNode->push_back(*m_pTextArray);
        m_pRootNode->push_back(*m_pTimelineArray);
        
        // Write the JSON file (overwrite file if it already exists)
        Utils::OpenFStream(m_outputJSONFilePath, file, std::ios_base::trunc|std::ios_base::out, m_pCallback);
        
        JSONNode firstNode(JSON_NODE);
        firstNode.push_back(*m_pRootNode);
        
        // Jibo (mlb) - disabling the minified stuff for right now.
#if 0
        if (m_minify)
        {
            // Minify JSON
            file << firstNode.write();
        }
        else
        {
            // Pretty printing of JSON
            file << firstNode.write_formatted();
        }
#endif
        
        // Pretty printing of JSON
        file << firstNode.write_formatted();
        
        file.close();
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result OutputWriterBase::StartDefineTimeline()
    {
        return FCM_SUCCESS;
    }
    
    
    FCM::Result OutputWriterBase::EndDefineTimeline(
                                                    FCM::U_Int32 resId,
                                                    FCM::StringRep16 pName,
                                                    ITimelineWriter* pTimelineWriter)
    {
        JSONTimelineWriter* pWriter = static_cast<JSONTimelineWriter*> (pTimelineWriter);
        
        pWriter->Finish(resId, pName);
        
        m_pTimelineArray->push_back(*(pWriter->GetRoot()));
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result OutputWriterBase::StartDefineShape()
    {
        m_shapeElem = new JSONNode(JSON_NODE);
        ASSERT(m_shapeElem);
        
        m_pathArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pathArray);
        m_pathArray->set_name("path");
        
        return FCM_SUCCESS;
    }
    
    
    // Marks the end of a shape
    FCM::Result OutputWriterBase::EndDefineShape(FCM::U_Int32 resId)
    {
        m_shapeElem->push_back(JSONNode(("charid"), PixiJS::Utils::ToString(resId)));
        m_shapeElem->push_back(*m_pathArray);
        
        m_pShapeArray->push_back(*m_shapeElem);
        
        delete m_pathArray;
        delete m_shapeElem;
        
        return FCM_SUCCESS;
    }
    
    
    // Start of fill region definition
    FCM::Result OutputWriterBase::StartDefineFill()
    {
        m_pathElem = new JSONNode(JSON_NODE);
        ASSERT(m_pathElem);
        
        m_pathCmdStr.clear();
        
        return FCM_SUCCESS;
    }
    
    
    // Solid fill style definition
    FCM::Result OutputWriterBase::DefineSolidFillStyle(const DOM::Utils::COLOR& color)
    {
        std::string colorStr = Utils::ToString(color);
        std::string colorOpacityStr = PixiJS::Utils::ToString((float)(color.alpha / 255.0), m_dataPrecision);
        
        m_pathElem->push_back(JSONNode("color", colorStr.c_str()));
        m_pathElem->push_back(JSONNode("colorOpacity", colorOpacityStr.c_str()));
        
        return FCM_SUCCESS;
    }
    
    
    // Bitmap fill style definition
    FCM::Result OutputWriterBase::DefineBitmapFillStyle(
                                                        FCM::Boolean clipped,
                                                        const DOM::Utils::MATRIX2D& matrix,
                                                        FCM::S_Int32 height,
                                                        FCM::S_Int32 width,
                                                        const std::string& libPathName,
                                                        DOM::LibraryItem::PIMediaItem pMediaItem)
    {
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
        bitmapRelPath += IMAGE_FOLDER;
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
    FCM::Result OutputWriterBase::StartDefineLinearGradientFillStyle(
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
    FCM::Result OutputWriterBase::SetKeyColorPoint(
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
    FCM::Result OutputWriterBase::EndDefineLinearGradientFillStyle()
    {
        m_gradientColor->push_back(*m_stopPointArray);
        m_pathElem->push_back(*m_gradientColor);
        
        delete m_stopPointArray;
        delete m_gradientColor;
        
        return FCM_SUCCESS;
    }
    
    
    // Start Radial Gradient fill style definition
    FCM::Result OutputWriterBase::StartDefineRadialGradientFillStyle(
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
    FCM::Result OutputWriterBase::EndDefineRadialGradientFillStyle()
    {
        m_gradientColor->push_back(*m_stopPointArray);
        m_pathElem->push_back(*m_gradientColor);
        
        delete m_stopPointArray;
        delete m_gradientColor;
        
        return FCM_SUCCESS;
    }
    
    
    // Start of fill region boundary
    FCM::Result OutputWriterBase::StartDefineBoundary()
    {
        return StartDefinePath();
    }
    
    
    // Sets a segment of a path (Used for boundary, holes)
    FCM::Result OutputWriterBase::SetSegment(const DOM::Utils::SEGMENT& segment)
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
    FCM::Result OutputWriterBase::EndDefineBoundary()
    {
        return EndDefinePath();
    }
    
    
    // Start of fill region hole
    FCM::Result OutputWriterBase::StartDefineHole()
    {
        return StartDefinePath();
    }
    
    
    // End of fill region hole
    FCM::Result OutputWriterBase::EndDefineHole()
    {
        return EndDefinePath();
    }
    
    
    // Start of stroke group
    FCM::Result OutputWriterBase::StartDefineStrokeGroup()
    {
        // No need to do anything
        return FCM_SUCCESS;
    }
    
    
    // Start solid stroke style definition
    FCM::Result OutputWriterBase::StartDefineSolidStrokeStyle(
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
    FCM::Result OutputWriterBase::EndDefineSolidStrokeStyle()
    {
        // No need to do anything
        return FCM_SUCCESS;
    }
    
    
    // Start of stroke
    FCM::Result OutputWriterBase::StartDefineStroke()
    {
        m_pathElem = new JSONNode(JSON_NODE);
        ASSERT(m_pathElem);
        
        m_pathCmdStr.clear();
        StartDefinePath();
        
        return FCM_SUCCESS;
    }
    
    
    // End of a stroke
    FCM::Result OutputWriterBase::EndDefineStroke()
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
    FCM::Result OutputWriterBase::EndDefineStrokeGroup()
    {
        // No need to do anything
        return FCM_SUCCESS;
    }
    
    
    // End of fill style definition
    FCM::Result OutputWriterBase::EndDefineFill()
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
    FCM::Result OutputWriterBase::DefineBitmap(
                                               FCM::U_Int32 resId,
                                               FCM::S_Int32 height,
                                               FCM::S_Int32 width,
                                               const std::string& libPathName,
                                               DOM::LibraryItem::PIMediaItem pMediaItem)
    {
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
        bitmapRelPath += IMAGE_FOLDER;
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
    
    
    FCM::Result OutputWriterBase::StartDefineClassicText(
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
    
    
    FCM::Result OutputWriterBase::StartDefineParagraph(
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
    
    
    FCM::Result OutputWriterBase::StartDefineTextRun(
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
    
    
    FCM::Result OutputWriterBase::EndDefineTextRun()
    {
        return FCM_SUCCESS;
    }
    
    
    FCM::Result OutputWriterBase::EndDefineParagraph()
    {
        m_pTextPara->push_back(*m_pTextRunArray);
        delete m_pTextRunArray;
        m_pTextRunArray = NULL;
        
        m_pTextParaArray->push_back(*m_pTextPara);
        delete m_pTextPara;
        m_pTextPara = NULL;
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result OutputWriterBase::EndDefineClassicText()
    {
        m_pTextElem->push_back(*m_pTextParaArray);
        
        delete m_pTextParaArray;
        m_pTextParaArray = NULL;
        
        m_pTextArray->push_back(*m_pTextElem);
        
        delete m_pTextElem;
        m_pTextElem = NULL;
        
        return FCM_SUCCESS;
    }
    
    
    FCM::Result OutputWriterBase::DefineSound(
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
        soundRelPath += SOUND_FOLDER;
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
    
    OutputWriterBase::OutputWriterBase(
                                       FCM::PIFCMCallback pCallback,
                                       bool minify,
                                       DataPrecision dataPrecision)
    : m_pCallback(pCallback),
    m_shapeElem(NULL),
    m_pathArray(NULL),
    m_pathElem(NULL),
    m_firstSegment(false),
    m_HTMLOutput(NULL),
    m_imageFileNameLabel(0),
    m_soundFileNameLabel(0),
    m_imageFolderCreated(false),
    m_soundFolderCreated(false),
    m_minify(minify),
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
    
    
    OutputWriterBase::~OutputWriterBase()
    {
        delete m_pBitmapArray;
        delete m_pSoundArray;
        
        delete m_pTimelineArray;
        
        delete m_pShapeArray;
        
        delete m_pTextArray;
        
        delete m_pRootNode;
    }
    
    
    FCM::Result OutputWriterBase::StartDefinePath()
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
    
    FCM::Result OutputWriterBase::EndDefinePath()
    {
        // No need to do anything
        return FCM_SUCCESS;
    }

    
    FCM::Result OutputWriterBase::PostPublishStep(const std::string& outputFolder, FCM::PIFCMCallback pCallback)
    {
        // No-op
        return FCM_SUCCESS;
    }
    
    FCM::Result OutputWriterBase::StartPreview(const std::string& outFile, FCM::PIFCMCallback pCallback)
    {
        // No-op
        return FCM_SUCCESS;
    }
    
    FCM::Result OutputWriterBase::StopPreview(const std::string& outFile)
    {
        // No-op
        return FCM_SUCCESS;
    }

    
    FCM::Result OutputWriterBase::CreateImageFileName(const std::string& libPathName, std::string& name)
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
    
    
    FCM::Result OutputWriterBase::CreateSoundFileName(const std::string& libPathName, std::string& name)
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
    
    
    FCM::Boolean OutputWriterBase::GetImageExportFileName(const std::string& libPathName, std::string& name)
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
    
    
    void OutputWriterBase::SetImageExportFileName(const std::string& libPathName, const std::string& name)
    {
        // Assumption: Name is not already present in the map
        ASSERT(m_imageMap.find(libPathName) == m_imageMap.end());
        
        m_imageMap.insert(std::pair<std::string, std::string>(libPathName, name));
    }
};
