import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';

/**
 * Image src
 */
const coffeeHouse = require('@/src/app/assets/images/decks/coffee-house.jpg');

/**
 * Our first deck!
 *
 * Since I'm in a coffee shop right now,
 * it seemed appropriate for the theme
 * to be about a coffee shop.
 */
export const DeckCoffeeShop: CardDeck = {
	title: 'Coffee Shop',
	description:
		'Explore french where water meets beans. Words related to everything in a coffee house.',
	CEFR: ['A1', 'A2'],
	words: [],
	image: coffeeHouse,
	wordIds: [
		'word_interjection_salut',
		'word_noun_cafe',
		'word_noun_cafetiere',
		'word_noun_divan',
		'word_noun_table',
		'word_noun_chaise',
		'word_noun_tasse',
		'word_noun_velo',
		'word_adjective_pluvieux',
		'word_adjective_chaud',
		'word_adjective_froid',
		'word_noun_glace',
		'word_noun_fenetre',
		'word_noun_ami',
		'word_noun_amie',
		'word_noun_travail',
		'word_noun_ordinateur_portable',
		'word_noun_sac_a_dos',
		'word_noun_pain',
		'word_noun_toilette',
		'word_noun_cle',
		'word_verb_ouvrir',
		'word_verb_fermer',
		'word_noun_eau',
		'word_noun_addition',
		'word_expression_avoir_faim',
		'word_expression_avoir_soif',
		'word_noun_wifi',
		'word_noun_mot_de_passe',
		'word_adjective_heureux',
		'word_adjective_heureuse',
		'word_adjective_triste',
		'word_noun_odeur',
		'word_noun_parapluie',
		'word_adjective_chaleureux',
		'word_noun_menu',
		'word_noun_chargeur',
		'word_expression_combien',
		'word_expression_bonne_journee',
		'word_noun_musique',
		'word_adjective_tranquille',
		'word_noun_livre',
		'word_noun_lecture',
		'word_noun_lait',
		'word_adjective_petit',
		'word_adjective_petite',
		'word_adjective_moyen',
		'word_adjective_moyenne',
		'word_adjective_grand',
		'word_adjective_grande',
		'word_expression_sil_vous_plait',
		'word_verb_etudier',
		'word_verb_ecrire',
		'word_verb_dessiner',
		'word_noun_blonde',
		'word_noun_chum',
		'word_interjection_tabarnak',
		'word_noun_poubelle',
	],
};
