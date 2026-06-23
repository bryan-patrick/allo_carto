# Allô Carto

**_Work in progress!_**

![App preview](preview.jpg)

## Dev Notes

- May 15, 2026 | Started rebuilding in React Native. I preserved the flutter version under branch `v1-flutter`.

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

### Alerts

#### Dark

- Success: #032B1C

- Warning: #332105

- Danger: #3E0E14

#### Light

- Success: #DDFFD6

- Warning: #FFC670

- Danger: #FF7081

### Fonts

**Lexend** is used throughout the application, with **Azeret Mono** for compact rank/CEFR labels. Static font weights live in `app/assets/fonts/` and are loaded asynchronously via the `useFonts` hook in Expo.

https://blog.logrocket.com/how-to-add-custom-fonts-react-native/

## Roadmap

- DB sqlite? Nous besoin quelque chose sur le frontend. Ce sera cree avec decks premiere et les words apre.
- Rarate et styles des cartes. Les cartes plus rares ont des styles plus cool.
- Idea pour deck du rare, quand un personne besoin mots nouveaux, cest bonne pour mots le personne ne trouve pa

## TODO

Real quick so I don't forget...

- d̶e̶c̶k̶ ̶r̶e̶s̶u̶l̶t̶s̶ ̶r̶o̶u̶t̶e̶
- u̶s̶e̶r̶/̶s̶t̶a̶t̶s̶/̶w̶o̶r̶d̶s̶ ̶t̶a̶b̶l̶e̶
- U̶s̶e̶r̶ ̶t̶a̶b̶l̶e̶ ̶w̶r̶i̶t̶e̶s̶
- W̶o̶r̶d̶ ̶t̶a̶b̶l̶e̶ ̶w̶r̶i̶t̶e̶s̶
- t̶e̶s̶t̶i̶n̶g̶ ̶l̶i̶b̶
- App icon and cleaning out the images dir
- Deck progress (progress bar, count, etc.)
- accessibility roles
- D̶e̶c̶k̶ ̶c̶a̶t̶e̶g̶o̶r̶i̶z̶a̶t̶i̶o̶n̶
- F̶i̶l̶l̶e̶r̶ ̶w̶o̶r̶d̶s̶ ̶n̶e̶e̶d̶s̶ ̶a̶ ̶n̶e̶w̶ ̶d̶b̶ ̶m̶e̶t̶h̶o̶d̶
- Include deck colors on flash cards
- A̶d̶d̶ ̶w̶o̶r̶d̶s̶ ̶p̶r̶o̶p̶e̶r̶l̶y̶ ̶t̶o̶ ̶t̶h̶e̶ ̶n̶e̶w̶ ̶d̶e̶c̶k̶s̶
- Card decoration / color badge based on letters and mapped colors of the word IDs
- SVG chapter and progress map (visual and data)
- Place hero image frame (like a polaroid or something? Idk)
- B̶r̶u̶h̶ ̶y̶o̶u̶ ̶n̶e̶e̶d̶ ̶m̶o̶r̶e̶ ̶w̶o̶r̶d̶s̶ ̶w̶i̶t̶h̶ ̶t̶h̶e̶ ̶s̶a̶m̶e̶ ̶p̶a̶r̶t̶ ̶o̶f̶ ̶s̶p̶e̶e̶c̶h̶ ̶s̶h̶e̶e̶s̶h̶
- Deck count on place selection view
- Word rank counts on decks
- Chapter select list view
- R̶a̶r̶i̶t̶y̶ ̶o̶n̶ ̶f̶l̶a̶s̶h̶ ̶c̶a̶r̶d̶s̶
- Card Collection page
- Random deck option
- Practice words frequently gotten wrong
- We should add "repeat deck" or "do a random deck" buttons on the results view
- Cards unlock secret decks / these are very hard decks / secret deck unlock indicator, probably a lock SVG
- Image loading (is lazy)
- Mastering a word should "remove" it from the deck? This could also help with unlocking next decks/chapters
- Completion steps (Results -> Experience gain + coins -> )

## Free art and assets credits

### Placeholder images

- [unDraw](https://undraw.co/)
- [Fabnel LDN — Vibrant aisle in supermarket with drinks display (Pexels)](https://www.pexels.com/photo/vibrant-aisle-in-supermarket-with-drinks-display-33690927/) — Temporary artwork for the Grocery Store deck.
- [Dawn drop off](https://unsplash.com/photos/cars-on-a-road-vxaTycfb78w?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink)
- [Trouble in the terminal](https://unsplash.com/photos/building-interior-photograph-l5fDJ3I-9Uk?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink)
- [To the gate](https://www.pexels.com/photo/airbus-at-airport-16562841/)
- [Elevator epics](https://www.pexels.com/photo/hand-picking-the-floor-in-the-elevator-16026071/)
