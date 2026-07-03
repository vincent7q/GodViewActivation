export interface Quote {
  text: string;
  author: string;
}

// Rotation feeds the mid-ascend beat across repeat journeys. The reveal
// beat has its own fixed line (REVEAL_QUOTE).
export const QUOTES: Quote[] = [
  {
    text: 'Suddenly, from behind the rim of the Moon, there emerges a sparkling blue and white jewel… home.',
    author: 'Edgar Mitchell, Apollo 14',
  },
  {
    text: 'From out there on the Moon, international politics look so petty.',
    author: 'Edgar Mitchell, Apollo 14',
  },
  {
    text: 'We came all this way to explore the Moon, and the most important thing is that we discovered the Earth.',
    author: 'William Anders, Apollo 8',
  },
  {
    text: 'The Earth was small, light blue, and so touchingly alone… our home that must be defended like a holy relic.',
    author: 'Aleksei Leonov, cosmonaut',
  },
];

// The reveal beat's dedicated line — always this one, never rotated.
export const REVEAL_QUOTE: Quote = {
  text: 'Look again at that dot. That’s here. That’s home. That’s us.',
  author: 'Carl Sagan',
};

export class QuoteRotation {
  private index = 0;

  constructor(private readonly quotes: Quote[]) {}

  next(): Quote {
    const quote = this.quotes[this.index];
    this.index = (this.index + 1) % this.quotes.length;
    return quote;
  }
}
