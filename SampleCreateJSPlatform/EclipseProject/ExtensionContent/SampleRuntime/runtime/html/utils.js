/******************************************************************************
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
******************************************************************************/

function CreateShape(parentMC,resourceManager,charId,ObjectId,placeAfter,transform)
{
	var pathContainer = new pixiflash.Container();
	pathContainer.id = parseInt(ObjectId);
	for(var k =0;k<resourceManager.m_data.DOMDocument.Shape.length;k++)
	{
		if(resourceManager.m_data.DOMDocument.Shape[k].charid == charId)
		{	
			for(var j=0;j<resourceManager.m_data.DOMDocument.Shape[k].path.length;j++)
			{
				var clr,clrOpacity;
				var shape1 = new pixiflash.Shape();

				if(resourceManager.m_data.DOMDocument.Shape[k].path[j].pathType == "Fill")
				{
					if(resourceManager.m_data.DOMDocument.Shape[k].path[j].color)
					{
						clr = resourceManager.m_data.DOMDocument.Shape[k].path[j].color;
						
                        var r = parseInt(clr.substring(1, 3), 16);
                        var g = parseInt(clr.substring(3, 5), 16);
                        var b = parseInt(clr.substring(5, 7), 16);

                        var colStr = 'rgba(' + r + ',' + g + ',' + b + ',' + resourceManager.m_data.DOMDocument.Shape[k].path[j].colorOpacity + ')';
                        shape1.graphics.f(colStr);
					}
					if(resourceManager.m_data.DOMDocument.Shape[k].path[j].image)
					{ 
						var patternArray = resourceManager.m_data.DOMDocument.Shape[k].path[j].image.patternTransform.split(",");						
						var p =0;
						var mat = new PIXI.Matrix(patternArray[p],patternArray[p+1],patternArray[p+1],patternArray[p+3],patternArray[p+4],patternArray[p+5]);
						var image = new Image();
						image.src = resourceManager.m_data.DOMDocument.Shape[k].path[j].image.bitmapPath;						
						shape1.graphics.beginBitmapFill(image,"no-repeat",mat);						
					}
					if(resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient)
					{					
						var stopArray = new Array();
						var offSetArray = new Array();					
						for(var s=0;s<resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.stop.length;s++)
						{								
							stopArray[s] = resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.stop[s].stopColor;
							offSetArray[s] = resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.stop[s].offset/100;
						}							
						shape1.graphics.lf(stopArray ,offSetArray,resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.x1,resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.y1,resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.x2,resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.y2);
					}
						
					if(resourceManager.m_data.DOMDocument.Shape[k].path[j].radialGradient)
					{						
						var stopsArray = new Array();
						var offSetsArray = new Array();					
						for(var s=0;s<resourceManager.m_data.DOMDocument.Shape[k].path[j].radialGradient.stop.length;s++)
						{								
							stopsArray[s] = resourceManager.m_data.DOMDocument.Shape[k].path[j].radialGradient.stop[s].stopColor;
							offSetsArray[s] = resourceManager.m_data.DOMDocument.Shape[k].path[j].radialGradient.stop[s].offset/100;							
						}
						shape1.graphics.rf(stopsArray,offSetsArray,resourceManager.m_data.DOMDocument.Shape[k].path[j].radialGradient.cx,resourceManager.m_data.DOMDocument.Shape[k].path[j].radialGradient.cy,0,resourceManager.m_data.DOMDocument.Shape[k].path[j].radialGradient.fx,resourceManager.m_data.DOMDocument.Shape[k].path[j].radialGradient.fy,resourceManager.m_data.DOMDocument.Shape[k].path[j].radialGradient.r);
						
					}
				}
				else if(resourceManager.m_data.DOMDocument.Shape[k].path[j].pathType == "Stroke")
				{
					if(resourceManager.m_data.DOMDocument.Shape[k].path[j].color)
					{
						clr = resourceManager.m_data.DOMDocument.Shape[k].path[j].color;

                        var r = parseInt(clr.substring(1, 3), 16);
                        var g = parseInt(clr.substring(3, 5), 16);
                        var b = parseInt(clr.substring(5, 7), 16);

                        var colStr = 'rgba(' + r + ',' + g + ',' + b + ',' + resourceManager.m_data.DOMDocument.Shape[k].path[j].colorOpacity + ')';
                        
						shape1.graphics.beginStroke(colStr).setStrokeStyle(resourceManager.m_data.DOMDocument.Shape[k].path[j].strokeWidth,resourceManager.m_data.DOMDocument.Shape[k].path[j].strokeLinecap,resourceManager.m_data.DOMDocument.Shape[k].path[j].strokeLinejoin);
					}
					if(resourceManager.m_data.DOMDocument.Shape[k].path[j].image)
					{ 
						var patternArray = resourceManager.m_data.DOMDocument.Shape[k].path[j].image.patternTransform.split(",");
						var p =0;
						var mat = new PIXI.Matrix(patternArray[p],patternArray[p+1],patternArray[p+1],patternArray[p+3],patternArray[p+4],patternArray[p+5]);
						var image = new Image();
						image.src = resourceManager.m_data.DOMDocument.Shape[k].path[j].image.bitmapPath;
						shape1.graphics.beginBitmapStroke(image,"no-repeat").beginStroke().setStrokeStyle(data.DOMDocument.Shape[k].path[j].strokeWidth,resourceManager.m_data.DOMDocument.Shape[k].path[j].strokeLinecap,resourceManager.m_data.DOMDocument.Shape[k].path[j].strokeLinejoin);
						
					}						
					if(resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient)
					{
						var stopArray = new Array();
						var offSetArray = new Array();
						for(var s=0;s<resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.stop.length;s++)
						{								
							stopArray[s] = resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.stop[s].stopColor;
							offSetArray[s] = resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.stop[s].offset/100;							
						}
							
						shape1.graphics.ls(stopArray,offSetArray,resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.x1,resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.y1,resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.x2,resourceManager.m_data.DOMDocument.Shape[k].path[j].linearGradient.y2).setStrokeStyle(resourceManager.m_data.DOMDocument.Shape[k].path[j].strokeWidth,resourceManager.m_data.DOMDocument.Shape[k].path[j].strokeLinecap,resourceManager.m_data.DOMDocument.Shape[k].path[j].strokeLinejoin);;
					   
					}
					
				}
				var path = resourceManager.m_data.DOMDocument.Shape[k].path[j].d;
				var pathParts = path.split(" ");
				for(var i =0;i < pathParts.length;i++)
				{

					if(pathParts[i] == "M")
					shape1.graphics.moveTo(Number(pathParts[i+1]),Number(pathParts[i+2]));
					if(pathParts[i] == "Q")
					shape1.graphics.quadraticCurveTo(Number(pathParts[i+1]),Number(pathParts[i+2]),Number(pathParts[i+3]),Number(pathParts[i+4]));
					if(pathParts[i] == "L")
					shape1.graphics.lineTo(Number(pathParts[i+1]),Number(pathParts[i+2]));
				}

			/*	if(resourceManager.m_data.DOMDocument.Shape[k].path[j].colorOpacity)
				{
				clrOpacity = resourceManager.m_data.DOMDocument.Shape[k].path[j].colorOpacity;
				shape1.graphics.alpha(clrOpacity);
				}*/
				pathContainer.addChild(shape1);
				
			}
			
		}
			
	}
			
	var transformArray = transform.split(",");
	var scaleX,scaleY,rotation,skewX,skewY;
	var ta0 = Number(transformArray[0]),
			ta1 = Number(transformArray[1]),
			ta2 = Number(transformArray[2]),
			ta3 = Number(transformArray[3]),
			ta4 = Number(transformArray[4]),
			ta5 = Number(transformArray[5]);
	var TransformMat = new PIXI.Matrix(ta0,ta1,ta2,ta3,ta4,ta5)
	scaleX = Math.sqrt((ta0*ta0)+ (ta1*ta1));
	scaleY = Math.sqrt((ta2*ta2) + (ta3*ta3));
	skewX = Math.atan2(-(ta2), ta3);
	skewY = Math.atan2(ta1, ta0);
	skewX = skewX * (180*7/22);
	skewY=skewY *(180*7/22);
	pathContainer.setTransform(ta4,ta5,scaleX,scaleY,0,skewX,skewY);

	if(parentMC != undefined)
	{				
		if(placeAfter != 0)
		{				
			for(var index =0 ; index<parentMC.children.length; index++)
			{
				if(parentMC.children[index].id == parseInt(placeAfter))
				{
					parentMC.addChildAt(pathContainer , index);
					index ++;							
				}					
			}
		}
		else
		{
			parentMC.addChild(pathContainer);
		}
		while(parentMC != null && parentMC.mode != undefined)
		{
			// jibo (mlb) - not sure what the purpose of this getter method is here
			//parentMC.getStage();
			parentMC = parentMC.parent;
		}				 

		// jibo (mlb) - since we add the pathContainer to the parentMC, this should be sufficient for pixijs to render the object.  no need for the parentMC.update call
		//if (parentMC)
		//{
		//	parentMC.update();
		//}
	}
	// jibo (mlb) - the stage variable seems to be unreferenced in the rest of the file. not sure if this is unnecessary code.
	//else
	//{
	//	stage.addChildAt(pathContainer);
	//	stage.update();
	//}
}



