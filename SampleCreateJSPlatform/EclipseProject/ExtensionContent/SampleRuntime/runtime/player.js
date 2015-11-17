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

var resourceManager = undefined;
var rootAnimator = undefined;
var cbk = undefined;
var interval = 1000/24;
var gStage = undefined;
var gRenderer = undefined;

function init(stage, renderer, jsonOutputFile, fps)
{
	console.log("CreateJS animation demo");	
	gStage = stage;
	gRenderer = renderer;

	interval = 1000 / fps;
	//TODO - Wait for load for everything else
	//Load the json
	$.get(jsonOutputFile, function(json) {
		data = json;
		console.log(data);
		resourceManager = new ResourceManager(data);
		reset(stage);
		
		play();
	});
}		
	
function play() 
{
	if(cbk === undefined) 
	{
		cbk = setTimeout(loop, interval);
	}
}

function pause() 
{
	if(cbk !== undefined) 
	{
		clearTimeout(cbk);
		cbk = undefined;
	}			
}

function stop(stage) 
{
	pause();
	reset(stage);
}
	
function loop() 
{

	rootAnimator.play(resourceManager);
	gRenderer.render(gStage);
	//TODO - handle movie clip transforms
	cbk = setTimeout(loop, interval);
}	
	
function reset(stage) 
{
	if(rootAnimator !== undefined) 
	{
		rootAnimator.dispose();
		delete rootAnimator;
	}
	//Getting the index of the last element of the Timeline array
	var maintimelineIndex = resourceManager.m_data.DOMDocument.Timeline.length - 1;
	MainTimeline = resourceManager.m_data.DOMDocument.Timeline[maintimelineIndex]
	//rootAnimator = new TimelineAnimator(stage, resourceManager.m_data.DOMDocument.MainTimeline[0]);
	rootAnimator = new TimelineAnimator(stage, MainTimeline);
	//play();
}
