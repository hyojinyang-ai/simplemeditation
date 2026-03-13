import { describe, it, expect } from 'vitest';
import { stoicQuotes, getRandomQuote, type Quote } from '../quotes';

describe('stoicQuotes', () => {
  it('should have exactly 15 quotes', () => {
    expect(stoicQuotes).toHaveLength(15);
  });

  it('should have Quote objects with text and author fields', () => {
    stoicQuotes.forEach((quote) => {
      expect(quote).toHaveProperty('text');
      expect(quote).toHaveProperty('author');
      expect(typeof quote.text).toBe('string');
      expect(typeof quote.author).toBe('string');
      expect(quote.text.length).toBeGreaterThan(0);
      expect(quote.author.length).toBeGreaterThan(0);
    });
  });
});

describe('getRandomQuote', () => {
  it('should return a valid Quote object', () => {
    const quote = getRandomQuote();
    expect(quote).toHaveProperty('text');
    expect(quote).toHaveProperty('author');
    expect(typeof quote.text).toBe('string');
    expect(typeof quote.author).toBe('string');
  });

  it('should return different quotes on multiple calls (randomness)', () => {
    const quotes = new Set<string>();

    // Run 20 times to test randomness
    for (let i = 0; i < 20; i++) {
      const quote = getRandomQuote();
      quotes.add(quote.text);
    }

    // We should get at least 2 different quotes (very high probability with 15 quotes)
    expect(quotes.size).toBeGreaterThanOrEqual(2);
  });

  it('should only return quotes from stoicQuotes array', () => {
    const quoteTexts = stoicQuotes.map(q => q.text);

    for (let i = 0; i < 10; i++) {
      const quote = getRandomQuote();
      expect(quoteTexts).toContain(quote.text);
    }
  });
});
