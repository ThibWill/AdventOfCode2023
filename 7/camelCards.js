/*Five of a kind
Four of a kind
Full house
Three of a kind
Two pair
One pair
High card*/

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./game.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = 
`32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`;

const parser = (doc) => doc.split('\n')

const rankHand = (hand) => {
  const findFirstRank = (cards) => {
    const countingCards = (hand) => {
      return hand.reduce((acc, card) => {
        typeof(acc[card]) === 'number' ? acc[card] += 1 : acc[card] = 1;
        return acc
      }, {});
    }

    const ranks = {
      0: (count) => Math.max(...Object.values(count)) === 5,
      1: (count) => Math.max(...Object.values(count)) === 4,
      2: (count) => Object.values(count).includes(3) && Object.values(count).includes(2),
      3: (count) => Math.max(...Object.values(count)) === 3,
      4: (count) => Object.values(count).filter(cardApparition => cardApparition === 2).length === 2,
      5: (count) => Object.values(count).includes(2),
    }

    for (const [rank, condition] of Object.entries(ranks)) {
      const countCard = countingCards(cards);
      if (condition(countCard)) {
        return rank;
      }
    }

    return Object.keys(ranks).length;
  }

  const cards = hand.split('');  
  const strengthCards = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const secondRank = cards.map(card => strengthCards.findIndex(strength => strength === card));

  return {
    firstRank: findFirstRank(cards),
    secondRank,
  };
}

const rankPlayers = (playerInfos) => {
  return playerInfos.sort((player1, player2) => {

    const { firstRank: firstRankPlayer1, secondRank: secondRankPlayer1 } = player1;
    const { firstRank: firstRankPlayer2, secondRank: secondRankPlayer2 } = player2;

    if (firstRankPlayer1 !== firstRankPlayer2) {

      return firstRankPlayer1 > firstRankPlayer2 ? -1 : 1;
    } 

    for (let i = 0; i < 5; i++) {
      if (secondRankPlayer1[i] !== secondRankPlayer2[i]) {
        return secondRankPlayer1[i] > secondRankPlayer2[i] ? -1 : 1;
      }
    }

    return 0;
  })
}

const resultGame = (game) => {
  const playersInfos = game.map(player => {
    const playerPartialInfos = player.split(' ');
    const hand = playerPartialInfos[0];
    const bet = playerPartialInfos[1];

    const { firstRank, secondRank } = rankHand(hand)
    
    return {
      firstRank,
      secondRank,
      bet
    }
  });

  const gameWithPlayersRanked = rankPlayers(playersInfos);

  return gameWithPlayersRanked.reduce((acc, player, index) => acc + parseInt(player.bet) * (index + 1), 0);
}

const doc = await loadDocument();

const game = parser(doc);
console.log(resultGame(game))


// console.log(rankHand('56558'))