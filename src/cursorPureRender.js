import shouldupdate from 'omniscient/shouldupdate'

function cursorPureRender (component) {
  if (component.prototype.shouldComponentUpdate) {
    console.warn(
`cursor-pure-render seems to be overwriting an existing 'shouldComponentUpdate' function.
Did you mean to include this mixin/decorator on the ${component && component.displayName || '[displayName not set]'} component?`)
  }
  component.prototype.shouldComponentUpdate = shouldupdate
  return component
}

export default cursorPureRender
