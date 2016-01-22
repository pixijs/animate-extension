//
//  OutputWriterBase.hpp
//  PixiJSPlugin.mp
//
//  Created by Matt Bittarelli on 11/24/15.
//
//

#ifndef OUTPUT_WRITER_BASE_H_
#define OUTPUT_WRITER_BASE_H_

#include "Version.h"
#include "FCMTypes.h"
#include "IOutputWriter.h"
#include "Utils.h"
#include <string>
#include <vector>
#include <map>

class JSONNode;

namespace PixiJS
{
    class OutputWriterBase : public IOutputWriter
    {
    public:
        
        // Marks the begining of the output
        virtual FCM::Result StartOutput(std::string& outputFileName);
        
        // Marks the end of the output
        virtual FCM::Result EndOutput();
        
        // Marks the begining of the Document
        virtual FCM::Result StartDocument(const DOM::Utils::COLOR& background,
                                          FCM::U_Int32 stageHeight,
                                          FCM::U_Int32 stageWidth,
                                          FCM::U_Int32 fps);
        
        // Marks the end of the Document
        virtual FCM::Result EndDocument();
        
        // Marks the start of a timeline
        virtual FCM::Result StartDefineTimeline();
        
        // Marks the end of a timeline
        virtual FCM::Result EndDefineTimeline(
                                              FCM::U_Int32 resId,
                                              FCM::StringRep16 pName,
                                              ITimelineWriter* pTimelineWriter);
        
        // Marks the start of a shape
        virtual FCM::Result StartDefineShape();
        
        // Start of fill region definition
        virtual FCM::Result StartDefineFill();
        
        // Solid fill style definition
        virtual FCM::Result DefineSolidFillStyle(const DOM::Utils::COLOR& color);
        
        // Bitmap fill style definition
        virtual FCM::Result DefineBitmapFillStyle(
                                                  FCM::Boolean clipped,
                                                  const DOM::Utils::MATRIX2D& matrix,
                                                  FCM::S_Int32 height,
                                                  FCM::S_Int32 width,
                                                  const std::string& libPathName,
                                                  DOM::LibraryItem::PIMediaItem pMediaItem);
        
        // Start Linear Gradient fill style definition
        virtual FCM::Result StartDefineLinearGradientFillStyle(
                                                               DOM::FillStyle::GradientSpread spread,
                                                               const DOM::Utils::MATRIX2D& matrix);
        
        // Sets a specific key point in a color ramp (for both radial and linear gradient)
        virtual FCM::Result SetKeyColorPoint(
                                             const DOM::Utils::GRADIENT_COLOR_POINT& colorPoint);
        
        // End Linear Gradient fill style definition
        virtual FCM::Result EndDefineLinearGradientFillStyle();
        
        // Start Radial Gradient fill style definition
        virtual FCM::Result StartDefineRadialGradientFillStyle(
                                                               DOM::FillStyle::GradientSpread spread,
                                                               const DOM::Utils::MATRIX2D& matrix,
                                                               FCM::S_Int32 focalPoint);
        
        // End Radial Gradient fill style definition
        virtual FCM::Result EndDefineRadialGradientFillStyle();
        
        // Start of fill region boundary
        virtual FCM::Result StartDefineBoundary();
        
        // Sets a segment of a path (Used for boundary, holes)
        virtual FCM::Result SetSegment(const DOM::Utils::SEGMENT& segment);
        
        // End of fill region boundary
        virtual FCM::Result EndDefineBoundary();
        
        // Start of fill region hole
        virtual FCM::Result StartDefineHole();
        
        // End of fill region hole
        virtual FCM::Result EndDefineHole();
        
        // Start of stroke group
        virtual FCM::Result StartDefineStrokeGroup();
        
        // Start solid stroke style definition
        virtual FCM::Result StartDefineSolidStrokeStyle(
                                                        FCM::Double thickness,
                                                        const DOM::StrokeStyle::JOIN_STYLE& joinStyle,
                                                        const DOM::StrokeStyle::CAP_STYLE& capStyle,
                                                        DOM::Utils::ScaleType scaleType,
                                                        FCM::Boolean strokeHinting);
        
        // End of solid stroke style
        virtual FCM::Result EndDefineSolidStrokeStyle();
        
        // Start of stroke
        virtual FCM::Result StartDefineStroke();
        
        // End of a stroke
        virtual FCM::Result EndDefineStroke();
        
        // End of stroke group
        virtual FCM::Result EndDefineStrokeGroup();
        
