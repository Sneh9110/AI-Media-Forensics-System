/**
 * Application Constants
 * Central location for all configuration constants
 */

// Detection confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.65,
  LOW: 0.5,
  VERY_LOW: 0.3,
} as const

// Model performance benchmarks
export const MODEL_BENCHMARKS = {
  AIRIA: {
    accuracy: 0.975,
    weight: 0.5,
  },
  PYTORCH: {
    accuracy: 0.962,
    weight: 0.3,
  },
  PRNU: {
    accuracy: 0.885,
    weight: 0.2,
  },
} as const

// Threat severity levels
export const THREAT_SEVERITY = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const

// Processing timeouts (ms)
export const TIMEOUTS = {
  MODEL_AIRIA: 500,
  MODEL_PYTORCH: 300,
  MODEL_PRNU: 250,
  ENSEMBLE: 1000,
  DATABASE: 2000,
} as const

// Report validation constants
export const REPORT_VALIDATION = {
  MIN_CONFIDENCE: 0.3,
  MAX_CONFIDENCE: 1.0,
  MIN_FEATURES: 3,
  MAX_FEATURES: 100,
  MIN_EVIDENCE_LENGTH: 10,
  MAX_EVIDENCE_LENGTH: 500,
} as const

// Feature categories
export const FEATURE_CATEGORIES = {
  FREQUENCY: "frequency",
  SPATIAL: "spatial",
  COLOR: "color",
  OTHER: "other",
} as const

// Decision thresholds
export const DECISION_THRESHOLDS = {
  STRONG_SYNTHETIC: 0.9,
  MODERATE_SYNTHETIC: 0.7,
  UNCERTAIN: 0.5,
  MODERATE_REAL: 0.3,
  STRONG_REAL: 0.1,
} as const

// Error codes
export const ERROR_CODES = {
  INVALID_INPUT: "ERR_INVALID_INPUT",
  MODEL_FAILURE: "ERR_MODEL_FAILURE",
  TIMEOUT: "ERR_TIMEOUT",
  DATABASE_ERROR: "ERR_DATABASE",
  VALIDATION_ERROR: "ERR_VALIDATION",
} as const

// Hash algorithms
export const HASH_ALGORITHMS = {
  SHA256: "sha256",
  MD5: "md5",
  SHA1: "sha1",
} as const

// Report formats
export const REPORT_FORMATS = {
  TEXT: "text",
  HTML: "html",
  PDF: "pdf",
  JSON: "json",
} as const
// Cache configuration
export const CACHE_CONFIG = {
  ANALYSIS_RESULTS_TTL: 3600, // 1 hour in seconds
  HEATMAP_DATA_TTL: 1800, // 30 minutes
  ML_MODEL_CACHE_TTL: 7200, // 2 hours
  MAX_CACHE_SIZE: 500 * 1024 * 1024, // 500MB
} as const