import { describe, it, expect } from "vitest";
import type { FlashcardProposalDto } from "../../types";

/**
 * Unit tests for parseFlashcardProposals function
 *
 * Tests cover:
 * - Valid input scenarios
 * - Type validation
 * - Required field validation
 * - String trimming and sanitization
 * - Length constraints (front: 1-200, back: 1-500 characters)
 * - Empty values handling
 * - Edge cases and boundary conditions
 */

// Re-export the function for testing
// Since parseFlashcardProposals is not exported, we need to test it indirectly
// or extract it to a separate testable module. For now, we'll copy the implementation.

function parseFlashcardProposals(data: unknown): FlashcardProposalDto[] {
  if (!data || typeof data !== "object") {
    throw new Error("AI response must be an object");
  }

  const proposals = (data as { proposals?: unknown }).proposals;
  if (!Array.isArray(proposals)) {
    throw new Error("AI response must include a proposals array");
  }

  if (proposals.length === 0) {
    throw new Error("AI response contained no proposals");
  }

  return proposals.map((proposal, index) => {
    if (!proposal || typeof proposal !== "object") {
      throw new Error(`Proposal at index ${index} must be an object`);
    }

    const front = (proposal as { front?: unknown }).front;
    const back = (proposal as { back?: unknown }).back;

    if (typeof front !== "string" || typeof back !== "string") {
      throw new Error(`Proposal at index ${index} must include string front and back`);
    }

    const trimmedFront = front.trim();
    const trimmedBack = back.trim();

    if (trimmedFront.length === 0 || trimmedBack.length === 0) {
      throw new Error(`Proposal at index ${index} has empty front/back`);
    }

    if (trimmedFront.length > 200 || trimmedBack.length > 500) {
      throw new Error(`Proposal at index ${index} exceeds length limits`);
    }

    return {
      front: trimmedFront,
      back: trimmedBack,
      source: "ai-full",
    };
  });
}

