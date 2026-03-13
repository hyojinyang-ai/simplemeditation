export interface Quote {
  text: string;
  author: string;
}

export const stoicQuotes: Quote[] = [
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "He who fears death will never do anything worthy of a living man.", author: "Seneca" },
  { text: "It is not things that disturb us, but our judgments about things.", author: "Epictetus" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
  { text: "We suffer more in imagination than in reality.", author: "Seneca" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "True happiness is to enjoy the present, without anxious dependence upon the future.", author: "Seneca" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "The present moment is all you ever have.", author: "Eckhart Tolle" },
  { text: "Wherever you are, be there totally.", author: "Eckhart Tolle" },
  { text: "In today's rush, we all think too much, seek too much, want too much — and forget about the joy of just being.", author: "Eckhart Tolle" },
];

export const getRandomQuote = (): Quote => {
  return stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)];
};
