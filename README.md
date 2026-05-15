# Allô Cartô

**_Work in progress!_**

Have you ever caught yourself doomscrolling while waiting for food to cook, the shower to heat up, a bus to arrive, or waiting for someone to stop talking to you on the phone and think "damn man, I could be practicing my French right now"?

Yeah me too! That's why I built this.

It's a French learning app. Open it, jump right in to reviewing some flashcards (decks are created based on adaptive scoring so you always get words and phrases you actually need to work on) then close it and move on.

Fast, simple, and helps you retain new French words every day.

## Dev Notes

- May 15, 2026 | Started rebuilding in React Native. This is much easier than trying to use it as a flutter learning project. I'd like to get this done, I actually want to use it! I preserved the flutter version under branch `v1-flutter`.

![App preview](preview.jpg)

## Style Guide

### Colors

#### Dark

- Primary : `#1C5B5E`

- Secondary : `#762D3D`

- Text : `#121212`

- Background : `#131A1B`

- Border : `#1B2B31`

- Secondary Border : `#382326`

#### Light

- Primary: `#7BADA6`

- Secondary: `#E09FAD`

- Text: `#F7F7F7`

- Background: `#8CABA0`

- Border: `#465B5D`

- Secondary Border: `#6B474B`

### Fonts

**Lexend** is used throughout the application. The font is included in `app/assets/fonts/lexend-variable.ttf` and loaded asychonously via the `useFonts` hook via expo.

https://blog.logrocket.com/how-to-add-custom-fonts-react-native/
