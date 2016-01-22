//
//  JSONTimelineWriter.hpp
//  PixiJSPlugin.mp
//
//  Created by Matt Bittarelli on 11/23/15.
//
//

#ifndef JSON_TIMELINE_WRITER_H_
#define JSON_TIMELINE_WRITER_H_

#include "IOutputWriter.h"
#include "Utils.h"
#include <vector>

class JSONNode;

namespace PixiJS
{
    class JSONTimelineWriter : public ITimelineWriter
    {
    public:
        
        virtual FCM::Result PlaceObject(
                                        FCM::U_Int32 resId,
                                        FCM::U_Int32 objectId,
                                        FCM::U_Int32 placeAfterObjectId,
                                        const DOM::Utils::MATRIX2D* pMatrix,
                                        const DOM::Utils::RECT* pRect = NULL);
        
        virtual FCM::Result PlaceObject(
                                        FCM::U_Int32 resId,
                                        FCM::U_Int32 objectId,
                                        FCM::U_Int32 placeAfterObjectId,
                                        const DOM::Utils::MATRIX2D* pMatrix,
                                        FCM::Boolean loop,
                                        FCM::PIFCMUnknown pUnknown);
        
        virtual FCM::Result PlaceObject(
                                        FCM::U_Int32 resId,
                                        FCM::U_Int32 objectId,
                                        FCM::PIFCMUnknown pUnknown = NULL);
        
        virtual FCM::Result RemoveObject(
                                         FCM::U_Int32 objectId);
        
        virtual FCM::Result UpdateZOrder(
                                         FCM::U_Int32 objectId,
                                         FCM::U_Int32 placeAfterObjectId);
        
        virtual FCM::Result UpdateMask(
                                       FCM::U_Int32 objectId,
                                       FCM::U_Int32 maskTillObjectId);
        
        virtual FCM::Result UpdateBlendMode(
                                            FCM::U_Int32 objectId,
                                            DOM::FrameElement::BlendMode blendMode);
        
        virtual FCM::Result UpdateVisibility(
                                             FCM::U_Int32 objectId,
                                             FCM::Boolean visible);
        
        virtual FCM::Result AddGraphicFilter(
                                             FCM::U_Int32 objectId,
                                             FCM::PIFCMUnknown pFilter);
        
        virtual FCM::Result UpdateDisplayTransform(
                                                   FCM::U_Int32 objectId,
                                                   const DOM::Utils::MATRIX2D& matrix);
        
        virtual FCM::Result UpdateColorTransform(
                                                 FCM::U_Int32 objectId,
                                                 const DOM::Utils::COLOR_MATRIX& colorMatrix);
        
        virtual FCM::Result ShowFrame(FCM::U_Int32 frameNum);
        
        virtual FCM::Result AddFrameScript(FCM::CStringRep16 pScript, FCM::U_Int32 layerNum);
        
        virtual FCM::Result RemoveFrameScript(FCM::U_Int32 layerNum);
        
        virtual FCM::Result SetFrameLabel(FCM::StringRep16 pLabel, DOM::KeyFrameLabelType labelType);
        
        JSONTimelineWriter(FCM::PIFCMCallback pCallback, DataPrecision dataPrecision);
        
        virtual ~JSONTimelineWriter();
        
        const JSONNode* GetRoot();
        
        void Finish(FCM::U_Int32 resId, FCM::StringRep16 pName);
        
        
    private:
        
        FCM::Result DeferUpdateMasks();
        
        FCM::Result DeferUpdateMask(
                                    FCM::U_Int32 objectId,
                                    FCM::U_Int32 maskTillObjectId);
        
        
    private:
        
        JSONNode* m_pCommandArray;
        
        JSONNode* m_pFrameArray;
        
        JSONNode* m_pTimelineElement;
        
        JSONNode* m_pFrameElement;
        
        std::vector<MaskInfo> maskInfoList;
        
        FCM::PIFCMCallback m_pCallback;
        
        FCM::U_Int32 m_FrameCount;
        
        DataPrecision m_dataPrecision;
    };
};

#endif /* JSON_TIMELINE_WRITER_H_ */
