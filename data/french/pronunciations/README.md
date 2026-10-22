# Québec French pronunciation data

The word files keep two required strings: `pronunciation` for the readable guide and `ipaPronunciation` for IPA, without surrounding brackets. Both include the displayed article. The app supplies parentheses for readable guides and square brackets for IPA.

## Source and credit

Copyright (c) Marie-Hélène Côté, Université de Lausanne.

Author: Marie-Hélène Côté.

Converted (file format and phoneset) by Brigitte Bigi, CNRS, Laboratoire Parole et Langage, Aix-en-Provence, France.

- [SPPAS French resource documentation](https://sppas.org/resources_fra.html)
- [Downloaded Québec French package](https://sppas.org/resources/frq.zip), retrieved October 22, 2026
- Dictionary inside that package: `dict/frq.dict`
- [Original author notice](FRQ-AUTHORS.txt)
- [Research description](https://aclanthology.org/2020.lrec-1.655/): Lancien, Côté, and Bigi (2020), _Developing Resources for Automated Speech Processing of Quebec French_

The publisher identifies the pronunciation dictionary as GNU GPL, without specifying a version in its resource documentation or dictionary author file. The retained dictionary subset and adaptations here are distributed under [GNU GPL version 3](GPL-3.0.txt), using the GPL option for a work that does not specify a version. Preserve the author notice and license with redistributed dictionary-derived data, and make its editable source and modifications available under the GPL. This notice applies to the dictionary material and its adaptations; it does not relicense unrelated application code or assets. A README acknowledgment alone does not replace the license's distribution requirements.

The archive's acoustic models have a separate noncommercial license. No acoustic models, recordings, or SPPAS program code are included or used by the app.

## Editorial method and provenance

`frq-source.dict` preserves the editable SAMPA entries used for this conversion. `provenance.json` records every production word ID, with `dictionary` or `inferred`, the related FRQ headwords, and an explanation of editorial changes. These are internal data records, not learner-facing confidence labels. Articles are composed from the stored article and the word's initial sound; elided articles, plural liaison, and the special plural pronunciation of _œufs_ are handled explicitly.

SAMPA is converted using the publisher's Québec phone inventory. Examples: `R` → `ʁ`, `S` → `ʃ`, `H` → `ɥ`, `3` → `ɜ`, `I` → `ɪ`, `Y` → `ʏ`, `A~` → `ɑ̃`, and `U~/` → `œ̃`. The transcriptions retain FRQ's Québec vowel distinctions. They are not narrow transcriptions of every connected-speech process, such as automatic affrication or every optional schwa deletion.

Missing forms are composed from available words or inferred from spelling, inflection, Québec pronunciation conventions, and passage meaning. Homographs are reviewed by sense: for example, the clothing word _jean_ is not transcribed like the given name Jean, and determiner _tous_ differs from the standalone pronoun. Inferred entries remain estimates, not verified dictionary quotations. No production words are omitted.

When adding or correcting a word:

1. Update both pronunciation fields, including the displayed article and any liaison or elision.
2. Add or update its provenance record. Use `inferred` whenever the complete word form is estimated or a dictionary match is changed editorially.
3. Retain any newly used FRQ entries in `frq-source.dict`, or record an alternative reference and its reuse terms.
4. Keep IPA without brackets; use the Noto Sans IPA font for display.
