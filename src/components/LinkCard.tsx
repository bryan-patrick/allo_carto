import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../app/styles";
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
      <LinkButton
        screen={screen}
        params={{ href: '/' }}
      >{linkText}</LinkButton>
    </View>
  );
}

const styles = StyleSheet.create({
  h2: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.light.text,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  colBetween: {
    gap: 12,
  },
  cardView: {
    backgroundColor: colors.light.background,
    padding: 16,
    borderRadius: 8,
    gap: 16,
  },
  cardText: {
    color: colors.dark.text,
    fontWeight: 500,
    fontSize: 16,
  },
})