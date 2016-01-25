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

import Utils from './utils';

//TimelineAnimator Class
export default class TimelineAnimator {
	constructor(targetMovieClip, timeline, transform) {
		//The target Movie Clip
		this.m_targetMC = targetMovieClip;
		this.m_transform = transform;
		//Timeline is a collection of frames
		//Frame is a collection of Command Objects
		this.m_timeline = timeline;
		this.m_currentFrameNo = 0;
		this.m_frameCount = this.m_timeline.Frame.length;
		if (this.m_transform !== undefined) {
			//Apply the transformation on the parent MC
			var transformData = this.m_transform;
			var transformArray = transformData.split(",");
			var scaleX, scaleY, rotation, skewX, skewY;

			var ta0 = Number(transformArray[0]),
					ta1 = Number(transformArray[1]),
					ta2 = Number(transformArray[2]),
					ta3 = Number(transformArray[3]),
					ta4 = Number(transformArray[4]),
					ta5 = Number(transformArray[5]);

			var TransformMat = new PIXI.Matrix(ta0, ta1, ta2, ta3, ta4, ta5)
			scaleX = Math.sqrt((ta0 * ta0) + (ta1 * ta1));
			scaleY = Math.sqrt((ta2 * ta2) + (ta3 * ta3));
			skewX = Math.atan2(-(ta2), ta3);
			skewY = Math.atan2(ta1, ta0);
			skewX = skewX * (180 * 7 / 22);
			skewY = skewY * (180 * 7 / 22);
			this.m_targetMC.setTransform(ta4, ta5, scaleX, scaleY, 0, skewX, skewY);

		}
		this.m_children = [];

		//@TODO - String Constants
		//this.kStr_CharID = "charid";
	}

	//member functions for MovieClip
	play(resourceManager) {
		var commandList = [];
		var parentMC = this.m_targetMC;

		//Play all the child animations
		var children = this.m_children;
		for (var i = 0; i < children.length; ++i) {
			children[i].play(resourceManager);
		}

		if (this.m_frameCount == 0) {
			// No frames in the timeline.
			return;
		}

		// Handle Looping
		if (this.m_currentFrameNo == this.m_frameCount) {

			// Reset frame number
			this.m_currentFrameNo = 0;

			var frame = this.m_timeline.Frame[this.m_currentFrameNo];

			//Get the commands for the first frame
			var commands = frame.Command;

			// Iterate through all the elements in the display list (maintained by CreateJS) and
			// check if same instance exists in the first frame
			for (var index = 0; index < parentMC.children.length; index++) {

				var found = false;
				var elementId = parentMC.children[index].id;

				for (var c = 0; c < commands.length; ++c) {
					var cmdData = commands[c];
					var type = cmdData.cmdType;
					if (type == "Place") {
						if (elementId == parseInt(cmdData.objectId)) {
							found = true;
							break;
						}
					}
				}

				if (found == false) {
					command = new RemoveObjectCommand(elementId);
					commandList.push(command);
				}
			}

		}

		//Get the current frame
		var frame = this.m_timeline.Frame[this.m_currentFrameNo];
		//Get the commands for the current frame
		var commands = frame.Command;

		//Execute all the commands
		for (var c = 0; c < commands.length; ++c) {
			var cmdData = commands[c];
			var type = cmdData.cmdType;
			var command = undefined;

			switch (type) {
				case "Place":
					// Check if the object being added is already in the display list. If yes,
					var found = false;
					for (var index = 0; index < parentMC.children.length; index++) {
						if (parentMC.children[index].id == parseInt(cmdData.objectId)) {
							found = true;
							break;
						}
					}

					if (!found) {
						command = new PlaceObjectCommand(cmdData.charid, cmdData.objectId, cmdData.placeAfter, cmdData.transformMatrix);
						commandList.push(command);
					}
					else {
						// It is already present (Possible for looping case)
						command = new MoveObjectCommand(cmdData.objectId, cmdData.transformMatrix);
						commandList.push(command);
						command = new UpdateObjectCommand(cmdData.objectId, cmdData.placeAfter);
						commandList.push(command);
					}
					break;

				case "Move":
					command = new MoveObjectCommand(cmdData.objectId, cmdData.transformMatrix);
					commandList.push(command);
					break;

				case "Remove":
					command = new RemoveObjectCommand(cmdData.objectId);
					commandList.push(command);
					break;
				case "UpdateZOrder":
					command = new UpdateObjectCommand(cmdData.objectId, cmdData.placeAfter);
					commandList.push(command);
					break;

				case "UpdateVisibility":
					command = new UpdateVisibilityCommand(cmdData.objectId, cmdData.visibility);
					commandList.push(command);
					break;
				case "UpdateColorTransform":
					command = new UpdateColorTransformCommand(cmdData.objectId, cmdData.colorMatrix);
					commandList.push(command);
					break;
			}
		}

		for (var i = 0; i < commandList.length; i++) {
			//Execute it
			if (commandList[i] !== undefined) {
				commandList[i].execute(this, resourceManager);
			}
		}

		//Increment the current frame no
		this.m_currentFrameNo++;
	}
}

//PlaceObjectCommand Class
class PlaceObjectCommand {
	constructor(charID, objectID, placeAfter, transform) {
		this.m_charID = charID;
		this.m_objectID = objectID;
		this.m_placeAfter = placeAfter;
		this.m_transform = transform;
	}

