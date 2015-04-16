/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console, mendix, $, document, window */
/*
    OnClickWidget
    ========================

    @file      : OnClickWidget.js
    @version   : 1.0
    @author    : Marcus Groen
    @date      : Thu, 16 Apr 2015 12:33:38 GMT
    @copyright : Incentro
    @license   : Apache 2

    Documentation
    ========================
    Set 'on click' event on any DOM element and trigger a microflow.
*/
require(['dojo/_base/declare', 'mxui/widget/_WidgetBase', 'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/_base/lang', 'dojo/text'],
       function (declare, _WidgetBase, dom, dojoDom, domQuery, lang, text) {
    'use strict';
    
    // Declare widget's prototype.
    return declare('OnClickWidget.widget.OnClickWidget', [ _WidgetBase ], {

        // Parameters configured in the Modeler.
        dojoQuery: "",
        mfToExecute: "",
        useTouchStart: false,

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handle: null,
        _contextObj: null,
        _objProperty: null,
        _domElement: null,
        
        // Mobile event emulator
        _clickEvent: null,
        _mouseDownEvent: null,
        _mouseUpEvent: null,
        _mouseOutEvent: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            this._objProperty = {};
            
            // Mobile event emulator
            if (this.useTouchStart && typeof document.ontouchstart !== 'undefined') {
                this._clickEvent = 'touchstart';
                this._mouseDownEvent = 'touchstart';
                this._mouseUpEvent = 'touchend';
                this._mouseOutEvent = 'touchend';
            } else {
                this._clickEvent = 'click';
                this._mouseDownEvent = 'mousedown';
                this._mouseUpEvent = 'mouseup';
                this._mouseOutEvent = 'mouseout';
            }
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            this._contextObj = obj;
            this._resetSubscriptions();
            callback();
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {

        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {

        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {

        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },
		
        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function(e) {
            if (typeof document.ontouchstart !== 'undefined') {
                if(e.stopPropagation){
                    e.stopPropagation();
                } else {
                    if (e.preventDefault){
                        e.preventDefault();
                        e.cancelBubble = true;
                    } else {
                        e.cancelBubble = true;
                    }
                }
            }
        },

        _setupEvents: function () {
            // Get target DOM node.
            if (this.dojoQuery !== '') {
                this._domElement = domQuery(this.dojoQuery)[0];
            }
            if (this._domElement !== null) {
                this.connect(this._domElement, this._clickEvent, function () {
                    
                // Stop the event from bubbling in mobile devices.
                this._stopBubblingEventOnMobile(this._domElement);
                    
                    if (this._contextObj !== null) {
                        mx.data.action({
                            params: {
                                applyto: 'selection',
                                actionname: this.mfToExecute,
                                guids: [this._contextObj.getGuid()]
                            },
                            callback: function (obj) {
                                // nothing to do...
                            },
                            error: function (error) {
                                console.log(this.id + ': An error occurred while executing microflow: ' + error.description);
                            }
                        }, this);
                    } else {
                        mx.data.action({
                            params: {
                                actionname: this.mfToExecute
                            },
                            callback: function (obj) {
                                // nothing to do...
                            },
                            error: function (error) {
                                console.log(this.id + ': An error occurred while executing microflow: ' + error.description);
                            }
                        }, this);
                    }
                });
            }
        },

        _updateRendering: function () {

        },
        
        _resetSubscriptions: function () {
            // Release handle on previous object, if any.
            if (this._handle) {
                this.unsubscribe(this._handle);
                this._handle = null;
            }

            if (this._contextObj) {
                this._handle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: this._updateRendering
                });
            }
        }
    });
});