function CreateBitmap(parentMC,resourceManager,charId,ObjectId,placeAfter,transform)
{
	for(var b =0;b<resourceManager.m_data.DOMDocument.Bitmaps.length;b++)
	{
		if(resourceManager.m_data.DOMDocument.Bitmaps[b].charid == charId)
		{
		var path = resourceManager.m_data.DOMDocument.Bitmaps[b].bitmapPath;

		var bitmap = new pixiflash.Bitmap(PIXI.Texture.fromImage(path));

		bitmap.id = parseInt(ObjectId);
		}
		
	}
	var transformArray = transform.split(",");
	var scaleX,scaleY,rotation,skewX,skewY;
	var ta0 = Number(transformArray[0]),
			ta1 = Number(transformArray[1]),
			ta2 = Number(transformArray[2]),
			ta3 = Number(transformArray[3]),
			ta4 = Number(transformArray[4]),
			ta5 = Number(transformArray[5]);
	var TransformMat = new PIXI.Matrix(ta0,ta1,ta2,ta3,ta4,ta5)
	scaleX = Math.sqrt((ta0*ta0)+ (ta1*ta1));
	scaleY = Math.sqrt((ta2*ta2) + (ta3*ta3));
	skewX = Math.atan2(-(ta2), ta3);
	skewY = Math.atan2(ta1, ta0);
	skewX = skewX * (180*7/22);
	skewY=skewY *(180*7/22);
	bitmap.setTransform(ta4,ta5,scaleX,scaleY,0,skewX,skewY);


	if(parentMC != undefined)
	{				
		if(placeAfter != 0)
		{				
			for(var index =0 ; index<parentMC.children.length; index++)
			{
				if(parentMC.children[index].id == parseInt(placeAfter))
				{
					parentMC.addChildAt(bitmap , index);
					index ++;							
				}					
			}
		}
		else
		{
			parentMC.addChild(bitmap);
		}				
		while(parentMC.mode != undefined)
		{
			// jibo (mlb) - not sure what the purpose of this getter method is here
			//parentMC.getStage();
			parentMC = parentMC.parent;
		}

		// jibo (mlb) - since we add the pathContainer to the parentMC, this should be sufficient for pixijs to render the object.  no need for the parentMC.update call
		//parentMC.update();
	}
	// jibo (mlb) - the stage variable seems to be unreferenced in the rest of the file. not sure if this is unnecessary code.
	//else
	//{
	//	stage.addChildAt(bitmap);
	//	stage.update();
	//}
}



