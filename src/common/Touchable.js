/* @flow strict-local */
import React, { PureComponent } from 'react';
import { TouchableHighlight, TouchableNativeFeedback, Platform, View } from 'react-native';

import type { Node as React$Node } from 'react';
import type { Style } from '../types';
import { HIGHLIGHT_COLOR } from '../styles';

const androidBackground =
  Platform.Version >= 21
    ? TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR)
    : TouchableNativeFeedback.SelectableBackground();

type Props = {|
  accessibilityLabel?: string,
  style?: Style,
  children: React$Node,
  onPress?: () => void | Promise<void>,
  onLongPress?: () => void,
|};

/**
 * Make a child component respond properly to touches, on both platforms.
 *
 * Most of the work is done by components from upstream; details linked
 * below.  Our `Touchable` serves mainly as an adapter to give them a
 * uniform interface.
 *
 * Useful facts about layout and behavior:
 *
 * * The result of `render` looks like this:
 *      (touchable area,)
 *      (with `style`   )  -> (child)
 *
 * * The touchable area is a wrapper `View`, which is both the touch target
 *   and the area that will show feedback.  Its layout is controlled by the
 *   given `style` prop.
 *
 * * In the `TouchableHighlight` case (used on iOS), the child component
 *   is a clone of the one passed as `children`, but with `style.opacity`
 *   adjusted when highlighted.  (In the `TouchableNativeFeedback` case,
 *   the child component is `children` verbatim.)
 *
 * For a few additional details, see upstream docs:
 *   https://facebook.github.io/react-native/docs/touchablehighlight
 *   https://facebook.github.io/react-native/docs/touchablenativefeedback
 * For much more detail, see `Touchable.js` in RN upstream, and its copious
 * jsdoc (which isn't rendered on the web, unfortunately.)
 *
 * @prop [style] - Style for the touch target / feedback area.
 * @prop [children] - A single component (not zero, or more than one.)
 * @prop [onPress] - Passed through; see upstream docs.
 * @prop [onLongPress] - Passed through; see upstream docs.
 */
export default class Touchable extends PureComponent<Props> {
  render() {
    const { accessibilityLabel, style, onPress, onLongPress } = this.props;
    const child: React$Node = React.Children.only(this.props.children);

    if (!onPress && !onLongPress) {
      return (
        <View
          accessible={!!accessibilityLabel}
          accessibilityLabel={accessibilityLabel}
          style={style}
        >
          {child}
        </View>
      );
    }

    if (Platform.OS === 'ios') {
      // TouchableHighlight makes its own wrapper View to be the touch
      // target, passing the `style` prop through.
      return (
        <TouchableHighlight
          accessibilityLabel={accessibilityLabel}
          underlayColor={HIGHLIGHT_COLOR /* v--- $FlowFixMe wants ViewStyleProp */}
          style={style}
          onPress={onPress}
          onLongPress={onLongPress}
        >
          {child}
        </TouchableHighlight>
      );
    }

    // TouchableNativeFeedback doesn't create any wrapper component -- it
    // returns a clone of the child it's given, with added props to make it
    // a touch target.  We make our own wrapper View, in order to provide
    // the same interface as we do with TouchableHighlight.
    return (
      <TouchableNativeFeedback
        accessibilityLabel={accessibilityLabel}
        background={androidBackground}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={style}>{child}</View>
      </TouchableNativeFeedback>
    );
  }
}
