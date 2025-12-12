/**
 * README: Development Guidelines
 * Best practices and conventions for contributing to the forensic system
 */

# Development Guidelines

## Code Organization

### Directory Structure

```
lib/
  ├── core/              # Core detection and analysis
  ├── forensic/          # Forensic report generation
  ├── threat/            # Threat intelligence
  ├── ui/                # Utilities for UI integration
  ├── constants.ts       # Global constants
  ├── types.ts           # TypeScript type definitions
  ├── validation-utils.ts # Input validation
  ├── formatting-utils.ts # Output formatting
  ├── error-handling.ts  # Error classes and handling
  ├── logger.ts          # Logging utility
  └── cache-manager.ts   # Caching system

components/
  ├── ui/                # Reusable UI components
  ├── analysis/          # Analysis-specific components
  └── explainability-viewer.tsx

app/
  ├── api/               # API routes
  ├── analysis/          # Analysis pages
  ├── forensic-analysis/ # Forensic workflow
  └── dashboard/         # Dashboard pages
```

## Coding Standards

### TypeScript

- Use strict mode: `"strict": true` in tsconfig.json
- Always add type annotations to function parameters and returns
- Use `const` by default, `let` when needed, never `var`
- Use interfaces for object shapes, types for unions

### Naming Conventions

```typescript
// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const API_TIMEOUT = 5000

// Functions: camelCase
function analyzeImage() {}
async function generateReport() {}

// Classes: PascalCase
class ForensicAnalyzer {}
class ThreatDatabase {}

// Interfaces: PascalCase, prefix with "I" (optional but recommended)
interface IAnalysisResult {}
type DetectionDecision = "real" | "synthetic"

// Files: kebab-case.ts
// validation-utils.ts
// error-handling.ts
```

### Function Documentation

All public functions should have JSDoc comments:

```typescript
/**
 * Analyze image for synthetic content
 * @param imageUrl - URL or path to image
 * @param options - Analysis options
 * @returns Promise resolving to detection result
 * @throws {ValidationError} If image URL is invalid
 * @throws {TimeoutError} If analysis exceeds timeout
 *
 * @example
 * const result = await analyzeImage("path/to/image.jpg");
 * console.log(result.decision); // "real" or "synthetic"
 */
async function analyzeImage(
  imageUrl: string,
  options?: AnalysisOptions
): Promise<EnsembleDetectionResult> {
  // Implementation
}
```

## Error Handling

Use the provided error classes:

```typescript
import {
  ForensicAnalysisError,
  ValidationError,
  ModelExecutionError,
  TimeoutError,
} from "@/lib/error-handling"

// Validation errors
if (!isValidImageUrl(url)) {
  throw new ValidationError(`Invalid image URL: ${url}`)
}

// Model errors
try {
  result = await runModel(imageData)
} catch (error) {
  throw new ModelExecutionError("Model execution failed", { originalError: error })
}

// Timeout errors
throw new TimeoutError("Image analysis", 5000)
```

## Logging

Use the logger utility:

```typescript
import { logger } from "@/lib/logger"

logger.info("Analysis started", { analysisId, imageUrl })
logger.debug("Processing features", { featureCount: 10 })
logger.warn("Low confidence result", { confidence: 0.52 })
logger.error("Analysis failed", error, { analysisId })
logger.critical("System error", criticalError, { context: "analysis_pipeline" })
```

## Input Validation

Always validate inputs:

```typescript
import {
  isValidImageUrl,
  isValidConfidence,
  isValidDecision,
  validateRange,
  assert,
} from "@/lib/validation-utils"

function processResult(decision: string, confidence: number) {
  assert(isValidDecision(decision), "Invalid decision value")
  validateRange(confidence, 0, 1, "confidence")

  // Safe to use at this point
}
```

## Formatting Output

Use formatting utilities:

```typescript
import {
  formatPercent,
  formatMilliseconds,
  formatDecision,
  truncateString,
} from "@/lib/formatting-utils"

const percentStr = formatPercent(0.927)        // "92.70%"
const timeStr = formatMilliseconds(425)         // "425ms"
const decisionStr = formatDecision("synthetic", 0.92) // "SYNTHETIC (92.00%)"
const shortened = truncateString(longText, 50)  // Truncates to 50 chars
```

## Performance Optimization

### Caching

```typescript
import { analysisCache } from "@/lib/cache-manager"

// Cache analysis result for 1 hour
analysisCache.set(`analysis_${id}`, result, 3600000)

// Retrieve from cache
const cachedResult = analysisCache.get(`analysis_${id}`)
if (cachedResult) {
  return cachedResult
}
```

### Retry Logic

```typescript
import { retryWithBackoff } from "@/lib/error-handling"

const result = await retryWithBackoff(
  () => runModel(imageData),
  3,        // max retries
  1000      // initial delay ms
)
```

## Testing Guidelines

### Unit Tests

- Test each utility function independently
- Use meaningful test names: `test("should validate email format correctly")`
- Test both success and failure cases
- Mock external dependencies

### Integration Tests

- Test feature combinations
- Verify error handling
- Test with realistic data

### Example Test Structure

```typescript
describe("Validation Utilities", () => {
  describe("isValidConfidence", () => {
    it("should return true for valid confidence (0-1)", () => {
      expect(isValidConfidence(0.5)).toBe(true)
    })

    it("should return false for invalid confidence (>1)", () => {
      expect(isValidConfidence(1.5)).toBe(false)
    })

    it("should handle edge cases", () => {
      expect(isValidConfidence(0)).toBe(true)
      expect(isValidConfidence(1)).toBe(true)
      expect(isValidConfidence(NaN)).toBe(false)
    })
  })
})
```

## Security Considerations

- Never log sensitive data (passwords, hashes, personal info)
- Validate all external inputs
- Use type safety to prevent injection attacks
- Sanitize text before including in reports
- Hash file contents for chain of custody

## Deployment

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] TypeScript compilation without errors
- [ ] No console.log statements in production code
- [ ] Error handling for all async operations
- [ ] Security review for sensitive operations
- [ ] Documentation updated

### Environment Variables

Required for production:

```
DATABASE_URL=...
MODEL_API_KEY=...
LOG_LEVEL=info
CACHE_TTL=3600
```

## Contributing

1. Create feature branch: `git checkout -b feature/description`
2. Make changes with meaningful commits
3. Add tests for new functionality
4. Update documentation
5. Create pull request with description
6. Code review before merge

## Resources

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- React Documentation: https://react.dev
- Next.js Documentation: https://nextjs.org/docs
- Forensic Standards: FaceForensics++ papers and benchmarks
