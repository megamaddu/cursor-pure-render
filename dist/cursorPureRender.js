'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = cursorPureRender;
exports.enableRenderDebug = enableRenderDebug;
exports.disableRenderDebug = disableRenderDebug;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashFilter = require('lodash.filter');

var _lodashFilter2 = _interopRequireDefault(_lodashFilter);

var _lodashIsequal = require('lodash.isequal');

var _lodashIsequal2 = _interopRequireDefault(_lodashIsequal);

function cursorPureRender(component) {
  if (component.prototype.shouldComponentUpdate) {
    console.warn('cursor-pure-render seems to be overwriting an existing \'shouldComponentUpdate\' function.\nDid you mean to include this mixin/decorator on the ' + (component && component.displayName || '[displayName not set]') + ' component?');
  }
  component.prototype.shouldComponentUpdate = shouldComponentUpdate;
  return component;
}

/* below mostly stolen from
 * https://raw.githubusercontent.com/omniscientjs/omniscient/master/shouldupdate.js
 */
var debug = void 0;

var isNotIgnorable = not(or(isIgnorable, isChildren));

function shouldComponentUpdate(nextProps, nextState) {
  if (nextProps === this.props && nextState === this.state) {
    if (debug) debug.call(this, 'shouldComponentUpdate => false (equal input)');
    return false;
  }

  if (!isEqualState(this.state, nextState)) {
    if (debug) debug.call(this, 'shouldComponentUpdate => true (state has changed)');
    return true;
  }

  var filteredNextProps = (0, _lodashFilter2['default'])(nextProps, isNotIgnorable),
      filteredCurrentProps = (0, _lodashFilter2['default'])(this.props, isNotIgnorable);

  if (!isEqualProps(filteredCurrentProps, filteredNextProps)) {
    if (debug) debug.call(this, 'shouldComponentUpdate => true (props have changed)');
    return true;
  }

  if (debug) debug.call(this, 'shouldComponentUpdate => false');

  return false;
}

function isEqualState(value, other) {
  return (0, _lodashIsequal2['default'])(value, other, function (current, next) {
    if (current === next) return true;
    return compare(current, next, isImmutable, isEqualImmutable);
  });
}

function isEqualProps(value, other) {
  if (value === other) return true;

  var cursorsEqual = compare(value, other, isCursor, isEqualCursor);
  if (cursorsEqual !== void 0) return cursorsEqual;

  var immutableEqual = compare(value, other, isImmutable, isEqualImmutable);
  if (immutableEqual !== void 0) return immutableEqual;

  return (0, _lodashIsequal2['default'])(value, other, function (current, next) {
    if (current === next) return true;

    var cursorsEqual = compare(current, next, isCursor, isEqualCursor);
    if (cursorsEqual !== void 0) return cursorsEqual;

    return compare(current, next, isImmutable, isEqualImmutable);
  });
}

function isEqualCursor(a, b) {
  return unCursor(a) === unCursor(b);
}

function enableRenderDebug(pattern, logFn) {
  if (typeof pattern === 'function') {
    logFn = pattern;
    pattern = void 0;
  }

  var logger = logFn;
  if (!logger && console.debug) {
    logger = console.debug.bind(console);
  }
  if (!logger && console.info) {
    logger = console.info.bind(console);
  }

  var regex = new RegExp(pattern || '.*');
  debug = function (str) {
    var element = this._currentElement;
    if (this._reactInternalInstance && this._reactInternalInstance._currentElement) {
      element = this._reactInternalInstance._currentElement;
    }
    var key = element && element.key ? ' key=' + element.key : '';
    var name = this.constructor.displayName;
    if (!key && !name) {
      name = 'Unknown';
    }
    var tag = name + key;
    if (regex.test(tag)) logger('<' + tag + '>: ' + str);
  };
  return debug;
}

function disableRenderDebug() {
  debug = void 0;
}

function compare(current, next, typeCheck, equalCheck) {
  var isCurrent = typeCheck(current);
  var isNext = typeCheck(next);

  if (isCurrent && isNext) {
    return equalCheck(current, next);
  }
  if (isCurrent || isNext) {
    return false;
  }
  return void 0;
}

function isEqualImmutable(a, b) {
  return a === b;
}

var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
function isImmutable(maybeImmutable) {
  return !!(maybeImmutable && maybeImmutable[IS_ITERABLE_SENTINEL]);
}

function unCursor(cursor) {
  if (!cursor || !cursor.deref) return cursor;
  return cursor.deref();
}

function isCursor(potential) {
  return !!(potential && typeof potential.deref === 'function');
}

function not(fn) {
  return function () {
    return !fn.apply(undefined, arguments);
  };
}

function isIgnorable(_, key) {
  return key === 'statics';
}

function isChildren(_, key) {
  return key === 'children';
}

function or(fn1, fn2) {
  return function () {
    return fn1.apply(undefined, arguments) || fn2.apply(undefined, arguments);
  };
}
