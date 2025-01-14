/*
---

name: Form.AutoGrow

description: Automatically resizes textareas based on their content.

authors: Christoph Pojer (@cpojer)

credits: Based on a script by Gary Glass (www.bookballoon.com)

license: MIT-style license.

requires: [Core/Class.Extras, Core/Element, Core/Element.Event, Core/Element.Style, Core/Element.Dimensions, Class-Extras/Class.Binds, Class-Extras/Class.Singleton]

provides: Form.AutoGrow

...
*/

(function(){

var wrapper = new Element('div').setStyles({
	overflowX: 'hidden',
	position: 'absolute',
	top: 0,
	left: -9999
});

var escapeHTML = function(string){
	return string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

if (!this.Form) this.Form = {};

var AutoGrow = this.Form.AutoGrow = new Class({

	Implements: [Options, Class.Singleton, Class.Binds],

	options: {
		minHeightFactor: 2,
		bindWithChange: true, // helps when setting value via javascript
		margin: 0,
		maxHeight: null
	},

	initialize: function(element, options){
		this.setOptions(options);
		element = this.element = document.id(element);
		
		return this.check(element) || this.setup();
	},

	setup: function(){
		this.attach().focus().resize();
	},

	toElement: function(){
		return this.element;
	},

	attach: function(){
		this.element.addEvents({
			focus: this.bound('focus'),
			keydown: this.bound('keydown'),
			scroll: this.bound('scroll')
		});
		
		if (this.options.bindWithChange)
			this.element.addEvent('change', this.bound('keydown'));
			
		// check if max-height is defined
		var max_height = this.element.getStyle('max-height'); // this gotta be in px

		// if options.maxHeight is not already defined, use element style max-height if set
		if (this.options.maxHeight === null && max_height.toInt())
			this.options.maxHeight = max_height.toInt();

		return this;
	},

	detach: function(){
		this.element.removeEvents({
			focus: this.bound('focus'),
			keydown: this.bound('keydown'),
			scroll: this.bound('scroll')
		});
		
		if (this.options.bindWithChange)
			this.element.removeEvent('change', this.bound('keydown'));

		return this;
	},

	focus: function(){
		wrapper.setStyles(this.element.getStyles('fontSize', 'fontFamily', 'width', 'lineHeight', 'padding')).inject(document.body);

		this.minHeight = (wrapper.set('html', 'A').getHeight() + this.options.margin) * this.options.minHeightFactor;

		return this;
	},

	keydown: function(){
		this.resize.delay(15, this);
	},

	resize: function(){
		var element = this.element,
			html = escapeHTML(element.get('value')).replace(/\n|\r\n/g, '<br/>A');
		
		if (wrapper.get('html') == html) return this;

		wrapper.set('html', html);
		var height = wrapper.getHeight() + this.options.margin;
		if (element.getHeight() != height){
			var final_height = this.minHeight.max(height);

			// checks for max-height
			if (this.options.maxHeight && final_height > this.options.maxHeight) {
				final_height = this.options.maxHeight;
				element.setStyle('overflow', 'auto'); // adjust scroll
			} else {
				element.setStyle('overflow', '');  // adjust scroll
			}
			
			element.setStyle('height', final_height);

			AutoGrow.fireEvent('resize', [this]);
		}
		
		return this;
	},

	scroll: function(){
		// only scroll if needed
		if (this.options.maxHeight && this.element.getHeight() < this.options.maxHeight)
			this.element.scrollTo(0, 0);
	}

});

AutoGrow.extend(new Events);

}).call(this);
