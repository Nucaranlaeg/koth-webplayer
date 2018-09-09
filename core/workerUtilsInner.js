define([
	'requirejs',
	'./EventObject',
	'./evalUtils',
], (
	requirejs,
	EventObject,
	evalUtils
) => {
	'use strict';

	/* jshint worker: true */

	const awaiting = new Map();

	function handleScript(event) {
		const path = event.data.requireScriptPath;
		if(!self.restrictedRequire) {
			throw new Error('Unexpected script message for ' + path);
		}
		const done = awaiting.get(path);
		if(!done) {
			return;
		}
		evalUtils.invoke(event.data.requireScriptCode);
		awaiting.delete(path);
		done();
	}

	if(self.restrictedRequire) {
		requirejs.replaceLoader((path, done) => {
			awaiting.set(path, done);
			self.postMessage({requireScriptPath: path});
		});

		const originalShed = requirejs.shed;
		requirejs.shed = () => {
			self.postMessage({requireScriptPath: null});
			originalShed();
		};
	} else {
		requirejs.replaceLoader((path, done) => {
			const href = self.rootHref;
			importScripts(href.substr(0, href.lastIndexOf('/') + 1) + path + '.js');
			done();
		});
	}

	// We must manage the "message" events ourselves so that we can intercept
	// requirejs() results. Simply adding a "message" listener wouldn't be enough
	// to avoid potential race conditions (messages will queue while there are
	// NO listeners, but not once there's ONE)

	const queueIn = [];

	const listeners = new EventObject();

	self.addEventListener('message', (event) => {
		if(event.data && event.data.requireScriptCode) {
			return handleScript(event);
		}
		if(listeners.countEventListeners('message') > 0) {
			listeners.trigger('message', [event]);
		} else {
			queueIn.push(event);
		}
	});

	const rawAddEventListener = self.addEventListener;
	self.addEventListener = (type, fn, opts) => {
		if(type === 'message') {
			listeners.addEventListener(type, fn);
			if(queueIn.length > 0) {
				queueIn.forEach((message) => listeners.trigger('message', [message]));
				queueIn.length = 0;
			}
		} else {
			rawAddEventListener(type, fn, opts);
		}
	};

	const rawRemoveEventListener = self.removeEventListener;
	self.removeEventListener = (type, fn, opts) => {
		listeners.removeEventListener(type, fn);
		rawRemoveEventListener(type, fn, opts);
	};

	// WORKAROUND (Safari): performance.* not available inside workers
	if(!self.performance) {
		self.performance = {
			now: () => Date.now(),
		};
	}

	// WORKAROUND (Safari): see workerUtils for details
	self.postMessage({workerReady: true});
});
