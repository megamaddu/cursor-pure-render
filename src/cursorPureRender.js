import filter from 'lodash.filter';
import isEqual from 'lodash.isequal';

export default function cursorPureRender(component) {
  if (component.prototype.shouldComponentUpdate) {
    console.warn(
`cursor-pure-render seems to be overwriting an existing 'shouldComponentUpdate' function.
Did you mean to include this mixin/decorator on the ${component && component.displayName || '[displayName not set]'} component?`);
  }
  component.prototype.shouldComponentUpdate = shouldComponentUpdate;
  return component;
}

/* below mostly stolen from
 * https://raw.githubusercontent.com/omniscientjs/omniscient/master/shouldupdate.js
 */
let debug = void 0;

const isNotIgnorable = not(or(isIgnorable, isChildren));

function shouldComponentUpdate(nextProps, nextState) {
  if (nextProps === this.props && nextState === this.state) {
    if (debug) this::debug('shouldComponentUpdate => false (equal input)');
    return false;
  }

  if (!isEqualState(this.state, nextState)) {
    if (debug) this::debug('shouldComponentUpdate => true (state has changed)');
    return true;
  }

  var filteredNextProps    = filter(nextProps, isNotIgnorable),
      filteredCurrentProps = filter(this.props, isNotIgnorable);

  if (!isEqualProps(filteredCurrentProps, filteredNextProps)) {
    if (debug) this::debug('shouldComponentUpdate => true (props have changed)');
    return true;
  }

  if (debug) this::debug('shouldComponentUpdate => false');

  return false;
}

function isEqualState(value, other) {
  return isEqual(value, other, (current, next) => {
    if (current === next) return true;
    return compare(current, next, isImmutable, isEqualImmutable);
  });
}

function isEqualProps(value, other) {
  if (value === other) return true;

  const cursorsEqual = compare(value, other, isCursor, isEqualCursor);
  if (cursorsEqual !== void 0) return cursorsEqual;

  const immutableEqual = compare(value, other, isImmutable, isEqualImmutable);
  if (immutableEqual !== void 0) return immutableEqual;

  return isEqual(value, other, (current, next) => {
    if (current === next) return true;

    var cursorsEqual = compare(current, next, isCursor, isEqualCursor);
    if (cursorsEqual !== void 0) return cursorsEqual;

    return compare(current, next, isImmutable, isEqualImmutable);
  });
}

function isEqualCursor(a, b) {
  return unCursor(a) === unCursor(b);
}

export function enableRenderDebug(pattern, logFn) {
  if (typeof pattern === 'function') {
    logFn   = pattern;
    pattern = void 0;
  }

  let logger = logFn;
  if (!logger && console.debug) {
    logger = console.debug.bind(console);
  }
  if (!logger && console.info) {
    logger = console.info.bind(console);
  }

  const regex = new RegExp(pattern || '.*');
  debug = function(str) {
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

export function disableRenderDebug() {
  debug = void 0;
}

function compare(current, next, typeCheck, equalCheck) {
  const isCurrent = typeCheck(current);
  const isNext = typeCheck(next);

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

const IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
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
  return (...args) => !fn(...args);
}

function isIgnorable(_, key) {
  return key === 'statics';
}

function isChildren(_, key) {
  return key === 'children';
}

function or(fn1, fn2) {
  return (...args) => fn1(...args) || fn2(...args);
}
