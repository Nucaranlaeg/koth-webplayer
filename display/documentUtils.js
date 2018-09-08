define(['document'], (document) => {
	'use strict';

	if(!window.originalDevicePixelRatio) {
		window.originalDevicePixelRatio = window.devicePixelRatio;
		window.devicePixelRatio = 1;
	}

	function normaliseClasses(c) {
		return c.replace(/  +/g, ' ').trim();
	}

	return {
		document: document,
		body: document.body,

		getMetaTagValue: (name, fallback = null) => {
			const elements = document.getElementsByTagName('meta');
			for(let i = 0; i < elements.length; ++ i) {
				const meta = elements[i];
				if(meta.getAttribute('name') === name) {
					return meta.getAttribute('content');
				}
			}
			return fallback;
		},

		getTitle: (fallback = null) => {
			const elements = document.getElementsByTagName('title');
			if(elements.length > 0) {
				return elements[0].innerText;
			}
			return fallback;
		},

		text: (text = '') => {
			return document.createTextNode(text);
		},

		make: (type, attrs = {}, children = []) => {
			if(children && !Array.isArray(children)) {
				throw new Error('Children should be a list');
			}
			const o = document.createElement(type);
			for(const k of Object.keys(attrs)) {
				o.setAttribute(k, attrs[k]);
			}
			for(let i = 0; i < children.length; ++ i) {
				const child = children[i];
				let obj = null;
				if(typeof child === 'string') {
					obj = document.createTextNode(child);
				} else if(typeof child === 'number') {
					obj = document.createTextNode(String(child));
				} else {
					obj = child;
				}
				if(obj) {
					o.appendChild(obj);
				}
			}
			return o;
		},

		updateAttrs: (element, attrs) => {
			for(const k of Object.keys(attrs)) {
				if(element.getAttribute(k) !== attrs[k]) {
					element.setAttribute(k, attrs[k]);
				}
			}
		},

		addClass: (element, className) => {
			const c = ' ' + element.getAttribute('class') + ' ';
			if(c.indexOf(' ' + className + ' ') === -1) {
				element.setAttribute('class', normaliseClasses(c + ' ' + className));
			}
		},

		removeClass: (element, className) => {
			const c = ' ' + element.getAttribute('class') + ' ';
			const p = c.indexOf(' ' + className + ' ');
			if(p !== -1) {
				element.setAttribute('class', normaliseClasses(
					c.substr(0, p) +
					c.substr(p + className.length + 1)
				));
			}
		},

		updateStyle: (element, style) => {
			for(const k of Object.keys(style)) {
				if(element.style[k] !== style[k]) {
					element.style[k] = style[k];
				}
			}
		},

		updateText: (textNode, text) => {
			if(textNode.nodeValue !== text) {
				textNode.nodeValue = text;
			}
		},

		setParent: (element, parent) => {
			if(!parent) {
				if(element.parentNode) {
					element.parentNode.removeChild(element);
				}
			} else if(element.parentNode !== parent) {
				if(element.parentNode) {
					element.parentNode.removeChild(element);
				}
				parent.appendChild(element);
			}
		},

		empty: (element) => {
			while(element.lastChild) {
				element.removeChild(element.lastChild);
			}
		},

		addDragHandler: (element, handler) => {
			let dragX = null;
			let dragY = null;

			const mmHandler = (e) => {
				const dx = e.pageX - dragX;
				const dy = e.pageY - dragY;
				handler(dx, dy);
				dragX = e.pageX;
				dragY = e.pageY;
			};

			const muHandler = (e) => {
				mmHandler(e);
				window.removeEventListener('mousemove', mmHandler);
				window.removeEventListener('mouseup', muHandler);
				e.preventDefault();
			};

			element.addEventListener('mousedown', (e) => {
				dragX = e.pageX;
				dragY = e.pageY;
				window.addEventListener('mousemove', mmHandler);
				window.addEventListener('mouseup', muHandler);
				e.preventDefault();
			});
		},
	};
});
