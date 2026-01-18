/**
 * Validation Error Codes
 *
 * Language-agnostic error codes for domain validation errors.
 * These codes should be used throughout the domain layer and
 * localized at the presentation layer.
 */

export enum ValidationErrorCode {
  // Common validation errors
  REQUIRED = "VALIDATION_REQUIRED",
  INVALID_FORMAT = "VALIDATION_INVALID_FORMAT",
  TOO_LONG = "VALIDATION_TOO_LONG",
  TOO_SHORT = "VALIDATION_TOO_SHORT",
  OUT_OF_RANGE = "VALIDATION_OUT_OF_RANGE",
  INVALID_VALUE = "VALIDATION_INVALID_VALUE",

  // Slug-specific errors
  SLUG_REQUIRED = "SLUG_REQUIRED",
  SLUG_INVALID_FORMAT = "SLUG_INVALID_FORMAT",
  SLUG_TOO_LONG = "SLUG_TOO_LONG",

  // Tag-specific errors
  TAG_REQUIRED = "TAG_REQUIRED",
  TAG_TOO_LONG = "TAG_TOO_LONG",

  // PostStatus-specific errors
  POST_STATUS_INVALID = "POST_STATUS_INVALID",

  // Pagination-specific errors
  PAGINATION_PAGE_INVALID = "PAGINATION_PAGE_INVALID",
  PAGINATION_PER_PAGE_INVALID = "PAGINATION_PER_PAGE_INVALID",
  PAGINATION_TOTAL_INVALID = "PAGINATION_TOTAL_INVALID",
}

/**
 * Validation Error
 *
 * A structured error object that contains a language-agnostic error code
 * and optional metadata for localization at the presentation layer.
 */
export class ValidationError extends Error {
  constructor(
    public readonly code: ValidationErrorCode,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(code);
    this.name = "ValidationError";
    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get error code as string
   */
  getCode(): string {
    return this.code;
  }

  /**
   * Get metadata for localization
   */
  getMetadata(): Record<string, unknown> | undefined {
    return this.metadata;
  }
}
