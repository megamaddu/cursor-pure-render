'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _shouldupdate = require('omniscient/shouldupdate');

var _shouldupdate2 = _interopRequireDefault(_shouldupdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cursorPureRender(component) {
  if (component.prototype.shouldComponentUpdate) {
    console.warn('cursor-pure-render seems to be overwriting an existing \'shouldComponentUpdate\' function.\nDid you mean to include this mixin/decorator on the ' + (component && component.displayName || '[displayName not set]') + ' component?');
  }
  component.prototype.shouldComponentUpdate = _shouldupdate2.default;
  return component;
}

exports.default = cursorPureRender;