function CreateText(parentMC,resourceManager,charId,ObjectId,placeAfter,transform)
{
	for(var b =0;b<resourceManager.m_data.DOMDocument.Text.length;b++)
	{
		if(resourceManager.m_data.DOMDocument.Text[b].charid == charId)
		{
		var displayString = resourceManager.m_data.DOMDocument.Text[b].displayText;
		var txt = displayString.replace(/\\r/g,"\r");
		
		var font = resourceManager.m_data.DOMDocument.Text[b].font;
		var fontColor = resourceManager.m_data.DOMDocument.Text[b].color;

		var textOutput = new pixiflash.Text(txt, font, fontColor);
		textOutput.id = parseInt(ObjectId);
		}
		
	}
	var transformArray = transform.split(",");
	var scaleX,scaleY,rotation,skewX,skewY;
	var ta0 = Number(transformArray[0]),
			ta1 = Number(transformArray[1]),
			ta2 = Number(transformArray[2]),
			ta3 = Number(transformArray[3]),
			ta4 = Number(transformArray[4]),
			ta5 = Number(transformArray[5]);
	var TransformMat = new PIXI.Matrix(ta0,ta1,ta2,ta3,ta4,ta5)
	scaleX = Math.sqrt((ta0*ta0)+ (ta1*ta1));
	scaleY = Math.sqrt((ta2*ta2) + (ta3*ta3));
	skewX = Math.atan2(-(ta2), ta3);
	skewY = Math.atan2(ta1, ta0);
	skewX = skewX * (180*7/22);
	skewY=skewY *(180*7/22);
	textOutput.setTransform(ta4,ta5,scaleX,scaleY,0,skewX,skewY);
	
	if(parentMC != undefined)
	{				
		if(placeAfter != 0)
		{				
			for(var index =0 ; index<parentMC.children.length; index++)
			{
				if(parentMC.children[index].id == parseInt(placeAfter))
				{
					parentMC.addChildAt(textOutput , index);
					index ++;							
				}					
			}
		}
		else
		{
			parentMC.addChild(textOutput);
		}				
		while(parentMC.mode != undefined)
		{
			// jibo (mlb) - not sure what the purpose of this getter method is here
			//parentMC.getStage();
			parentMC = parentMC.parent;
		}				 
			 
		// jibo (mlb) - since we add the pathContainer to the parentMC, this should be sufficient for pixijs to render the object.  no need for the parentMC.update call
		//parentMC.update();
	}
	// jibo (mlb) - the stage variable seems to be unreferenced in the rest of the file. not sure if this is unnecessary code.
	//else
	//{
	//	stage.addChildAt(bitmap);
	//	stage.update();
	//}
}
