// Description:
//   Hubot extension that will hear/respond to hey janet commands
//
// Author:
//   Matt Erickson (MutMatt) Matt@MattErickson.me
//
// Configuration:
//   None
//
// Dependencies:
//   None
//
// Commands:
//   hubot respond to {a text} with {value} - Creates a respond to {a text} and responds with value {value}
//   hubot here respond to {a text} with {value} - Creates a respond to {a text} and responds with value {value} but in the current room
//   hubot delete respond to {a text} - Deletes respond to {a text}
//   hubot from here delete respond to {a text} - Deletes respond to {a text} from the current room
//   hubot list responds - Lists all responds

module.exports = function(robot) {
  "use strict";
  const heyJanetRegex = /hey(,)?\sjanet.*/i;
  //const robotListen = process.env.CAN_HEAR ? robot.hear : robot.respond;
  //const robotListen = robot.hear;

  robot.hear(heyJanetRegex, function(res) {
    const randomQuote =
      janetQuotes[Math.floor(Math.random() * janetQuotes.length)];
    const msg = {
      attachments: [
        {
          author_name: "Janet",
          thumb_url: 'https://vignette.wikia.nocookie.net/thegoodplace/images/e/e2/4janet.jpg/revision/latest/scale-to-width-down/310',
          color: "#6dba66",
          text: randomQuote,
        }
      ]
    };
    res.send(msg);
  });

  const janetQuotes = [
    "Humans only live 80 years, and they spend so much of it just waiting for things to be over.",
    "Can I get you started with some drinks? Our specialty cocktail tonight is the Fourth of July. It's half an apple pie blended with Southern Comfort and Coca-Cola, served in a Chevy hubcap.",
    'Simone and Chidi are good together. I\'ve been running simulations on what their kids will be like. One of them is hot enough to be on "The Bachelor" and smart enough to never go on "The Bachelor."',
    "Ooh, I've never had to walk before, this is fun! [Walks a few steps] Now I'm bored. Walking is dumb.",
    "Oh, really? Is it an error to act unpredictably and behave in ways that run counter to how you were programmed to behave?",
    "It's turns out the best Janet was the Janet that was inside Janet all along.",
    "Fun fact, Janet is me.",
    "Fun fact... The first Janet had a click wheel.",
    "I know what you have to do now. Kill me! Sorry, I say everything in a cheery manner, but in this case in may be inappropriate, so I'll try again.",
    "I suppose after 802 reboots I must have gained the ability to lie. That's fun! I want to try to lie again. I love your outfit.",
    "Hi, guys! I'm broken.",
    "Fun fact... mathematically, it's equally likely to either im- or ex-plode.",
    "I have tickets to Hamilton next week, and there's a rumor that Daveed Diggs is coming back!",
    "That's the good news. The bad news is I seem to be losing my ability to sustain object permanence. So it's sort of a glass half full, glass stops existing in time and space kind of deal.",
    "Fun fact, a 'wheelhouse' is a part of a boat.",
    "Fun fact, all deceased members of the Portland Trail Blazers basketball team are also in The Bad Place.",
    "There have been 25 generations of Janet. Each new update of Janet gains more wisdom and social abilities. Fun fact: the first Janet had a click wheel.",
    "What do you think happens when people walk through the door? It's the only thing in the universe I don't know.",
    "The judge gave me the power to make you an actual human.",
    "Where does this hope come from, man? This insane hope that people are worth the trouble?",
    "Eleanor told me that instead of being sad I should \"Go get it, girl\" so I'm going to go get it, girl.",
    "Love isn't a triange. It's a five dimensional blob, so......",
    "I don't have a mom, so I've been experimenting with thinking of The Judge as my mom.",
    "Farts.",
    "What up, skidmarks?"
  ];
};
