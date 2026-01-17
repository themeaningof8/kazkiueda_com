# Domain Layer Localization Strategy

## Overview

The domain layer now uses language-agnostic error codes instead of hardcoded Japanese error messages. This enables proper separation of concerns and allows localization to be handled at the presentation layer.

## Architecture

### Domain Layer (Language-Agnostic)
- Uses `ValidationError` with error codes (e.g., `SLUG_REQUIRED`, `TAG_TOO_LONG`)
- Includes metadata for dynamic values (e.g., `{ maxLength: 100, actualLength: 150 }`)
- No language-specific strings

### Presentation Layer (Localized)
- Translates error codes to user-friendly messages
- Supports multiple locales (Japanese, English, etc.)
- Uses metadata to create dynamic messages

## Error Code System

All validation errors use the `ValidationError` class:

```typescript
export class ValidationError extends Error {
  constructor(
    public readonly code: ValidationErrorCode,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(code);
    this.name = "ValidationError";
  }
}
```

## Example Usage

### Domain Layer (Value Objects)

```typescript
// Before: Hardcoded Japanese message
if (value.length > SLUG_MAX_LENGTH) {
  throw new Error(`スラッグは${SLUG_MAX_LENGTH}文字以内で入力してください`);
}

// After: Language-agnostic error code with metadata
if (value.length > SLUG_MAX_LENGTH) {
  throw new ValidationError(ValidationErrorCode.SLUG_TOO_LONG, {
    maxLength: SLUG_MAX_LENGTH,
    actualLength: value.length,
  });
}
```

### Presentation Layer (Localization)

```typescript
// Example localization function
function localizeError(error: ValidationError, locale: 'ja' | 'en'): string {
  const translations = {
    ja: {
      SLUG_REQUIRED: 'スラッグは必須です',
      SLUG_INVALID_FORMAT: 'スラッグは英数字、ハイフン、アンダースコアのみ使用できます',
      SLUG_TOO_LONG: (meta) => `スラッグは${meta.maxLength}文字以内で入力してください`,
      TAG_REQUIRED: 'タグは必須です',
      TAG_TOO_LONG: (meta) => `タグは${meta.maxLength}文字以内で入力してください`,
      POST_STATUS_INVALID: (meta) => `無効な公開状態です: ${meta.value}`,
    },
    en: {
      SLUG_REQUIRED: 'Slug is required',
      SLUG_INVALID_FORMAT: 'Slug can only contain lowercase letters, numbers, hyphens, and underscores',
      SLUG_TOO_LONG: (meta) => `Slug must be at most ${meta.maxLength} characters`,
      TAG_REQUIRED: 'Tag is required',
      TAG_TOO_LONG: (meta) => `Tag must be at most ${meta.maxLength} characters`,
      POST_STATUS_INVALID: (meta) => `Invalid post status: ${meta.value}`,
    }
  };

  const template = translations[locale][error.code];
  
  if (typeof template === 'function') {
    return template(error.metadata);
  }
  
  return template;
}

// Usage in presentation layer
try {
  const slug = Slug.create(userInput);
} catch (error) {
  if (error instanceof ValidationError) {
    const message = localizeError(error, currentLocale);
    showErrorToUser(message);
  }
}
```

## Benefits

1. **Separation of Concerns**: Domain logic is independent of presentation concerns
2. **Reusability**: Same domain code works across different locales and platforms
3. **Maintainability**: Translation changes don't require domain layer modifications
4. **Testability**: Tests verify error codes, not language-specific strings
5. **Flexibility**: Easy to add new languages without touching domain code
6. **Type Safety**: Error codes are type-checked at compile time

## Error Codes Reference

### Slug Validation
- `SLUG_REQUIRED`: Slug value is required
- `SLUG_INVALID_FORMAT`: Slug contains invalid characters
- `SLUG_TOO_LONG`: Slug exceeds maximum length (metadata: `maxLength`, `actualLength`)

### Tag Validation
- `TAG_REQUIRED`: Tag value is required
- `TAG_TOO_LONG`: Tag exceeds maximum length (metadata: `maxLength`, `actualLength`)

### PostStatus Validation
- `POST_STATUS_INVALID`: Invalid status value (metadata: `value`, `validValues`)

### Pagination Validation
- `PAGINATION_PAGE_INVALID`: Page number is invalid (metadata: `value`, `min`)
- `PAGINATION_PER_PAGE_INVALID`: Items per page is invalid (metadata: `value`, `min`)
- `PAGINATION_TOTAL_INVALID`: Total count is invalid (metadata: `value`, `min`)

## Migration Notes

### Tests
Tests have been updated to check error codes instead of messages:

```typescript
// Before
expect(() => Slug.create("")).toThrow("スラッグは必須です");

// After
try {
  Slug.create("");
} catch (error) {
  expect(error).toBeInstanceOf(ValidationError);
  expect((error as ValidationError).code).toBe(ValidationErrorCode.SLUG_REQUIRED);
}
```

### Breaking Changes
This is a breaking change for any code that catches and displays these errors. You'll need to update error handling to use the new error codes and implement localization at the appropriate layer.

## Future Enhancements

1. Create a centralized localization service
2. Implement i18n framework integration (e.g., next-intl, react-i18next)
3. Add more granular error codes for specific validation scenarios
4. Create error code documentation generator
5. Add validation metadata to improve error messages
