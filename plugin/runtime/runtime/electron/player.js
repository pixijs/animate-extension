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

import ResourceManager from './resourceManager';
import TimelineAnimator from './timelineAnimator';

var resourceManager = undefined;
var rootAnimator = undefined;
var cbk = undefined;
var interval = 1000/24;
var gStage = undefined;
var gRenderer = undefined;

export default class Player {
	constructor(stage, renderer, jsonData, fps) {
		console.log("CreateJS animation demo");
		gStage = stage;
		gRenderer = renderer;

		interval = 1000 / fps;
		console.log(jsonData);
		resourceManager = new ResourceManager(jsonData);
		this.reset(stage);
	}

	play() {
		if (cbk === undefined) {
			cbk = setTimeout(this.loop.bind(this), interval);
		}
	}

	pause() {
		if (cbk !== undefined) {
			clearTimeout(cbk);
			cbk = undefined;
		}
	}

	stop(stage) {
		this.pause();
		this.reset(stage);
	}

	loop() {
		rootAnimator.play(resourceManager);
		gRenderer.render(gStage);
		//TODO - handle movie clip transforms
		cbk = setTimeout(this.loop.bind(this), interval);
	}

	reset(stage) {
		if (rootAnimator !== undefined) {
			rootAnimator.dispose();
			rootAnimator = null;
		}
		//Getting the index of the last element of the Timeline array
		var maintimelineIndex = resourceManager.m_data.DOMDocument.Timeline.length - 1;
		var mainTimeline = resourceManager.m_data.DOMDocument.Timeline[maintimelineIndex];
		//rootAnimator = new TimelineAnimator(stage, resourceManager.m_data.DOMDocument.MainTimeline[0]);
		rootAnimator = new TimelineAnimator(stage, mainTimeline);
		//play();
	}
}