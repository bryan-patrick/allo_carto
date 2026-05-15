import { useLinkProps } from '@react-navigation/native';
import { LinkProps } from 'expo-router';
import { ReactElement, ReactNode, useState } from 'react';
import { Pressable, Text } from 'react-native';
import styles from '../styles';

interface LinkButtonProps {
  screen: string;
  params: LinkProps;
  SVGElement?: ReactElement;
  action?: Readonly<any>;
  href?: string;
  children?: ReactNode;
}

/**
 * A link that looks like a button
 */
export default function LinkButton({ screen, params, action, href, children, SVGElement, ...moreProps }: LinkButtonProps) {
  /**
   * Style vars
   */
  const {
    linkButtonStyles,
    linkTextStyles,
    hoveredLinkButtonStyles,
    hoveredLinkTextStyles,
    pressedLinkButtonStyles,
    pressedLinkTextStyles
  } = styles;
  let currentLinkButtonStyles = linkButtonStyles;
  let currentLinkTextStyles = linkTextStyles;

  /**
   * State/prop vars
   */
  const props = useLinkProps({ screen, params, action, href });
  const allTheProps = { ...props, ...moreProps };
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  /**
   * Pressed styles before hovered styles
   */
  if (isPressed) {
    currentLinkButtonStyles = { ...linkButtonStyles, ...pressedLinkButtonStyles };
    currentLinkTextStyles = { ...linkTextStyles, ...pressedLinkTextStyles };
  } else if (isHovered) {
    currentLinkButtonStyles = { ...linkButtonStyles, ...hoveredLinkButtonStyles };
    currentLinkTextStyles = { ...linkTextStyles, ...hoveredLinkTextStyles };
  }

  return (
    <Pressable
      {...allTheProps}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={currentLinkButtonStyles}
    >
      {SVGElement}
      <Text style={currentLinkTextStyles}>{children}</Text>
    </Pressable>
  );
};