#include "TweenWriter.h"
#include "ApplicationFCMPublicIDs.h"
#include "FCMTypes.h"
#include "FCMPluginInterface.h"

using namespace FCM;

namespace PixiJS
{
	Result TweenWriter::ReadTimeline(DOM::ITimeline* pTimeline, const std::string timelineName)
	{
		JSONNode timelineElement(JSON_NODE);
		timelineElement.push_back(JSONNode("timelineName", timelineName));
		JSONNode tweensArray(JSON_ARRAY);
		tweensArray.set_name("tweens");
		bool hadTween;
		Result res;
		FCMListPtr pLayerList;
		pTimeline->GetLayers(pLayerList.m_Ptr);
		U_Int32 layerCount;
		pLayerList->Count(layerCount);
		for (U_Int32 l = 0; l < layerCount; ++l)
		{
			AutoPtr<DOM::ILayer> testLayer = pLayerList[l];
			AutoPtr<IFCMUnknown> pLayerType;
			testLayer->GetLayerType(pLayerType.m_Ptr);
			AutoPtr<DOM::Layer::ILayerNormal> normalLayer = pLayerType;
			if (normalLayer.m_Ptr == NULL)
			{
				// not a normal layer, bail
				continue;
			}

			FCMListPtr pKeyFrameList;
			normalLayer->GetKeyFrames(pKeyFrameList.m_Ptr);
			U_Int32 keyframeCount;
			pKeyFrameList->Count(keyframeCount);
			for (U_Int32 f = 0; f < keyframeCount; ++f)
			{
				AutoPtr<DOM::IFrame> frame = pKeyFrameList[f];
				U_Int32 duration;
				frame->GetDuration(duration);
				if (duration == 1)
				{
					// can't tween on a frame duration of 1
					continue;
				}
				U_Int32 startFrameIndex;
				U_Int32 endFrameIndex;
				frame->GetStartFrameIndex(startFrameIndex);
				endFrameIndex = startFrameIndex + duration;

				PIFCMList frameElements;
				res = frame->GetFrameElements(frameElements);
				if (FCM_FAILURE_CODE(res))
				{
					Utils::Trace(m_pCallback, "Failed to get frame elements: %i", res);
					return res;
				}
				U_Int32 elementCount;
				frameElements->Count(elementCount);
				for (U_Int32 e = 0; e < elementCount; ++e)
				{
					PIFCMUnknown unknownElement = (*frameElements)[0];
					DOM::FrameElement::PIFrameDisplayElement element = (DOM::FrameElement::PIFrameDisplayElement)unknownElement;
					if (element == NULL)
					{
						// not actually a display element, skip
						continue;
					}
					// read potential tween, if there was a tween note that so that we can know any tween was present in this timeline
					if (ReadTween(element, tweensArray, startFrameIndex, endFrameIndex))
					{
						Utils::Trace(m_pCallback, "Found a tween!\n");
						hadTween = true;
					}
				}
			}
		}
		if (hadTween)
		{
			Utils::Trace(m_pCallback, "A tween happened, adding the tweens array to the timeline element!\n");
			timelineElement.push_back(tweensArray);
			m_pTweenArray->push_back(timelineElement);
		}
	}

	TweenWriter::TweenWriter(FCM::PIFCMCallback pCallback) :
		m_pCallback(pCallback)
	{
		m_pTweenArray = new JSONNode(JSON_ARRAY);
		ASSERT(m_pTweenArray);
		m_pTweenArray->set_name("Tweens");

		// Get the tweenInfo service.
		AutoPtr<IFCMUnknown> pUnk;
		Result res;
		res = m_pCallback->GetService(DOM::Service::Tween::TWEENINFO_SERVICE, pUnk.m_Ptr);
		if (FCM_FAILURE_CODE(res))
		{
			Utils::Trace(m_pCallback, "Failed to get Tween service");
			m_pTweenInfoService = NULL;
		}
		else
		{
			m_pTweenInfoService = pUnk;
		}
	}

	TweenWriter::~TweenWriter()
	{
		delete m_pTweenArray;
	}

	JSONNode* TweenWriter::GetRoot()
	{
		return m_pTweenArray;
	}

