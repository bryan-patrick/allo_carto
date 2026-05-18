import { ReactNode } from "react";
import { Text, View } from "react-native";
import styles, { colors } from "../styles";
import ActionButton from "./ActionButton";

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
  let heading = <Text style={styles.h2}>{title}</Text>;

  if (SVGElement) {
    heading = (
      <View style={styles.rowBetween}>
        <View style={{ ...styles.colBetween, flexShrink: 1, }}>
          <Text style={{ ...styles.h2, color: colors.dark.text }}>{title}</Text>
          {description && (
            <Text style={styles.cardText}>{description}</Text>
          )}
        </View>
        <View style={styles.colBetween}>
          {SVGElement}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardView}>
      {heading}
      <ActionButton
        screen={screen}
        params={{ href: '/' }}
      >{linkText}</ActionButton>
    </View>
  );
}