	execute(timelineAnimator, resourceManager) {
		var shape = resourceManager.getShape(this.m_charID);
		var parentMC = timelineAnimator.m_targetMC;
		var bitmap = resourceManager.getBitmap(this.m_charID);
		var text = resourceManager.getText(this.m_charID);

		if(shape !== null && shape !== undefined)
		{
			Utils.CreateShape(parentMC, resourceManager, this.m_charID, this.m_objectID, this.m_placeAfter, this.m_transform);
		}
		else if(bitmap !== null && bitmap !== undefined)
		{
			Utils.CreateBitmap(parentMC, resourceManager, this.m_charID, this.m_objectID, this.m_placeAfter, this.m_transform);
		}
		else if(text !== null && text !== undefined)
		{
			Utils.CreateText(parentMC, resourceManager, this.m_charID, this.m_objectID, this.m_placeAfter, this.m_transform);
		}
		else
		{
			// Movie clip logic starts here
			var childTimeline = resourceManager.getMovieClip(this.m_charID);

			if(parentMC != undefined)
			{

				//Create a createjs MC
				var childMC = new pixiflash.MovieClip();

				childMC.id = parseInt(this.m_objectID);



				var index;
				if(this.m_placeAfter != 0)
				{
					for(var index=0; index<parentMC.children.length; index++)
					{
						if(parentMC.children[index].id == parseInt(this.m_placeAfter))
						{
							parentMC.addChildAt(childMC,index);
							break;
						}
					}
				}
				else
				{
					parentMC.addChild(childMC);
				}

				//Create a corresponding TimelineAnimator
				if(childTimeline)
				{
					var childTimelineAnimator = new TimelineAnimator(childMC, childTimeline, this.m_transform);
					//@TODO - Handle the animator placement
					timelineAnimator.m_children.push(childTimelineAnimator);
					//Send the tick once to the child
					childTimelineAnimator.play(resourceManager);
				}
			}
		}
	}
}


//MoveObjectCommand Class
class MoveObjectCommand {
	constructor(objectID,transform) {
		this.m_objectID = objectID;
		//this.m_placeAfter = placeAfter;
		this.m_transform = transform;
	}

	execute(timelineAnimator, resourceManager) {
		console.log("Move command execute");
		var parentMC = timelineAnimator.m_targetMC;
		var transform =  this.m_transform;
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
		if(parentMC != undefined)
		{
			//Change the transformation of the targetMC
			var index;
			for(var index=0; index<parentMC.children.length; index++)
			{
				if(parentMC.children[index].id == parseInt(this.m_objectID))
				{
					var child = parentMC.getChildAt(index);
					console.log(child.position);
					child.setTransform(ta4,ta5,scaleX,scaleY,0,skewX,skewY);

					console.log(child.position);
					break;
				}
			}
		}
	}
}


//UpdateObjectCommand Class
class UpdateObjectCommand {
	constructor(objectID, placeAfter) {
		this.m_objectID = objectID;
		this.m_placeAfter = placeAfter;
	}

	execute(timelineAnimator, resourceManager) {
		console.log("Update command execute");
		var parentMC = timelineAnimator.m_targetMC;

		if(parentMC != undefined)
		{
			//Change the Z order of the targetMC
			var index;
			for(var indexz=0; indexz<parentMC.children.length; indexz++)
			{
				if(parentMC.children[indexz].id == parseInt(this.m_objectID))
				{
					var child = parentMC.getChildAt(indexz);
					if(this.m_placeAfter != 0)
					{
						for(var index=0; index<parentMC.children.length; index++)
						{
							if(parentMC.children[index].id == parseInt(this.m_placeAfter))
							{
								//child.addChildAt(childMC,index);
								parentMC.setChildIndex(child,index - 1)
								break;
							}
						}
					}
					break;
				}
			}
		}
	}
}

//RemoveObjectCommand Class
class RemoveObjectCommand {
	constructor(objectID) {
		this.m_objectID = objectID;
	}

	execute(timelineAnimator, resourceManager) {
		console.log("Remove command execute");
		var parentMC = timelineAnimator.m_targetMC;
		if(parentMC != undefined)
		{
			//Remove the targetMC
			var index;
			for(var index=0; index<parentMC.children.length; index++)
			{
				if(parentMC.children[index].id == parseInt(this.m_objectID))
				{
					parentMC.removeChildAt(index);
					index --;
				}
			}
		}
	}
}

//UpdateVisbilityCommand Class
class UpdateVisibilityCommand {
	constructor(objectID,visibility) {
		this.m_objectID = objectID;
		this.m_visibilty = visibility;
		console.log(this.m_visibilty);
	}

	execute(timelineAnimator, resourceManager) {
		console.log("UpdateVisbilityCommand execute");
		var parentMC = timelineAnimator.m_targetMC;
		if(parentMC != undefined)
		{
			//Remove the targetMC
			var index,visibleBool;
			for(var index=0; index<parentMC.children.length; index++)
			{
				if(parentMC.children[index].id == parseInt(this.m_objectID))
				{
					if(this.m_visibilty == "true")
						visibleBool = true;
					else
						visibleBool = false;

					parentMC.getChildAt(index).visible = visibleBool;

				}
			}
		}
	}
}

class UpdateColorTransformCommand {
	constructor(objectID, colorMatrix) {
		this.m_objectID = objectID;
		this.m_colorMatrix = colorMatrix;
	}

	execute(timelineAnimator, resourceManager) {
		console.log("UpdateColorTransformCommand execute");
		var parentMC = timelineAnimator.m_targetMC;
		if(parentMC != undefined)
		{
			for(var index=0; index < parentMC.children.length; index++)
			{
				if(parentMC.children[index].id == parseInt(this.m_objectID))
				{
					var child = parentMC.getChildAt(index);
					var matrix = this.m_colorMatrix.split(',', 7);
					child.alpha = matrix[6]; //currently only alpha
					break;
				}
			}
		}
	}
}
