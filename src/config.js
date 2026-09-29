/* =====================================================================
   EDIT EVERYTHING IN THIS FILE — it is the only file with wedding
   details in it. Everything else is machinery.
   ===================================================================== */

export const weddingConfig = {
  couple1:    'Ganesh',
  couple2:    'Vaishnavi',
  date:       'Sunday, 14 February 2027',
  time:       '6:30 AM onwards',
  venue:      'Sri Kapaleeshwarar Temple',
  city:       'Chennai, Tamil Nadu',
  rsvpUrl:    '#',                       // '#' hides the button's link
  venueUrl:   '#',
  tagline:    'A beautiful beginning',
  familyText: 'Together with their families',
};

/* Drop an mp3 at public/music/wedding-music.mp3.
   The invitation works fine without it — the button marks itself unavailable. */
export const weddingMusic = `${import.meta.env.BASE_URL}music/wedding-music.mp3`;

/* The background film: one continuous shot held as stills in public/frames/
   and scrubbed by the scroll. `count` is rewritten by tools/build-frames.py —
   run that script to re-encode, rather than editing this number by hand. */
export const filmFrames = {
  count: 145,
  src: (n) => `${import.meta.env.BASE_URL}frames/f${String(n).padStart(3, '0')}.webp`,
};

/* Copy shown on each scene. Kept here so the whole script of the invitation
   reads top to bottom in one place. */
export const copy = {
  openingSmall: 'ஒரு அழகான தொடக்கம்...',
  openingTitle: 'திருமண அழைப்பிதழ்',
  scrollHint:   'Scroll',
  invite:       ['request the pleasure of your presence', 'at their wedding celebration'],
  cardKicker:   'சுபமஸ்து',
  cardTitle:    'The Wedding',
  cardBlessing: 'With the blessings of our families',
  closingEyebrow: 'With Love & Blessings',
  closing:      'We can’t wait to celebrate this beautiful beginning with you.',
  closingSub:   'Your presence is our blessing.',
  venueButton:  'View Venue',
  rsvpButton:   'RSVP',
  blessingEnd:  '॥ சுபமஸ்து ॥',
};