	bool TweenWriter::ReadTween(DOM::FrameElement::PIFrameDisplayElement element, JSONNode tweensArray, FCM::U_Int32 start, FCM::U_Int32 end)
	{
		AutoPtr<IFCMList> pTweenInfoList;
		FCM::Result res = m_pTweenInfoService->GetElementTweenInfo(m_pCallback, element, pTweenInfoList.m_Ptr);
		if (FCM_FAILURE_CODE(res))
		{
			Utils::Trace(m_pCallback, "Failed to get element FrameTweenInfo: %i", res);
			return false;
		}
		bool tweenedAnyProp = false;
		// get the dictionary from the list
		FCM::AutoPtr<IFCMDictionary> pTweenDictionary;
		pTweenDictionary = (*pTweenInfoList)[0];
		std::string tweenType;
		Utils::ReadString(pTweenDictionary, kTweenKey_TweenType, tweenType);
		// confirm that it is a geometric tween, otherwise we are going to ignore it for now
		if (tweenType != "geometric")
		{
			return false;
		}

		JSONNode tweenNode(JSON_NODE);
		tweenNode.push_back(JSONNode("start", start));
		tweenNode.push_back(JSONNode("end", end));

		JSONNode posX(JSON_NODE);
		posX.set_name("x");
		if (ReadProp(pTweenDictionary, posX, "Position_X"))
		{
			tweenNode.push_back(posX);
			tweenedAnyProp = true;
		}
		JSONNode posY(JSON_NODE);
		posY.set_name("y");
		if (ReadProp(pTweenDictionary, posY, "Position_Y"))
		{
			tweenNode.push_back(posY);
			tweenedAnyProp = true;
		}
		JSONNode scaleX(JSON_NODE);
		scaleX.set_name("scaleX");
		if (ReadProp(pTweenDictionary, scaleX, "Scale_X"))
		{
			tweenNode.push_back(scaleX);
			tweenedAnyProp = true;
		}
		JSONNode scaleY(JSON_NODE);
		scaleY.set_name("scaleY");
		if (ReadProp(pTweenDictionary, scaleX, "Scale_Y"))
		{
			tweenNode.push_back(scaleY);
			tweenedAnyProp = true;
		}
		JSONNode rotation(JSON_NODE);
		rotation.set_name("rotation");
		if (ReadProp(pTweenDictionary, rotation, "Rotation_Z"))
		{
			tweenNode.push_back(rotation);
			tweenedAnyProp = true;
		}
		JSONNode skewX(JSON_NODE);
		skewX.set_name("skewX");
		if (ReadProp(pTweenDictionary, skewX, "Skew_X"))
		{
			tweenNode.push_back(skewX);
			tweenedAnyProp = true;
		}
		JSONNode skewY(JSON_NODE);
		skewY.set_name("skewY");
		if (ReadProp(pTweenDictionary, skewY, "Skew_Y"))
		{
			tweenNode.push_back(skewY);
			tweenedAnyProp = true;
		}

		if (tweenedAnyProp)
		{
			Utils::Trace(m_pCallback, "Tweened a prop, pushed back the node\n");
			tweensArray.push_back(tweenNode);
		}
		return tweenedAnyProp;
	}

	bool TweenWriter::ReadProp(FCM::PIFCMDictionary tweenDict, JSONNode propNode, const std::string propertyName)
	{
		double startValue = 0;
		double endValue = 0;
		// length of value in dictionary (reused for each call)
		FCM::U_Int32 valueLen;
		// type of value in dictionary (reused for each call)
		FCM::FCMDictRecTypeID type;
		// call result (reused for each call)
		FCM::Result res;
		// dictionary for the property - contains "Property_States" and "Property_Ease"
		PIFCMDictionary propertyDict;
		res = tweenDict->GetInfo((const FCM::StringRep8)propertyName.c_str(), type, valueLen);
		res = tweenDict->Get((const FCM::StringRep8)propertyName.c_str(), type, (FCM::PVoid)&propertyDict, valueLen);
		if (FCM_FAILURE_CODE(res))
		{
			Utils::Trace(m_pCallback, "Failed to get property dictionary for %s: %i\n", propertyName, res);
			return false;
		}
		// has property start/end states - "Start_Value" and "End_Value"
		PIFCMDictionary propertyStates;
		res = propertyDict->GetInfo("Property_States", type, valueLen);
		res = propertyDict->Get("Property_States", type, (FCM::PVoid)&propertyStates, valueLen);
		if (FCM_FAILURE_CODE(res))
		{
			Utils::Trace(m_pCallback, "Failed to get property states for %s: %i\n", propertyName, res);
			return false;
		}
		// read the start & end values
		res = propertyDict->GetInfo("Start_Value", type, valueLen);
		res = propertyDict->Get("Start_Value", type, (FCM::PVoid)&startValue, valueLen);
		if (FCM_FAILURE_CODE(res))
		{
			Utils::Trace(m_pCallback, "Failed to get start value for %s: %i\n", propertyName, res);
		}
		res = propertyDict->GetInfo("End_Value", type, valueLen);
		res = propertyDict->Get("End_Value", type, (FCM::PVoid)&endValue, valueLen);
		if (FCM_FAILURE_CODE(res))
		{
			Utils::Trace(m_pCallback, "Failed to get end value for %s: %i\n", propertyName, res);
		}
		// if values are unchanged, bail
		if (startValue == endValue)
		{
			// Utils::Trace(m_pCallback, "Start and end was the same for %s, %d vs %d\n", propertyName, startValue, endValue);
			return false;
		}
		// record the start and end values - at this point, we could use these even if we can't get ease data and at least have something
		propNode.push_back(JSONNode("start", startValue));
		propNode.push_back(JSONNode("end", endValue));
		// has property ease data - "Ease_Strength" and "Ease_Type"
		PIFCMDictionary propertyEase;
		res = propertyDict->GetInfo("Property_Ease", type, valueLen);
		res = propertyDict->Get("Property_Ease", type, (FCM::PVoid)&propertyEase, valueLen);
		if (FCM_FAILURE_CODE(res))
		{
			Utils::Trace(m_pCallback, "Failed to get property ease for %s: %i\n", propertyName, res);
			// at least we got the values out of it
			return true;
		}
		double easeStrength = 0;
		res = propertyEase->GetInfo("Ease_Strength", type, valueLen);
		res = propertyEase->Get("Ease_Strength", type, (FCM::PVoid)&easeStrength, valueLen);

		res = propertyEase->GetInfo("Ease_Type", type, valueLen);
		std::vector<FCM::Byte> buffer_1(valueLen);
		std::string easeType;
		res = propertyEase->Get("Ease_Type", type, (FCM::PVoid)(&buffer_1[0]), valueLen);
		if (FCM_FAILURE_CODE(res))
		{
			Utils::Trace(m_pCallback, "Failed to get ease type for %s: %i\n", propertyName, res);
			// at least we got the values out of it
			return true;
		}
		easeType = (char*)(&buffer_1[0]);
		// record ease values
		propNode.push_back(JSONNode("easeType", easeType));
		propNode.push_back(JSONNode("easeStrength", easeStrength));
		return true;
	}
}