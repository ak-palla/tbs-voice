import { generateChatTitle, validateTitle } from '../title-generator';

describe('Title Generator', () => {
  describe('validateTitle', () => {
    test('should validate proper business titles', () => {
      expect(validateTitle('Social Media Marketing Strategy')).toBe(true);
      expect(validateTitle('Digital Brand Development')).toBe(true);
      expect(validateTitle('Customer Acquisition Framework')).toBe(true);
    });

    test('should reject invalid titles', () => {
      expect(validateTitle('How Business How Market')).toBe(false);
      expect(validateTitle('The Digital Strategy')).toBe(false);
      expect(validateTitle('A B')).toBe(false); // Too short
      expect(validateTitle('This Is A Very Long Title')).toBe(false); // Too long
    });
  });

  describe('generateChatTitle', () => {
    test('should generate proper business titles', async () => {
      const queries = [
        'How to showcase my business services to the digital audience via facebook and instagram?',
        'What are the best ways to market my products online?',
        'How can I improve my customer engagement?'
      ];

      for (const query of queries) {
        const title = await generateChatTitle(query);
        expect(validateTitle(title)).toBe(true);
        
        // Title should be 3-5 words
        const wordCount = title.split(' ').length;
        expect(wordCount).toBeGreaterThanOrEqual(3);
        expect(wordCount).toBeLessThanOrEqual(5);
        
        // Should not start with question words or articles
        expect(title).not.toMatch(/^(How|What|Why|When|Where|Who|A|An|The)\s/i);
        
        // Each word should be capitalized
        const words = title.split(' ');
        words.forEach(word => {
          expect(word[0]).toMatch(/[A-Z]/);
        });
      }
    });
  });
}); 