        // End of fill style definition
        virtual FCM::Result EndDefineFill();
        
        // Marks the end of a shape
        virtual FCM::Result EndDefineShape(FCM::U_Int32 resId);
        
        // Define a bitmap
        virtual FCM::Result DefineBitmap(
                                         FCM::U_Int32 resId,
                                         FCM::S_Int32 height,
                                         FCM::S_Int32 width,
                                         const std::string& libPathName,
                                         DOM::LibraryItem::PIMediaItem pMediaItem);
        
        // Start of a classic text definition
        virtual FCM::Result StartDefineClassicText(
                                                   FCM::U_Int32 resId,
                                                   const DOM::FrameElement::AA_MODE_PROP& aaModeProp,
                                                   const std::string& displayText,
                                                   const TEXT_BEHAVIOUR& textBehaviour);
        
        // Start paragraph
        virtual FCM::Result StartDefineParagraph(
                                                 FCM::U_Int32 startIndex,
                                                 FCM::U_Int32 length,
                                                 const DOM::FrameElement::PARAGRAPH_STYLE& paragraphStyle);
        
        // Start text run
        virtual FCM::Result StartDefineTextRun(
                                               FCM::U_Int32 startIndex,
                                               FCM::U_Int32 length,
                                               const TEXT_STYLE& textStyle);
        
        // End of a text run
        virtual FCM::Result EndDefineTextRun();
        
        // End of a paragraph
        virtual FCM::Result EndDefineParagraph();
        
        // End of a classic text definition
        virtual FCM::Result EndDefineClassicText();
        
        virtual FCM::Result DefineSound(
                                        FCM::U_Int32 resId,
                                        const std::string& libPathName,
                                        DOM::LibraryItem::PIMediaItem pMediaItem);
        
        OutputWriterBase(FCM::PIFCMCallback pCallback, bool minify, DataPrecision dataPrecision);
        
        virtual ~OutputWriterBase();
        
        // Start of a path
        virtual FCM::Result StartDefinePath();
        
        // End of a path 
        virtual FCM::Result EndDefinePath();

        // Perform operations after publishing from Adobe Flash
        virtual FCM::Result PostPublishStep(const std::string& outputFolder, FCM::PIFCMCallback pCallback);
        
        // Start a preview for the output content for this writer
        virtual FCM::Result StartPreview(const std::string& outFile, FCM::PIFCMCallback pCallback);
        
        // Stop a preview for the output content for this writer
        virtual FCM::Result StopPreview(const std::string& outFile);
        
    private:
        
        FCM::Result CreateImageFileName(const std::string& libPathName, std::string& name);
        
        FCM::Result CreateSoundFileName(const std::string& libPathName, std::string& name);
        
        FCM::Boolean GetImageExportFileName(const std::string& libPathName, std::string& name);
        
        void SetImageExportFileName(const std::string& libPathName, const std::string& name);
        
    protected:
        
        JSONNode* m_pRootNode;
        
        JSONNode* m_pShapeArray;
        
        JSONNode* m_pTimelineArray;
        
        JSONNode* m_pBitmapArray;
        
        JSONNode* m_pSoundArray;
        
        JSONNode* m_pTextArray;
        
        JSONNode*   m_shapeElem;
        
        JSONNode*   m_pathArray;
        
        JSONNode*   m_pathElem;
        
        JSONNode*  m_pTextElem;
        
        JSONNode*  m_pTextParaArray;
        
        JSONNode*  m_pTextPara;
        
        JSONNode*  m_pTextRunArray;
        
        JSONNode*   m_gradientColor;
        
        JSONNode*   m_stopPointArray;
        
        std::string m_pathCmdStr;
        
        bool        m_firstSegment;
        
        STROKE_STYLE m_strokeStyle;
        
        std::string m_outputHTMLFile;
        
        std::string m_outputJSONFilePath;
        
        std::string m_outputJSONFileName;
        
        std::string m_outputImageFolder;
        
        std::string m_outputSoundFolder;
        
        char* m_HTMLOutput;
        
        FCM::PIFCMCallback m_pCallback;
        
        FCM::U_Int32 m_imageFileNameLabel;
        
        FCM::U_Int32 m_soundFileNameLabel;
        
        std::map<std::string, std::string> m_imageMap;
        
        FCM::Boolean m_imageFolderCreated;
        
        FCM::Boolean m_soundFolderCreated;
        
        FCM::Boolean m_minify;
        
        DataPrecision m_dataPrecision;
    };
};

#endif /* OUTPUT_WRITER_BASE_H_ */
