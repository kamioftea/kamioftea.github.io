---
tags:
  - post
  - board-games
  - game-jam
  - game-design
  - animal-rescue-game
title: Needy Cat Game Jam
header: Needy Cat Game Jam
date: 2020-06-05T22:03:36.000Z
updated: 2020-06-06T11:36:26.000Z
eleventyExcludeFromCollections: true
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/7b695487-07e7-4f1a-830d-c1b600966b00.JPG
---
Last weekend I took part in a charity table-top game jam organised by Needy Cat Games in aid of Feline and Wildlife
Rescue Nottingham. It ran for 48 hours, Friday to Sunday. I'm writing here to talk about the process I went through to
build my game. 

You can see more details of the event itself on the Needy Cat website. They were mentioning that they will probably run
one again. It was a lot of fun and I recommend anyone interested in this sort of thing to give it a go.

{% renderFile './_includes/cards/bookmark.njk', {
 "url": "https://www.needycatgames.com/blog/2020/5/15/join-us-for-a-game-jam-and-help-some-needy-cats",
 "title": "Join us for a Game Jam - and help some Needy Cats! — Needy Cat Games",
 "icon_url": "https://images.squarespace-cdn.com/content/v1/5924341c59cc68a4582034fc/1517465390890-HHTL9QMFCC9IIRY21B21/ke17ZwdGBToddI8pDm48kKiu4DoEndA9NUr2Wxudvep7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z5QHyNOqBUUEtDDsRWrJLTmHn8vUrf3k8CboE2z68MTpzStVIx18CFTeKhZjCAbzbwMZ1SLOxGWwCG7okUsCdFP/favicon.ico?format=100w",
 "author": "James Hewitt",
 "publisher": "Needy Cat Games",
 "image_url": "http://static1.squarespace.com/static/5924341c59cc68a4582034fc/t/5ebece6176e7e3752ed721bd/1589563019467/Onyx.jpg?format=1500w",
 "content": "<p>Needy Cat Games is a small tabletop games design studio based in Nottingham, creating bespoke designs and offering a comprehensive rules review service. </p>"
} %}

You can get my final submission here: <a href="__GHOST_URL__/content/images/2020/06/animal-rescue-game.pdf">Animal
Rescue Game.pdf</a>

I've recently taken part in their online table-top games design course, and this was my first time to put this into
practice. The theme of Pets and/or Wildlife, and we had to include at least one of three mechanics: Drafting, Ladder
climbing, and/or Score-and-reset. There was also strict limits on what components we could use, which really shaped the
design space and made for a very interesting challenge.

* The final submission had to be a maximum of 3 pages, inclusive of rules, play sheets, printable cards, etc.
* Up to twenty counters, in any mix of up to four colours.
* Up to ten identical Six-sided dice
* Tools to make components, e.g. pen/pencils, scissors, glue, card.

## First Thoughts
I had a bit of a handicap as I was at work until 6pm. I'd read the document with the theme and mechanics on my lunch
break, so was turning over ideas in the back of my head when I could too.

For the theme I wanted to lean into the charity support, so decided to vaguely build a game about animal rescue. For
mechanics I definitely wanted to use at least drafting, it's one of my favourite board game mechanics in general. The
default implementation would be to use cards but it would be difficult to fit a decent set of cards into three pages
alongside rules. I turned to the dice, and decided to see if there was any mileage in having the players draft dice to
limit their choice of actions. 

For dice-drafting to work, I need a pool of actions to match up to dice. If the players are managing wildlife rescue
centers then I have options for rescuing animals, feeding them and caring for any problems they have, and getting them
adopted. I'm also starting to look for ways for players to mitigate the randomness of dice, and to make sure whoever is
drafting last still has choice. 

At this point I reach for some pencil and paper, sketch out a grid with six rows, and start brainstorming some actions.
I started split on feed, rescue, first aid/surgery, maintenance, training, and adoption. For these to make sense there
need to be animals to rescue, that possibly need medical help, and may be more or less appealing for adoption. 

## Test Build
The course hammered home the idea of getting the core mechanics/components tested as soon as possible. Get as simple a
mock-up as you can get away with and play assuming setup has been done. Having done this I totally agree and it really
helped. It was quickly obvious that having a dice face per action type lead to dead-ends where the dice left to a player
were useless. 

The game quickly morphed into getting to choose to focus on food/donations, animal care, or managing people with your
action. The dice determined the nuance of those options. For food the game ended up with five food resources. Mostly,
this was decided because it allowed me to use the 20 tokens to track these for four players. I added in money that could
be used to purchase any of the different foods, to make the sixth result. There wasn't a simple way to assign these to
faces in a meaningful way, but it did end up mattering how they matched up to the other options. I ended up making the
assignment random, to sneak in a bit of replayability.

For people management, this started off as an action for people coming along and adopting animals, and one for
volunteers that helped out at the centre. Particularly the volunteer action needed to feel versatile, and it ended up
being that the player took the dice and could spend pips from that dice to do instant actions in the future. The adopt
action was feeling too much like the care action. It also had its better versions on faces three and four, to prevent it
competing with the other actions, and this felt arbitrary. I tried merging them on a whim, and it felt much better so it
stayed. It simplified things, and added a nice tension to the decision to spend volunteers, as you also need to hold
them back for the purposes of scoring.



