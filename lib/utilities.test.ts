/**
 * Utility Functions Test Suite
 * Unit tests for validation, formatting, and error handling utilities
 */

import {
  isValidConfidence,
  isValidImageUrl,
  isValidHash,
  isValidEmail,
  isValidDecision,
  sanitizeText,
  confidenceToPercent,
  classifyConfidence,
} from "./validation-utils"

import {
  formatBytes,
  formatMilliseconds,
  formatPercent,
  formatDecision,
  truncateString,
  createSeparator,
} from "./formatting-utils"

import {
  validateRange,
  assert,
  retryWithBackoff,
  ForensicAnalysisError,
  ValidationError,
} from "./error-handling"

// ============ VALIDATION TESTS ============

describe("Validation Utilities", () => {
  describe("isValidConfidence", () => {
    test("should accept valid confidence values", () => {
      expect(isValidConfidence(0)).toBe(true)
      expect(isValidConfidence(0.5)).toBe(true)
      expect(isValidConfidence(1)).toBe(true)
    })

    test("should reject invalid confidence values", () => {
      expect(isValidConfidence(-0.1)).toBe(false)
      expect(isValidConfidence(1.1)).toBe(false)
      expect(isValidConfidence(NaN)).toBe(false)
      expect(isValidConfidence(Infinity)).toBe(false)
    })

    test("should handle non-number types", () => {
      expect(isValidConfidence("0.5" as any)).toBe(false)
      expect(isValidConfidence(null as any)).toBe(false)
      expect(isValidConfidence(undefined as any)).toBe(false)
    })
  })

  describe("isValidImageUrl", () => {
    test("should accept valid image URLs", () => {
      expect(isValidImageUrl("https://example.com/image.jpg")).toBe(true)
      expect(isValidImageUrl("http://example.com/image.png")).toBe(true)
      expect(isValidImageUrl("/path/to/image.jpg")).toBe(true)
      expect(isValidImageUrl("./image.webp")).toBe(true)
    })

    test("should reject invalid image URLs", () => {
      expect(isValidImageUrl("")).toBe(false)
      expect(isValidImageUrl("not-a-url")).toBe(false)
      expect(isValidImageUrl("https://example.com/image.txt")).toBe(false)
      expect(isValidImageUrl("https://example.com/image")).toBe(false)
    })
  })

  describe("isValidHash", () => {
    test("should accept valid SHA256 hashes", () => {
      expect(
        isValidHash(
          "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
        )
      ).toBe(true)
    })

    test("should accept valid MD5 hashes", () => {
      expect(isValidHash("a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6")).toBe(true)
    })

    test("should reject invalid hashes", () => {
      expect(isValidHash("short")).toBe(false)
      expect(isValidHash("invalid_hash_with_special_chars_!@#")).toBe(false)
    })
  })

  describe("isValidDecision", () => {
    test("should accept valid decisions", () => {
      expect(isValidDecision("real")).toBe(true)
      expect(isValidDecision("synthetic")).toBe(true)
    })

    test("should reject invalid decisions", () => {
      expect(isValidDecision("invalid")).toBe(false)
      expect(isValidDecision("Real")).toBe(false)
      expect(isValidDecision("")).toBe(false)
    })
  })

  describe("classifyConfidence", () => {
    test("should classify high confidence", () => {
      expect(classifyConfidence(0.95)).toBe("very_high")
      expect(classifyConfidence(0.8)).toBe("high")
    })

    test("should classify medium confidence", () => {
      expect(classifyConfidence(0.65)).toBe("medium")
    })

    test("should classify low confidence", () => {
      expect(classifyConfidence(0.5)).toBe("low")
      expect(classifyConfidence(0.3)).toBe("very_low")
    })
  })
})

// ============ FORMATTING TESTS ============

