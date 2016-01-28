# cursor-pure-render

A decorator for a immutable-js cursor-aware version of the pure-render mixin.

example
--------
```js
import React from 'react'
import cursorPureRender from 'cursor-pure-render';

class HelloComponent extends React.Component {
  render() {
    return <h1>Hello {this.props.cursor.get('name')}!</h1>;
  }
}

export default cursorPureRender(HelloComponent)
```
