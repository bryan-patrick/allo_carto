import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../app/colors";
import LinkButton from "./LinkButton";

/**
 * Typing
 */
interface CardProps {
  title: string;
  SVGElement?: ReactNode;
  description?: string;
  screen: string,
  linkText: string;
}

/**
 * LinkCard Component
 */
export default function LinkCard({
  title,
  SVGElement,
  description,
  screen,
  linkText,
}: CardProps) {

  /**
   * Destructure styles
   */
  const {
    titleStyle,
    rowBetweenStyle,
    colBetweenStyle,
    cardTextStyle,
    cardViewStyle
  } = styles;

  /**
   * Different headings for when using an SVG or not 
   */
  let heading = <Text style={titleStyle}>{title}</Text>;

  if (SVGElement) {
    heading = (
      <View style={rowBetweenStyle}>
        <View style={colBetweenStyle}>
          <Text style={titleStyle}>{title}</Text>
          {description && (
            <Text style={cardTextStyle}>{description}</Text>
          )}
        </View>
        <View style={colBetweenStyle}>
          {SVGElement}
        </View>
      </View>
    );
  }

  /**
   * Render the LinkCard
   */
  return (
    <View style={cardViewStyle}>
      {heading}
      <LinkButton
        screen={screen}
        params={{ href: '/' }}
      >
        {linkText}
      </LinkButton>
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  cardViewStyle: {
    backgroundColor: colors.light.background,
    padding: 16,
    borderRadius: 8,
    gap: 16,
  },
  titleStyle: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.dark.text,
  },
  rowBetweenStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  colBetweenStyle: {
    gap: 12,
    flexShrink: 1
  },
  cardTextStyle: {
    color: colors.dark.text,
    fontWeight: 500,
    fontSize: 16,
  },
})