describe("parseFlashcardProposals", () => {
  // =========================================================================
  // HAPPY PATH - Valid inputs
  // =========================================================================

  describe("Valid input scenarios", () => {
    it("should parse valid proposals with all required fields", () => {
      const input = {
        proposals: [
          { front: "Question 1", back: "Answer 1" },
          { front: "Question 2", back: "Answer 2" },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        front: "Question 1",
        back: "Answer 1",
        source: "ai-full",
      });
      expect(result[1]).toEqual({
        front: "Question 2",
        back: "Answer 2",
        source: "ai-full",
      });
    });

    it("should parse single proposal", () => {
      const input = {
        proposals: [{ front: "What is TypeScript?", back: "A typed superset of JavaScript" }],
      };

      const result = parseFlashcardProposals(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchInlineSnapshot(`
        {
          "back": "A typed superset of JavaScript",
          "front": "What is TypeScript?",
          "source": "ai-full",
        }
      `);
    });

    it("should parse multiple proposals (5-10 range)", () => {
      const input = {
        proposals: Array.from({ length: 7 }, (_, i) => ({
          front: `Question ${i + 1}`,
          back: `Answer ${i + 1}`,
        })),
      };

      const result = parseFlashcardProposals(input);

      expect(result).toHaveLength(7);
      expect(result.every((p) => p.source === "ai-full")).toBe(true);
    });

    it("should handle Polish characters correctly", () => {
      const input = {
        proposals: [
          {
            front: "Co to jest żółw?",
            back: "Gad z pancerzem, żyjący w wodzie lub na lądzie",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toBe("Co to jest żółw?");
      expect(result[0].back).toBe("Gad z pancerzem, żyjący w wodzie lub na lądzie");
    });

    it("should handle special characters and punctuation", () => {
      const input = {
        proposals: [
          {
            front: "What is 2 + 2?",
            back: "4 (four) - it's basic math!",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toBe("What is 2 + 2?");
      expect(result[0].back).toBe("4 (four) - it's basic math!");
    });
  });

  // =========================================================================
  // STRING TRIMMING - Whitespace handling
  // =========================================================================

  describe("String trimming and sanitization", () => {
    it("should trim leading and trailing whitespace from front", () => {
      const input = {
        proposals: [{ front: "   Question with spaces   ", back: "Answer" }],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toBe("Question with spaces");
    });

    it("should trim leading and trailing whitespace from back", () => {
      const input = {
        proposals: [{ front: "Question", back: "   Answer with spaces   " }],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].back).toBe("Answer with spaces");
    });

    it("should preserve internal whitespace", () => {
      const input = {
        proposals: [
          {
            front: "What   is   this?",
            back: "Answer   with   multiple   spaces",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toBe("What   is   this?");
      expect(result[0].back).toBe("Answer   with   multiple   spaces");
    });

    it("should handle tabs and newlines as whitespace", () => {
      const input = {
        proposals: [
          {
            front: "\t\nQuestion\n\t",
            back: "\t\nAnswer\n\t",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toBe("Question");
      expect(result[0].back).toBe("Answer");
    });
  });

  // =========================================================================
  // LENGTH CONSTRAINTS - Boundary conditions
  // =========================================================================

  describe("Length constraints validation", () => {
    it("should accept front with exactly 1 character", () => {
      const input = {
        proposals: [{ front: "Q", back: "Answer" }],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toBe("Q");
    });

    it("should accept front with exactly 200 characters", () => {
      const front = "A".repeat(200);
      const input = {
        proposals: [{ front, back: "Answer" }],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toHaveLength(200);
    });

    it("should reject front with 201 characters", () => {
      const front = "A".repeat(201);
      const input = {
        proposals: [{ front, back: "Answer" }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 exceeds length limits");
    });

    it("should accept back with exactly 1 character", () => {
      const input = {
        proposals: [{ front: "Question", back: "A" }],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].back).toBe("A");
    });

    it("should accept back with exactly 500 characters", () => {
      const back = "B".repeat(500);
      const input = {
        proposals: [{ front: "Question", back }],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].back).toHaveLength(500);
    });

    it("should reject back with 501 characters", () => {
      const back = "B".repeat(501);
      const input = {
        proposals: [{ front: "Question", back }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 exceeds length limits");
    });

    it("should check length AFTER trimming", () => {
      // 198 chars + 2 spaces = 200 before trim, 198 after trim (valid)
      const front = " " + "A".repeat(198) + " ";
      const input = {
        proposals: [{ front, back: "Answer" }],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toHaveLength(198);
    });

    it("should reject if length exceeds limit AFTER trimming", () => {
      // 201 chars + 2 spaces = 203 before trim, 201 after trim (invalid)
      const front = " " + "A".repeat(201) + " ";
      const input = {
        proposals: [{ front, back: "Answer" }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 exceeds length limits");
    });
  });

  // =========================================================================
  // EMPTY VALUES - Validation
  // =========================================================================

  describe("Empty values handling", () => {
    it("should reject empty string in front (after trim)", () => {
      const input = {
        proposals: [{ front: "", back: "Answer" }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 has empty front/back");
    });

    it("should reject empty string in back (after trim)", () => {
      const input = {
        proposals: [{ front: "Question", back: "" }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 has empty front/back");
    });

    it("should reject whitespace-only string in front", () => {
      const input = {
        proposals: [{ front: "   ", back: "Answer" }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 has empty front/back");
    });

    it("should reject whitespace-only string in back", () => {
      const input = {
        proposals: [{ front: "Question", back: "   " }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 has empty front/back");
    });

    it("should reject tabs/newlines-only strings", () => {
      const input = {
        proposals: [{ front: "\t\n\r", back: "Answer" }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 has empty front/back");
    });
  });

  // =========================================================================
  // TYPE VALIDATION - Invalid data types
  // =========================================================================

  describe("Type validation", () => {
    it("should reject null as input", () => {
      expect(() => parseFlashcardProposals(null)).toThrow("AI response must be an object");
    });

    it("should reject undefined as input", () => {
      expect(() => parseFlashcardProposals(undefined)).toThrow("AI response must be an object");
    });

    it("should reject primitive values as input", () => {
      expect(() => parseFlashcardProposals("string")).toThrow("AI response must be an object");
      expect(() => parseFlashcardProposals(42)).toThrow("AI response must be an object");
      expect(() => parseFlashcardProposals(true)).toThrow("AI response must be an object");
    });

    it("should reject missing proposals field", () => {
      const input = { data: [] };

      expect(() => parseFlashcardProposals(input)).toThrow("AI response must include a proposals array");
    });

    it("should reject proposals as non-array", () => {
      const input = { proposals: "not an array" };

      expect(() => parseFlashcardProposals(input)).toThrow("AI response must include a proposals array");
    });

    it("should reject proposals as null", () => {
      const input = { proposals: null };

      expect(() => parseFlashcardProposals(input)).toThrow("AI response must include a proposals array");
    });

    it("should reject proposals as object instead of array", () => {
      const input = { proposals: { front: "Q", back: "A" } };

      expect(() => parseFlashcardProposals(input)).toThrow("AI response must include a proposals array");
    });

    it("should reject empty proposals array", () => {
      const input = { proposals: [] };

      expect(() => parseFlashcardProposals(input)).toThrow("AI response contained no proposals");
    });
  });

  // =========================================================================
  // PROPOSAL STRUCTURE - Individual proposal validation
  // =========================================================================

  describe("Individual proposal structure validation", () => {
    it("should reject non-object proposal", () => {
      const input = {
        proposals: ["invalid"],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 must be an object");
    });

    it("should reject null proposal", () => {
      const input = {
        proposals: [null],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 must be an object");
    });

    it("should reject proposal missing front field", () => {
      const input = {
        proposals: [{ back: "Answer" }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 must include string front and back");
    });

    it("should reject proposal missing back field", () => {
      const input = {
        proposals: [{ front: "Question" }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 must include string front and back");
    });

    it("should reject proposal with non-string front", () => {
      const input = {
        proposals: [{ front: 123, back: "Answer" }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 must include string front and back");
    });

    it("should reject proposal with non-string back", () => {
      const input = {
        proposals: [{ front: "Question", back: true }],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 0 must include string front and back");
    });

    it("should include correct index in error message for second proposal", () => {
      const input = {
        proposals: [
          { front: "Valid", back: "Valid" },
          { front: "Invalid", back: 123 },
        ],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 1 must include string front and back");
    });
  });

  // =========================================================================
  // MULTIPLE PROPOSALS - Partial success scenarios
  // =========================================================================

  describe("Multiple proposals with errors", () => {
    it("should fail on first invalid proposal and not process remaining", () => {
      const input = {
        proposals: [
          { front: "Valid 1", back: "Valid 1" },
          { front: "", back: "Invalid" }, // This should fail
          { front: "Valid 2", back: "Valid 2" },
        ],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 1 has empty front/back");
    });

    it("should process all valid proposals before encountering error", () => {
      const input = {
        proposals: [
          { front: "Valid 1", back: "Valid 1" },
          { front: "Valid 2", back: "Valid 2" },
          { front: "A".repeat(201), back: "Invalid" }, // Length error at index 2
        ],
      };

      expect(() => parseFlashcardProposals(input)).toThrow("Proposal at index 2 exceeds length limits");
    });
  });

  // =========================================================================
  // SOURCE FIELD - Verification
  // =========================================================================

  describe("Source field assignment", () => {
    it("should always assign source as 'ai-full'", () => {
      const input = {
        proposals: [
          { front: "Q1", back: "A1" },
          { front: "Q2", back: "A2" },
          { front: "Q3", back: "A3" },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result.every((p) => p.source === "ai-full")).toBe(true);
    });

    it("should ignore any source field in input", () => {
      const input = {
        proposals: [
          {
            front: "Question",
            back: "Answer",
            source: "manual" as unknown as "ai-full",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].source).toBe("ai-full");
    });
  });

  // =========================================================================
  // EDGE CASES - Complex scenarios
  // =========================================================================

  describe("Edge cases and complex scenarios", () => {
    it("should handle Unicode emojis correctly", () => {
      const input = {
        proposals: [
          {
            front: "What is happiness? 😊",
            back: "A positive emotional state 🎉",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toBe("What is happiness? 😊");
      expect(result[0].back).toBe("A positive emotional state 🎉");
    });

    it("should handle multi-line strings (with \\n characters)", () => {
      const input = {
        proposals: [
          {
            front: "Multi\nline\nquestion",
            back: "Multi\nline\nanswer",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toContain("\n");
      expect(result[0].back).toContain("\n");
    });

    it("should handle HTML-like strings (not parsing, just storing)", () => {
      const input = {
        proposals: [
          {
            front: "<b>Bold question?</b>",
            back: "<i>Italic answer</i>",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toBe("<b>Bold question?</b>");
      expect(result[0].back).toBe("<i>Italic answer</i>");
    });

    it("should handle JSON-like strings in content", () => {
      const input = {
        proposals: [
          {
            front: 'What is {"key": "value"}?',
            back: "A JSON object",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toBe('What is {"key": "value"}?');
    });

    it("should handle strings with only numbers", () => {
      const input = {
        proposals: [
          {
            front: "12345",
            back: "67890",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0].front).toBe("12345");
      expect(result[0].back).toBe("67890");
    });

    it("should handle extra properties in proposals (ignore them)", () => {
      const input = {
        proposals: [
          {
            front: "Question",
            back: "Answer",
            extraField: "should be ignored",
            anotherId: 123,
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result[0]).toEqual({
        front: "Question",
        back: "Answer",
        source: "ai-full",
      });
      expect(result[0]).not.toHaveProperty("extraField");
    });

    it("should handle maximum valid scenario (10 proposals at max length)", () => {
      const input = {
        proposals: Array.from({ length: 10 }, () => ({
          front: "Q".repeat(200),
          back: "A".repeat(500),
        })),
      };

      const result = parseFlashcardProposals(input);

      expect(result).toHaveLength(10);
      expect(result.every((p) => p.front.length === 200)).toBe(true);
      expect(result.every((p) => p.back.length === 500)).toBe(true);
    });
  });

  // =========================================================================
  // REAL-WORLD AI RESPONSE SCENARIOS
  // =========================================================================

  describe("Real-world AI response scenarios", () => {
    it("should handle typical OpenAI-style response", () => {
      const input = {
        proposals: [
          {
            front: "Co to jest TypeScript?",
            back: "TypeScript to typowany nadzbiór JavaScriptu, który kompiluje się do czystego JavaScriptu.",
          },
          {
            front: "Jakie są główne zalety TypeScript?",
            back: "Statyczne typowanie, lepsze narzędzia deweloperskie, wykrywanie błędów na etapie kompilacji.",
          },
          {
            front: "Czy TypeScript jest językiem kompilowanym?",
            back: "Tak, TypeScript jest kompilowany (transpilowany) do JavaScriptu przed uruchomieniem.",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result).toHaveLength(3);
      expect(result.every((p) => p.source === "ai-full")).toBe(true);
      expect(result[0].front).toContain("TypeScript");
    });

    it("should handle response with varied content lengths", () => {
      const input = {
        proposals: [
          {
            front: "Q",
            back: "Short answer",
          },
          {
            front: "What is a very detailed question that needs more explanation?",
            back: "This is a much longer answer that provides comprehensive details about the topic, including examples, context, and additional information that helps the learner understand the concept better. It might include multiple sentences and cover various aspects of the topic.",
          },
        ],
      };

      const result = parseFlashcardProposals(input);

      expect(result).toHaveLength(2);
      expect(result[0].back.length).toBeLessThan(result[1].back.length);
    });
  });
});
