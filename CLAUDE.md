# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Management
- Always use `bun` for package management - `npm` and `yarn` are prohibited
- Package installation: `bun install`
- Adding packages: `bun add <package>`

## Development Commands
- Development server: `bun run dev` (runs on port 3000)
- Production build: `bun run build`
- Preview production build: `bun run preview`
- Complete quality check: `bun run check` (linting, type checking, formatting)

## Testing Commands
- Unit/integration tests: `bun run test` (Vitest)
- Test with watch mode: `bun run test:watch`
- Test with coverage: `bun run test:coverage` (minimum 80% coverage required)
- E2E tests: `bun run test:e2e` (Playwright)
- E2E with UI: `bun run test:e2e:ui`
- Visual regression tests: `bun run test:vrt`

## Code Quality
- Type checking: `bun run type-check`
- Linting: `bun run lint` (uses oxlint)
- Auto-fix linting: `bun run lint:fix`
- Formatting: `bun run format` (Prettier)

## Storybook
- Development: `bun run storybook`
- Build: `bun run build-storybook`

## Project Architecture

### Directory Structure
The project follows a feature-based architecture with clear separation of concerns:

- `/src/components/` - Shared, reusable components
  - `/ui/` - Base UI components (buttons, forms, etc.)
  - `/layout/` - Layout-specific components (navigation, layout wrapper)
- `/src/features/` - Feature-based modules (home, about, articles, bento)
- `/src/hooks/` - Custom React hooks
- `/src/services/` - API services and external integrations
- `/src/utils/` - Utility functions and helpers
- `/src/types/` - TypeScript type definitions
- `/src/mocks/` - MSW mock data for testing

### Technology Stack
- **Framework**: React 19 with Vite
- **Routing**: React Router v7
- **Styling**: TailwindCSS v4 with CSS-in-JS support
- **UI Components**: Radix UI primitives with custom styling
- **Forms**: React Hook Form with Zod validation
- **Testing**: Vitest + React Testing Library + Playwright
- **Visual Testing**: Lost Pixel for visual regression testing
- **Storybook**: Component development and documentation

### Import Guidelines
- Use `@/` alias for all imports (relative paths prohibited)
- Import structure: external libraries first, then internal modules
- Always use absolute imports from the `@/` alias

### Component Structure
Each component follows a consistent structure:
- `ComponentName.tsx` - Main component implementation
- `ComponentName.test.tsx` - Unit tests
- `ComponentName.stories.tsx` - Storybook stories
- `index.tsx` - Export barrel

### Key Features
- **Lazy Loading**: Route-based code splitting for performance
- **Error Boundaries**: Comprehensive error handling at app and page levels
- **Performance Monitoring**: Built-in hooks for load and memory monitoring
- **Accessibility**: Comprehensive a11y testing with axe-core
- **Visual Testing**: Automated visual regression testing
- **Git Hooks**: Pre-commit hooks for code quality (lefthook)

### Development Workflow
1. Components must include tests and Storybook stories
2. All code must pass type checking, linting, and formatting
3. Maintain 80% test coverage minimum
4. Use feature-based organization for new functionality
5. Follow React 19 patterns and best practices

### Configuration Files
- `vite.config.ts` - Vite configuration with path aliases and build optimization
- `tsconfig.json` - Strict TypeScript configuration
- `lefthook.yml` - Git hooks for code quality checks
- `playwright.config.ts` - E2E test configuration
- `vitest.config.ts` - Unit test configuration
- `lostpixel.config.ts` - Visual regression test configuration