describe("Formatting Utilities", () => {
  describe("formatBytes", () => {
    test("should format bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 B")
      expect(formatBytes(1024)).toBe("1 KB")
      expect(formatBytes(1048576)).toBe("1 MB")
      expect(formatBytes(1073741824)).toBe("1 GB")
    })
  })

  describe("formatMilliseconds", () => {
    test("should format milliseconds correctly", () => {
      expect(formatMilliseconds(500)).toContain("500")
      expect(formatMilliseconds(500).endsWith("ms")).toBe(true)
      expect(formatMilliseconds(1000)).toContain("1")
      expect(formatMilliseconds(1000).endsWith("s")).toBe(true)
    })
  })

  describe("formatPercent", () => {
    test("should format percentages correctly", () => {
      expect(formatPercent(0.5)).toBe("50.00%")
      expect(formatPercent(0.927, 1)).toBe("92.7%")
      expect(formatPercent(1)).toBe("100.00%")
    })

    test("should handle edge cases", () => {
      expect(formatPercent(0)).toBe("0.00%")
      expect(formatPercent(NaN)).toBe("0%")
    })
  })

  describe("formatDecision", () => {
    test("should format decision correctly", () => {
      expect(formatDecision("real")).toBe("REAL")
      expect(formatDecision("synthetic")).toBe("SYNTHETIC")
    })

    test("should include confidence when provided", () => {
      expect(formatDecision("synthetic", 0.92)).toContain("92.00%")
    })
  })

  describe("truncateString", () => {
    test("should truncate long strings", () => {
      const result = truncateString("This is a very long string", 10)
      expect(result.length).toBe(10)
      expect(result.endsWith("...")).toBe(true)
    })

    test("should not truncate short strings", () => {
      const result = truncateString("Short", 10)
      expect(result).toBe("Short")
    })
  })

  describe("createSeparator", () => {
    test("should create separator lines", () => {
      expect(createSeparator("=", 5)).toBe("=====")
      expect(createSeparator("-", 3)).toBe("---")
    })
  })
})

// ============ ERROR HANDLING TESTS ============

describe("Error Handling Utilities", () => {
  describe("validateRange", () => {
    test("should accept values within range", () => {
      expect(() => validateRange(5, 0, 10, "value")).not.toThrow()
    })

    test("should reject values outside range", () => {
      expect(() => validateRange(15, 0, 10, "value")).toThrow(ValidationError)
    })
  })

  describe("assert", () => {
    test("should pass for true condition", () => {
      expect(() => assert(true, "message")).not.toThrow()
    })

    test("should throw for false condition", () => {
      expect(() => assert(false, "message")).toThrow(ValidationError)
    })
  })

  describe("retryWithBackoff", () => {
    test("should retry on failure", async () => {
      let attempts = 0
      const fn = jest.fn().mockImplementation(() => {
        attempts++
        if (attempts < 2) {
          throw new Error("Temporary failure")
        }
        return "success"
      })

      const result = await retryWithBackoff(fn, 3, 10)
      expect(result).toBe("success")
      expect(fn).toHaveBeenCalledTimes(2)
    })

    test("should give up after max retries", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("Persistent failure"))

      await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe("ForensicAnalysisError", () => {
    test("should create error with code and context", () => {
      const error = new ForensicAnalysisError("ERR_TEST", "Test message", {
        field: "value",
      })

      expect(error.code).toBe("ERR_TEST")
      expect(error.message).toBe("Test message")
      expect(error.context).toEqual({ field: "value" })
    })

    test("should serialize to JSON correctly", () => {
      const error = new ForensicAnalysisError("ERR_TEST", "Test message")
      const json = error.toJSON()

      expect(json.code).toBe("ERR_TEST")
      expect(json.message).toBe("Test message")
      expect(json.timestamp).toBeDefined()
    })
  })
})

// ============ INTEGRATION TESTS ============

describe("Integration Tests", () => {
  test("should validate and format analysis results", () => {
    const decision = "synthetic"
    const confidence = 0.927

    expect(isValidDecision(decision)).toBe(true)
    expect(isValidConfidence(confidence)).toBe(true)
    expect(formatDecision(decision, confidence)).toContain("92.7%")
  })

  test("should handle validation error with context", () => {
    try {
      assert(false, "Validation failed")
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
    }
  })

  test("should classify and format confidence together", () => {
    const confidence = 0.85
    const classification = classifyConfidence(confidence)
    const formatted = formatPercent(confidence, 0)

    expect(classification).toBe("high")
    expect(formatted).toContain("85%")
  })
})
