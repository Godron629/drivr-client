# Dashboard Refactoring Plan

## Phase 1: CSS Design System Foundation
**Goal:** Eliminate CSS duplication through systematic design tokens

### 1.1 Create CSS Variables & Design Tokens
- Define color palette, gradients, spacing, typography
- Establish consistent border-radius, shadows, transitions
- Create semantic color names (primary, secondary, danger, success)

### 1.2 Build Utility Classes
- `.card` - Reusable container pattern (replaces `.client-box`, `.server-group`, `.add-client`)
- `.btn` - Base button with variants (`.btn--primary`, `.btn--secondary`, `.btn--danger`)
- `.status` - Unified status indicator system
- `.grid` - Consistent grid layouts

### 1.3 Refactor Existing CSS
- Replace hardcoded values with CSS variables
- Consolidate duplicate gradient/shadow patterns
- Reduce file size by ~60% through deduplication

## Phase 2: JavaScript Modularization  
**Goal:** Break 559-line monolith into focused, testable modules

### 2.1 Core Modules Structure
```
static/js/modules/
├── ConfigManager.js    - Handle JSON config loading/caching
├── ApiClient.js        - HTTP requests, health checks, timeouts  
├── StateManager.js     - Centralized state (clients, servers, status)
├── ClientRenderer.js   - DOM manipulation, templating
├── StatusMonitor.js    - Health monitoring, status updates
└── EventHandlers.js    - User interactions, form handling
```

### 2.2 Module Responsibilities
- **ConfigManager:** Load/cache buttons-config.json, clients-config.json, servers-config.json
- **ApiClient:** Standardize fetch calls, error handling, timeouts
- **StateManager:** Single source of truth for application state
- **ClientRenderer:** Pure functions for DOM creation/updates
- **StatusMonitor:** Health check intervals, status updates
- **EventHandlers:** Button clicks, form submissions, nickname updates

## Phase 3: Component Templates
**Goal:** Replace innerHTML string concatenation with proper templating

### 3.1 Template System
- Implement lightweight templating (lit-html or template literals)
- Create reusable components: ClientCard, ServerGroup, StatusBadge
- Separate template logic from business logic

### 3.2 Component Library
```
components/
├── ClientCard.js       - Individual client box template
├── ServerGroup.js      - Server grouping container  
├── StatusBadge.js      - Status indicator component
├── ButtonGrid.js       - Dynamic button generation
└── ServerSelect.js     - Server dropdown component
```

## Phase 4: State Management
**Goal:** Centralized, predictable state updates

### 4.1 State Structure
```javascript
state = {
  clients: Map(),
  servers: Map(), 
  buttons: [],
  health: Map(),
  ui: { loading: false, errors: [] }
}
```

### 4.2 State Operations
- Immutable updates through dedicated functions
- Event-driven state changes
- Reactive UI updates based on state changes

## Phase 5: Performance & Testing
**Goal:** Optimize bundle size and ensure functionality

### 5.1 Performance Optimizations
- Lazy load modules
- Debounce health checks
- Optimize DOM updates (virtual DOM or selective updates)
- Bundle analysis and dead code elimination

### 5.2 Testing Strategy
- Unit tests for each module
- Integration tests for API interactions
- End-to-end tests for user workflows
- Performance benchmarks

## Implementation Order

**Week 1:** CSS Design System (Phase 1)
- Immediate visual improvements
- Foundation for component work
- Easy wins with reduced bundle size

**Week 2:** JavaScript Modules (Phase 2) 
- Core architecture improvement
- Better maintainability
- Enables testing

**Week 3:** Component Templates (Phase 3)
- Cleaner, more maintainable UI code
- Reusable components
- Better separation of concerns

**Week 4:** State Management (Phase 4)
- Predictable state updates
- Better debugging
- Foundation for advanced features

**Week 5:** Testing & Optimization (Phase 5)
- Ensure reliability
- Performance improvements
- Production readiness

## Expected Outcomes

**Code Reduction:**
- CSS: ~373 lines → ~150 lines (60% reduction)
- JS: ~559 lines → ~400 lines across modules (better organization)
- HTML: Cleaner templates, reduced duplication

**Maintainability:**
- Modular, testable code
- Clear separation of concerns  
- Consistent design system
- Easier feature additions

**Performance:**
- Reduced bundle size
- Better caching strategies
- Optimized DOM updates
- Faster health check cycles

This plan transforms the dashboard from a functional but monolithic codebase into a well-architected, maintainable system while preserving all existing functionality.