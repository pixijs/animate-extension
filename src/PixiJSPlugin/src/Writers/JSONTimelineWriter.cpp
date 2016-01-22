//
//  JSONTimelineWriter.cpp
//  PixiJSPlugin.mp
//
//  Created by Matt Bittarelli on 11/23/15.
//
//

#include "Writers/JSONTimelineWriter.h"
#include "JSONNode.h"
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

namespace PixiJS
{
    FCM::Result JSONTimelineWriter::PlaceObject(
                                                FCM::U_Int32 resId,
                                                FCM::U_Int32 objectId,
                                                FCM::U_Int32 placeAfterObjectId,
                                                const DOM::Utils::MATRIX2D* pMatrix,
                                                const DOM::Utils::RECT* pRect /* = NULL */)
    {
        JSONNode commandElement(JSON_NODE);
        
        commandElement.push_back(JSONNode("cmdType", "Place"));
        commandElement.push_back(JSONNode("charid", PixiJS::Utils::ToString(resId)));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        commandElement.push_back(JSONNode("placeAfter", PixiJS::Utils::ToString(placeAfterObjectId)));
        
        if (pMatrix)
        {
            commandElement.push_back(JSONNode("transformMatrix", Utils::ToString(*pMatrix, m_dataPrecision).c_str()));
        }
        
        if (pRect)
        {
            commandElement.push_back(JSONNode("bounds", Utils::ToString(*pRect, m_dataPrecision).c_str()));
        }
        
        m_pCommandArray->push_back(commandElement);
        
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::PlaceObject(
                                                FCM::U_Int32 resId,
                                                FCM::U_Int32 objectId,
                                                FCM::U_Int32 placeAfterObjectId,
                                                const DOM::Utils::MATRIX2D* pMatrix,
                                                FCM::Boolean loop,
                                                FCM::PIFCMUnknown pUnknown)
    {
        JSONNode commandElement(JSON_NODE);
        
        commandElement.push_back(JSONNode("cmdType", "Place"));
        commandElement.push_back(JSONNode("charid", PixiJS::Utils::ToString(resId)));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        commandElement.push_back(JSONNode("placeAfter", PixiJS::Utils::ToString(placeAfterObjectId)));
        
        if (pMatrix)
        {
            commandElement.push_back(JSONNode("transformMatrix", Utils::ToString(*pMatrix, m_dataPrecision).c_str()));
        }
        
        commandElement.push_back(JSONNode("loop", loop ? "true" : "false"));
        m_pCommandArray->push_back(commandElement);
        
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::PlaceObject(
                                                FCM::U_Int32 resId,
                                                FCM::U_Int32 objectId,
                                                FCM::PIFCMUnknown pUnknown /* = NULL*/)
    {
        FCM::Result res;
        
        JSONNode commandElement(JSON_NODE);
        FCM::AutoPtr<DOM::FrameElement::ISound> pSound;
        
        commandElement.push_back(JSONNode("cmdType", "Place"));
        commandElement.push_back(JSONNode("charid", PixiJS::Utils::ToString(resId)));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        
        pSound = pUnknown;
        if (pSound)
        {
            DOM::FrameElement::SOUND_LOOP_MODE lMode;
            DOM::FrameElement::SOUND_LIMIT soundLimit;
            DOM::FrameElement::SoundSyncMode syncMode;
            
            soundLimit.structSize = sizeof(DOM::FrameElement::SOUND_LIMIT);
            lMode.structSize = sizeof(DOM::FrameElement::SOUND_LOOP_MODE);
            
            res = pSound->GetLoopMode(lMode);
            ASSERT(FCM_SUCCESS_CODE(res));
            
            commandElement.push_back(JSONNode("loopMode",
                                              PixiJS::Utils::ToString(lMode.loopMode)));
            commandElement.push_back(JSONNode("repeatCount",
                                              PixiJS::Utils::ToString(lMode.repeatCount)));
            
            res = pSound->GetSyncMode(syncMode);
            ASSERT(FCM_SUCCESS_CODE(res));
            
            commandElement.push_back(JSONNode("syncMode",
                                              PixiJS::Utils::ToString(syncMode)));
            
            // We should not get SOUND_SYNC_STOP as for stop, "RemoveObject" command will
            // be generated by Exporter Service.
            ASSERT(syncMode != DOM::FrameElement::SOUND_SYNC_STOP);
            
            res = pSound->GetSoundLimit(soundLimit);
            ASSERT(FCM_SUCCESS_CODE(res));
            
            commandElement.push_back(JSONNode("LimitInPos44",
                                              PixiJS::Utils::ToString(soundLimit.inPos44)));
            commandElement.push_back(JSONNode("LimitOutPos44",
                                              PixiJS::Utils::ToString(soundLimit.outPos44)));
        }
        
        m_pCommandArray->push_back(commandElement);
        
        return res;
    }


    FCM::Result JSONTimelineWriter::RemoveObject(
                                                 FCM::U_Int32 objectId)
    {
        JSONNode commandElement(JSON_NODE);
        
        commandElement.push_back(JSONNode("cmdType", "Remove"));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        
        m_pCommandArray->push_back(commandElement);
        
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::UpdateZOrder(
                                                 FCM::U_Int32 objectId,
                                                 FCM::U_Int32 placeAfterObjectId)
    {
        JSONNode commandElement(JSON_NODE);
        
        commandElement.push_back(JSONNode("cmdType", "UpdateZOrder"));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        commandElement.push_back(JSONNode("placeAfter", PixiJS::Utils::ToString(placeAfterObjectId)));
        
        m_pCommandArray->push_back(commandElement);
        
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::UpdateMask(
                                               FCM::U_Int32 objectId,
                                               FCM::U_Int32 maskTillObjectId)
    {
        MaskInfo info;
        
        info.maskTillObjectId = maskTillObjectId;
        info.objectId = objectId;
        
        maskInfoList.push_back(info);
        
        return FCM_SUCCESS;
    }

    FCM::Result JSONTimelineWriter::DeferUpdateMask(
                                                    FCM::U_Int32 objectId,
                                                    FCM::U_Int32 maskTillObjectId)
    {
        JSONNode commandElement(JSON_NODE);
        
        commandElement.push_back(JSONNode("cmdType", "UpdateMask"));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        commandElement.push_back(JSONNode("maskTill", PixiJS::Utils::ToString(maskTillObjectId)));
        
        m_pCommandArray->push_back(commandElement);
        
        return FCM_SUCCESS;
    }

    FCM::Result JSONTimelineWriter::DeferUpdateMasks()
    {
        JSONNode commandElement(JSON_NODE);
        
        for (FCM::U_Int32 i = 0; i < maskInfoList.size(); i++)
        {
            MaskInfo& info = maskInfoList.at(i);
            DeferUpdateMask(info.objectId, info.maskTillObjectId);
        }
        
        maskInfoList.clear();
        
        return FCM_SUCCESS;
    }

    FCM::Result JSONTimelineWriter::UpdateBlendMode(
                                                    FCM::U_Int32 objectId,
                                                    DOM::FrameElement::BlendMode blendMode)
    {
        JSONNode commandElement(JSON_NODE);
        
        commandElement.push_back(JSONNode("cmdType", "UpdateBlendMode"));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        if(blendMode == 0)
            commandElement.push_back(JSONNode("blendMode","Normal"));
        else if(blendMode == 1)
            commandElement.push_back(JSONNode("blendMode","Layer"));
        else if(blendMode == 2)
            commandElement.push_back(JSONNode("blendMode","Darken"));
        else if(blendMode == 3)
            commandElement.push_back(JSONNode("blendMode","Multiply"));
        else if(blendMode == 4)
            commandElement.push_back(JSONNode("blendMode","Lighten"));
        else if(blendMode == 5)
            commandElement.push_back(JSONNode("blendMode","Screen"));
        else if(blendMode == 6)
            commandElement.push_back(JSONNode("blendMode","Overlay"));
        else if(blendMode == 7)
            commandElement.push_back(JSONNode("blendMode","Hardlight"));
        else if(blendMode == 8)
            commandElement.push_back(JSONNode("blendMode","Add"));
        else if(blendMode == 9)
            commandElement.push_back(JSONNode("blendMode","Substract"));
        else if(blendMode == 10)
            commandElement.push_back(JSONNode("blendMode","Difference"));
        else if(blendMode == 11)
            commandElement.push_back(JSONNode("blendMode","Invert"));
        else if(blendMode == 12)
            commandElement.push_back(JSONNode("blendMode","Alpha"));
        else if(blendMode == 13)
            commandElement.push_back(JSONNode("blendMode","Erase"));
        
        m_pCommandArray->push_back(commandElement);
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::UpdateVisibility(
                                                     FCM::U_Int32 objectId,
                                                     FCM::Boolean visible)
    {
        JSONNode commandElement(JSON_NODE);
        
        commandElement.push_back(JSONNode("cmdType", "UpdateVisibility"));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        
        if (visible)
        {
            commandElement.push_back(JSONNode("visibility", "true"));
        }
        else
        {
            commandElement.push_back(JSONNode("visibility", "false"));
        }
        
        m_pCommandArray->push_back(commandElement);
        
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::AddGraphicFilter(
                                                     FCM::U_Int32 objectId,
                                                     FCM::PIFCMUnknown pFilter)
    {
        FCM::Result res;
        JSONNode commandElement(JSON_NODE);
        commandElement.push_back(JSONNode("cmdType", "UpdateFilter"));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        FCM::AutoPtr<DOM::GraphicFilter::IDropShadowFilter> pDropShadowFilter = pFilter;
        FCM::AutoPtr<DOM::GraphicFilter::IBlurFilter> pBlurFilter = pFilter;
        FCM::AutoPtr<DOM::GraphicFilter::IGlowFilter> pGlowFilter = pFilter;
        FCM::AutoPtr<DOM::GraphicFilter::IBevelFilter> pBevelFilter = pFilter;
        FCM::AutoPtr<DOM::GraphicFilter::IGradientGlowFilter> pGradientGlowFilter = pFilter;
        FCM::AutoPtr<DOM::GraphicFilter::IGradientBevelFilter> pGradientBevelFilter = pFilter;
        FCM::AutoPtr<DOM::GraphicFilter::IAdjustColorFilter> pAdjustColorFilter = pFilter;
        
        if (pDropShadowFilter)
        {
            FCM::Boolean enabled;
            FCM::Double  angle;
            FCM::Double  blurX;
            FCM::Double  blurY;
            FCM::Double  distance;
            FCM::Boolean hideObject;
            FCM::Boolean innerShadow;
            FCM::Boolean knockOut;
            DOM::Utils::FilterQualityType qualityType;
            DOM::Utils::COLOR color;
            FCM::S_Int32 strength;
            std::string colorStr;
            
            commandElement.push_back(JSONNode("filterType", "DropShadowFilter"));
            
            pDropShadowFilter->IsEnabled(enabled);
            if(enabled)
            {
                commandElement.push_back(JSONNode("enabled", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("enabled", "false"));
            }
            
            res = pDropShadowFilter->GetAngle(angle);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("angle",
                                              PixiJS::Utils::ToString((double)angle, m_dataPrecision)));
            
            res = pDropShadowFilter->GetBlurX(blurX);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurX",
                                              PixiJS::Utils::ToString((double)blurX, m_dataPrecision)));
            
            res = pDropShadowFilter->GetBlurY(blurY);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurY",
                                              PixiJS::Utils::ToString((double)blurY, m_dataPrecision)));
            
            res = pDropShadowFilter->GetDistance(distance);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("distance",
                                              PixiJS::Utils::ToString((double)distance, m_dataPrecision)));
            
            res = pDropShadowFilter->GetHideObject(hideObject);
            ASSERT(FCM_SUCCESS_CODE(res));
            if(hideObject)
            {
                commandElement.push_back(JSONNode("hideObject", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("hideObject", "false"));
            }
            
            res = pDropShadowFilter->GetInnerShadow(innerShadow);
            ASSERT(FCM_SUCCESS_CODE(res));
            if(innerShadow)
            {
                commandElement.push_back(JSONNode("innerShadow", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("innerShadow", "false"));
            }
            
            res = pDropShadowFilter->GetKnockout(knockOut);
            ASSERT(FCM_SUCCESS_CODE(res));
            if(knockOut)
            {
                commandElement.push_back(JSONNode("knockOut", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("knockOut", "false"));
            }
            
            res = pDropShadowFilter->GetQuality(qualityType);
            ASSERT(FCM_SUCCESS_CODE(res));
            if (qualityType == 0)
                commandElement.push_back(JSONNode("qualityType", "low"));
            else if (qualityType == 1)
                commandElement.push_back(JSONNode("qualityType", "medium"));
            else if (qualityType == 2)
                commandElement.push_back(JSONNode("qualityType", "high"));
            
            res = pDropShadowFilter->GetStrength(strength);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("strength", PixiJS::Utils::ToString(strength)));
            
            res = pDropShadowFilter->GetShadowColor(color);
            ASSERT(FCM_SUCCESS_CODE(res));
            colorStr = Utils::ToString(color);
            commandElement.push_back(JSONNode("shadowColor", colorStr.c_str()));
            
        }
        if(pBlurFilter)
        {
            FCM::Boolean enabled;
            FCM::Double  blurX;
            FCM::Double  blurY;
            DOM::Utils::FilterQualityType qualityType;
            
            
            commandElement.push_back(JSONNode("filterType", "BlurFilter"));
            
            res = pBlurFilter->IsEnabled(enabled);
            if(enabled)
            {
                commandElement.push_back(JSONNode("enabled", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("enabled", "false"));
            }
            
            res = pBlurFilter->GetBlurX(blurX);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurX",
                                              PixiJS::Utils::ToString((double)blurX, m_dataPrecision)));
            
            res = pBlurFilter->GetBlurY(blurY);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurY",
                                              PixiJS::Utils::ToString((double)blurY, m_dataPrecision)));
            
            res = pBlurFilter->GetQuality(qualityType);
            ASSERT(FCM_SUCCESS_CODE(res));
            if (qualityType == 0)
                commandElement.push_back(JSONNode("qualityType", "low"));
            else if (qualityType == 1)
                commandElement.push_back(JSONNode("qualityType", "medium"));
            else if (qualityType == 2)
                commandElement.push_back(JSONNode("qualityType", "high"));
        }
        
        if(pGlowFilter)
        {
            FCM::Boolean enabled;
            FCM::Double  blurX;
            FCM::Double  blurY;
            FCM::Boolean innerShadow;
            FCM::Boolean knockOut;
            DOM::Utils::FilterQualityType qualityType;
            DOM::Utils::COLOR color;
            FCM::S_Int32 strength;
            std::string colorStr;
            
            commandElement.push_back(JSONNode("filterType", "GlowFilter"));
            
            res = pGlowFilter->IsEnabled(enabled);
            if(enabled)
            {
                commandElement.push_back(JSONNode("enabled", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("enabled", "false"));
            }
            
            res = pGlowFilter->GetBlurX(blurX);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurX",
                                              PixiJS::Utils::ToString((double)blurX, m_dataPrecision)));
            
            res = pGlowFilter->GetBlurY(blurY);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurY",
                                              PixiJS::Utils::ToString((double)blurY, m_dataPrecision)));
            
            res = pGlowFilter->GetInnerShadow(innerShadow);
            ASSERT(FCM_SUCCESS_CODE(res));
            if(innerShadow)
            {
                commandElement.push_back(JSONNode("innerShadow", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("innerShadow", "false"));
            }
            
            res = pGlowFilter->GetKnockout(knockOut);
            ASSERT(FCM_SUCCESS_CODE(res));
            if(knockOut)
            {
                commandElement.push_back(JSONNode("knockOut", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("knockOut", "false"));
            }
            
            res = pGlowFilter->GetQuality(qualityType);
            ASSERT(FCM_SUCCESS_CODE(res));
            if (qualityType == 0)
                commandElement.push_back(JSONNode("qualityType", "low"));
            else if (qualityType == 1)
                commandElement.push_back(JSONNode("qualityType", "medium"));
            else if (qualityType == 2)
                commandElement.push_back(JSONNode("qualityType", "high"));
            
            res = pGlowFilter->GetStrength(strength);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("strength", PixiJS::Utils::ToString(strength)));
            
            res = pGlowFilter->GetShadowColor(color);
            ASSERT(FCM_SUCCESS_CODE(res));
            colorStr = Utils::ToString(color);
            commandElement.push_back(JSONNode("shadowColor", colorStr.c_str()));
        }
        
        if(pBevelFilter)
        {
            FCM::Boolean enabled;
            FCM::Double  angle;
            FCM::Double  blurX;
            FCM::Double  blurY;
            FCM::Double  distance;
            DOM::Utils::COLOR highlightColor;
            FCM::Boolean knockOut;
            DOM::Utils::FilterQualityType qualityType;
            DOM::Utils::COLOR color;
            FCM::S_Int32 strength;
            DOM::Utils::FilterType filterType;
            std::string colorStr;
            std::string colorString;
            
            commandElement.push_back(JSONNode("filterType", "BevelFilter"));
            
            res = pBevelFilter->IsEnabled(enabled);
            if(enabled)
            {
                commandElement.push_back(JSONNode("enabled", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("enabled", "false"));
            }
            
            res = pBevelFilter->GetAngle(angle);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("angle",
                                              PixiJS::Utils::ToString((double)angle, m_dataPrecision)));
            
            res = pBevelFilter->GetBlurX(blurX);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurX",
                                              PixiJS::Utils::ToString((double)blurX, m_dataPrecision)));
            
            res = pBevelFilter->GetBlurY(blurY);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurY",
                                              PixiJS::Utils::ToString((double)blurY, m_dataPrecision)));
            
            res = pBevelFilter->GetDistance(distance);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("distance",
                                              PixiJS::Utils::ToString((double)distance, m_dataPrecision)));
            
            res = pBevelFilter->GetHighlightColor(highlightColor);
            ASSERT(FCM_SUCCESS_CODE(res));
            colorString = Utils::ToString(highlightColor);
            commandElement.push_back(JSONNode("highlightColor",colorString.c_str()));
            
            res = pBevelFilter->GetKnockout(knockOut);
            ASSERT(FCM_SUCCESS_CODE(res));
            if(knockOut)
            {
                commandElement.push_back(JSONNode("knockOut", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("knockOut", "false"));
            }
            
            res = pBevelFilter->GetQuality(qualityType);
            ASSERT(FCM_SUCCESS_CODE(res));
            if (qualityType == 0)
                commandElement.push_back(JSONNode("qualityType", "low"));
            else if (qualityType == 1)
                commandElement.push_back(JSONNode("qualityType", "medium"));
            else if (qualityType == 2)
                commandElement.push_back(JSONNode("qualityType", "high"));
            
            res = pBevelFilter->GetStrength(strength);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("strength", PixiJS::Utils::ToString(strength)));
            
            res = pBevelFilter->GetShadowColor(color);
            ASSERT(FCM_SUCCESS_CODE(res));
            colorStr = Utils::ToString(color);
            commandElement.push_back(JSONNode("shadowColor", colorStr.c_str()));
            
            res = pBevelFilter->GetFilterType(filterType);
            ASSERT(FCM_SUCCESS_CODE(res));
            if (filterType == 0)
                commandElement.push_back(JSONNode("filterType", "inner"));
            else if (filterType == 1)
                commandElement.push_back(JSONNode("filterType", "outer"));
            else if (filterType == 2)
                commandElement.push_back(JSONNode("filterType", "full"));
            
        }
        
        if(pGradientGlowFilter)
        {
            FCM::Boolean enabled;
            FCM::Double  angle;
            FCM::Double  blurX;
            FCM::Double  blurY;
            FCM::Double  distance;
            FCM::Boolean knockOut;
            DOM::Utils::FilterQualityType qualityType;
            FCM::S_Int32 strength;
            DOM::Utils::FilterType filterType;
            
            commandElement.push_back(JSONNode("filterType", "GradientGlowFilter"));
            
            pGradientGlowFilter->IsEnabled(enabled);
            if(enabled)
            {
                commandElement.push_back(JSONNode("enabled", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("enabled", "false"));
            }
            
            res = pGradientGlowFilter->GetAngle(angle);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("angle",
                                              PixiJS::Utils::ToString((double)angle, m_dataPrecision)));
            
            res = pGradientGlowFilter->GetBlurX(blurX);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurX",
                                              PixiJS::Utils::ToString((double)blurX, m_dataPrecision)));
            
            res = pGradientGlowFilter->GetBlurY(blurY);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurY",
                                              PixiJS::Utils::ToString((double)blurY, m_dataPrecision)));
            
            res = pGradientGlowFilter->GetDistance(distance);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("distance",
                                              PixiJS::Utils::ToString((double)distance, m_dataPrecision)));
            
            res = pGradientGlowFilter->GetKnockout(knockOut);
            ASSERT(FCM_SUCCESS_CODE(res));
            if(knockOut)
            {
                commandElement.push_back(JSONNode("knockOut", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("knockOut", "false"));
            }
            
            res = pGradientGlowFilter->GetQuality(qualityType);
            ASSERT(FCM_SUCCESS_CODE(res));
            if (qualityType == 0)
                commandElement.push_back(JSONNode("qualityType", "low"));
            else if (qualityType == 1)
                commandElement.push_back(JSONNode("qualityType", "medium"));
            else if (qualityType == 2)
                commandElement.push_back(JSONNode("qualityType", "high"));
            
            res = pGradientGlowFilter->GetStrength(strength);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("strength", PixiJS::Utils::ToString(strength)));
            
            res = pGradientGlowFilter->GetFilterType(filterType);
            ASSERT(FCM_SUCCESS_CODE(res));
            if (filterType == 0)
                commandElement.push_back(JSONNode("filterType", "inner"));
            else if (filterType == 1)
                commandElement.push_back(JSONNode("filterType", "outer"));
            else if (filterType == 2)
                commandElement.push_back(JSONNode("filterType", "full"));
            
            FCM::AutoPtr<FCM::IFCMUnknown> pColorGradient;
            res = pGradientGlowFilter->GetGradient(pColorGradient.m_Ptr);
            ASSERT(FCM_SUCCESS_CODE(res));
            
            FCM::AutoPtr<DOM::Utils::ILinearColorGradient> pLinearGradient = pColorGradient;
            if (pLinearGradient)
            {
                
                FCM::U_Int8 colorCount;
                //DOM::Utils::GRADIENT_COLOR_POINT colorPoint;
                
                res = pLinearGradient->GetKeyColorCount(colorCount);
                ASSERT(FCM_SUCCESS_CODE(res));
                
                std::string colorArray ;
                std::string posArray ;
                JSONNode*   stopPointArray = new JSONNode(JSON_ARRAY);
                
                for (FCM::U_Int32 l = 0; l < colorCount; l++)
                {
                    DOM::Utils::GRADIENT_COLOR_POINT colorPoint;
                    pLinearGradient->GetKeyColorAtIndex(l, colorPoint);
                    JSONNode stopEntry(JSON_NODE);
                    FCM::Float offset;
                    
                    offset = (float)((colorPoint.pos * 100) / 255.0);
                    
                    stopEntry.push_back(JSONNode("offset", Utils::ToString((float) offset, m_dataPrecision)));
                    stopEntry.push_back(JSONNode("stopColor", Utils::ToString(colorPoint.color)));
                    stopEntry.push_back(JSONNode("stopOpacity",
                                                 Utils::ToString((float)(colorPoint.color.alpha / 255.0), m_dataPrecision)));
                    stopPointArray->set_name("GradientStops");
                    stopPointArray->push_back(stopEntry);
                }
                
                commandElement.push_back(*stopPointArray);
                
            }//lineargradient
        }
        
        if(pGradientBevelFilter)
        {
            FCM::Boolean enabled;
            FCM::Double  angle;
            FCM::Double  blurX;
            FCM::Double  blurY;
            FCM::Double  distance;
            FCM::Boolean knockOut;
            DOM::Utils::FilterQualityType qualityType;
            FCM::S_Int32 strength;
            DOM::Utils::FilterType filterType;
            
            commandElement.push_back(JSONNode("filterType", "GradientBevelFilter"));
            
            pGradientBevelFilter->IsEnabled(enabled);
            if(enabled)
            {
                commandElement.push_back(JSONNode("enabled", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("enabled", "false"));
            }
            
            res = pGradientBevelFilter->GetAngle(angle);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("angle",
                                              PixiJS::Utils::ToString((double)angle, m_dataPrecision)));
            
            res = pGradientBevelFilter->GetBlurX(blurX);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurX",
                                              PixiJS::Utils::ToString((double)blurX, m_dataPrecision)));
            
            res = pGradientBevelFilter->GetBlurY(blurY);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("blurY",
                                              PixiJS::Utils::ToString((double)blurY, m_dataPrecision)));
            
            res = pGradientBevelFilter->GetDistance(distance);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("distance",
                                              PixiJS::Utils::ToString((double)distance, m_dataPrecision)));
            
            res = pGradientBevelFilter->GetKnockout(knockOut);
            ASSERT(FCM_SUCCESS_CODE(res));
            if(knockOut)
            {
                commandElement.push_back(JSONNode("knockOut", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("knockOut", "false"));
            }
            
            res = pGradientBevelFilter->GetQuality(qualityType);
            ASSERT(FCM_SUCCESS_CODE(res));
            if (qualityType == 0)
                commandElement.push_back(JSONNode("qualityType", "low"));
            else if (qualityType == 1)
                commandElement.push_back(JSONNode("qualityType", "medium"));
            else if (qualityType == 2)
                commandElement.push_back(JSONNode("qualityType", "high"));
            
            res = pGradientBevelFilter->GetStrength(strength);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("strength", PixiJS::Utils::ToString(strength)));
            
            res = pGradientBevelFilter->GetFilterType(filterType);
            ASSERT(FCM_SUCCESS_CODE(res));
            if (filterType == 0)
                commandElement.push_back(JSONNode("filterType", "inner"));
            else if (filterType == 1)
                commandElement.push_back(JSONNode("filterType", "outer"));
            else if (filterType == 2)
                commandElement.push_back(JSONNode("filterType", "full"));
            
            FCM::AutoPtr<FCM::IFCMUnknown> pColorGradient;
            res = pGradientBevelFilter->GetGradient(pColorGradient.m_Ptr);
            ASSERT(FCM_SUCCESS_CODE(res));
            
            FCM::AutoPtr<DOM::Utils::ILinearColorGradient> pLinearGradient = pColorGradient;
            if (pLinearGradient)
            {
                
                FCM::U_Int8 colorCount;
                //DOM::Utils::GRADIENT_COLOR_POINT colorPoint;
                
                res = pLinearGradient->GetKeyColorCount(colorCount);
                ASSERT(FCM_SUCCESS_CODE(res));
                
                std::string colorArray ;
                std::string posArray ;
                JSONNode*   stopPointsArray = new JSONNode(JSON_ARRAY);
                
                for (FCM::U_Int32 l = 0; l < colorCount; l++)
                {
                    DOM::Utils::GRADIENT_COLOR_POINT colorPoint;
                    pLinearGradient->GetKeyColorAtIndex(l, colorPoint);
                    JSONNode stopEntry(JSON_NODE);
                    FCM::Float offset;
                    
                    offset = (float)((colorPoint.pos * 100) / 255.0);
                    
                    stopEntry.push_back(JSONNode("offset",
                                                 Utils::ToString((float) offset, m_dataPrecision)));
                    stopEntry.push_back(JSONNode("stopColor", Utils::ToString(colorPoint.color)));
                    stopEntry.push_back(JSONNode("stopOpacity",
                                                 Utils::ToString((float)(colorPoint.color.alpha / 255.0), m_dataPrecision)));
                    stopPointsArray->set_name("GradientStops");
                    stopPointsArray->push_back(stopEntry);
                }
                
                commandElement.push_back(*stopPointsArray);
                
            }//lineargradient
        }
        
        if(pAdjustColorFilter)
        {
            FCM::Double brightness;
            FCM::Double contrast;
            FCM::Double saturation;
            FCM::Double hue;
            FCM::Boolean enabled;
            
            commandElement.push_back(JSONNode("filterType", "AdjustColorFilter"));
            
            pAdjustColorFilter->IsEnabled(enabled);
            if(enabled)
            {
                commandElement.push_back(JSONNode("enabled", "true"));
            }
            else
            {
                commandElement.push_back(JSONNode("enabled", "false"));
            }
            
            res = pAdjustColorFilter->GetBrightness(brightness);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("brightness",
                                              PixiJS::Utils::ToString((double)brightness, m_dataPrecision)));
            
            res = pAdjustColorFilter->GetContrast(contrast);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("contrast",
                                              PixiJS::Utils::ToString((double)contrast, m_dataPrecision)));
            
            res = pAdjustColorFilter->GetSaturation(saturation);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("saturation",
                                              PixiJS::Utils::ToString((double)saturation, m_dataPrecision)));
            
            res = pAdjustColorFilter->GetHue(hue);
            ASSERT(FCM_SUCCESS_CODE(res));
            commandElement.push_back(JSONNode("hue",
                                              PixiJS::Utils::ToString((double)hue, m_dataPrecision)));
        }
        
        m_pCommandArray->push_back(commandElement);
        
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::UpdateDisplayTransform(
                                                           FCM::U_Int32 objectId,
                                                           const DOM::Utils::MATRIX2D& matrix)
    {
        JSONNode commandElement(JSON_NODE);
        std::string transformMat;
        
        commandElement.push_back(JSONNode("cmdType", "Move"));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        transformMat = PixiJS::Utils::ToString(matrix, m_dataPrecision);
        commandElement.push_back(JSONNode("transformMatrix", transformMat.c_str()));
        
        m_pCommandArray->push_back(commandElement);
        
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::UpdateColorTransform(
                                                         FCM::U_Int32 objectId,
                                                         const DOM::Utils::COLOR_MATRIX& colorMatrix)
    {
        JSONNode commandElement(JSON_NODE);
        std::string colorMat;
        
        commandElement.push_back(JSONNode("cmdType", "UpdateColorTransform"));
        commandElement.push_back(JSONNode("objectId", PixiJS::Utils::ToString(objectId)));
        colorMat = PixiJS::Utils::ToString(colorMatrix, m_dataPrecision);
        commandElement.push_back(JSONNode("colorMatrix", colorMat.c_str()));
        
        m_pCommandArray->push_back(commandElement);
        
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::ShowFrame(FCM::U_Int32 frameNum)
    {
        DeferUpdateMasks();
        
        if (!m_pCommandArray->empty())
        {
            m_pFrameElement->push_back(JSONNode(("num"), PixiJS::Utils::ToString(frameNum)));
            m_pFrameElement->push_back(*m_pCommandArray);
            m_pFrameArray->push_back(*m_pFrameElement);
        }
        
        m_FrameCount++;
        
        delete m_pCommandArray;
        delete m_pFrameElement;
        
        m_pCommandArray = new JSONNode(JSON_ARRAY);
        m_pCommandArray->set_name("Command");
        
        m_pFrameElement = new JSONNode(JSON_NODE);
        ASSERT(m_pFrameElement);
        
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::AddFrameScript(FCM::CStringRep16 pScript, FCM::U_Int32 layerNum)
    {
        // As frame script is not supported, let us disable it.
    #if 0
        std::string script = Utils::ToString(pScript, m_pCallback);
        
        std::string scriptWithLayerNumber = "script Layer" +  Utils::ToString(layerNum);
        
        std::string find = "\n";
        std::string replace = "\\n";
        std::string::size_type i =0;
        JSONNode textElem(JSON_NODE);
        
        while (true) {
            /* Locate the substring to replace. */
            i = script.find(find, i);
            
            if (i == std::string::npos) break;
            /* Make the replacement. */
            script.replace(i, find.length(), replace);
            
            /* Advance index forward so the next iteration doesn't pick it up as well. */
            i += replace.length();
        }
        
        
        Utils::Trace(m_pCallback, "[AddFrameScript] (Layer: %d): %s\n", layerNum, script.c_str());
        
        m_pFrameElement->push_back(JSONNode(scriptWithLayerNumber,script));
    #endif
        
        return FCM_SUCCESS;
    }


    FCM::Result JSONTimelineWriter::RemoveFrameScript(FCM::U_Int32 layerNum)
    {
        Utils::Trace(m_pCallback, "[RemoveFrameScript] (Layer: %d)\n", layerNum);
        
        return FCM_SUCCESS;
    }

    FCM::Result JSONTimelineWriter::SetFrameLabel(FCM::StringRep16 pLabel, DOM::KeyFrameLabelType labelType)
    {
        std::string label = Utils::ToString(pLabel, m_pCallback);
        Utils::Trace(m_pCallback, "[SetFrameLabel] (Type: %d): %s\n", labelType, label.c_str());
        
        if(labelType == 1)
            m_pFrameElement->push_back(JSONNode("LabelType:Name",label));
        else if(labelType == 2)
            m_pFrameElement->push_back(JSONNode("labelType:Comment",label));
        else if(labelType == 3)
            m_pFrameElement->push_back(JSONNode("labelType:Ancor",label));
        else if(labelType == 0)
            m_pFrameElement->push_back(JSONNode("labelType","None"));
        
        return FCM_SUCCESS;
    }


    JSONTimelineWriter::JSONTimelineWriter(
                                           FCM::PIFCMCallback pCallback,
                                           DataPrecision dataPrecision) :
    m_pCallback(pCallback),
    m_dataPrecision(dataPrecision)
    {
        m_pCommandArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pCommandArray);
        m_pCommandArray->set_name("Command");
        
        m_pFrameArray = new JSONNode(JSON_ARRAY);
        ASSERT(m_pFrameArray);
        m_pFrameArray->set_name("Frame");
        
        m_pTimelineElement = new JSONNode(JSON_NODE);
        ASSERT(m_pTimelineElement);
        m_pTimelineElement->set_name("Timeline");
        
        m_pFrameElement = new JSONNode(JSON_NODE);
        ASSERT(m_pFrameElement);
        
        m_FrameCount = 0;
    }


    JSONTimelineWriter::~JSONTimelineWriter()
    {
        delete m_pCommandArray;
        
        delete m_pFrameArray;
        
        delete m_pTimelineElement;
        
        delete m_pFrameElement;
    }


    const JSONNode* JSONTimelineWriter::GetRoot()
    {
        return m_pTimelineElement;
    }


    void JSONTimelineWriter::Finish(FCM::U_Int32 resId, FCM::StringRep16 pName)
    {
        if (resId != 0)
        {
            m_pTimelineElement->push_back(
                                          JSONNode(("charid"),
                                                   PixiJS::Utils::ToString(resId)));
        }
        
        m_pTimelineElement->push_back(
                                      JSONNode(("frameCount"),
                                               PixiJS::Utils::ToString(m_FrameCount)));
        
        m_pTimelineElement->push_back(*m_pFrameArray);
    }
};
