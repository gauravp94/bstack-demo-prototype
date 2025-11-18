# UX Enhancement Implementation Status

## ✅ Completed (50%)

1. **Database Schema Updated**
   - Added `scrollPosition` field to Comment model
   - Schema pushed to database
   - Prisma client regenerated

2. **Synchronized Scrolling Hook Created**
   - `src/hooks/useSyncScroll.ts` implemented
   - Uses Intersection Observer API
   - Provides `scrollToComment` and `scrollToSection` functions
   - Tracks active comment and visible sections

3. **PRDViewer Enhanced**
   - Sync toggle button added (Sync ON/OFF)
   - Persistent highlight range state
   - Scroll position capture
   - Comment click handler
   - Refs for markdown and comments panes

4. **CSS Styles Added**
   - Flash highlight animation
   - Text selection active class
   - Active comment styling

## 🚧 Remaining (50%)

### Files Still Need Updates:

1. **MarkdownPane.tsx** (High Priority)
   - Add `forwardRef` for ref support
   - Accept `highlightRange` prop
   - Implement persistent text highlighting
   - Wrap highlighted text in spans with `.text-selection-active`
   - Update `onTextSelect` signature

2. **CommentsPane.tsx** (High Priority)
   - Add `forwardRef` for ref support
   - Accept new props: `activeCommentId`, `scrollPosition`, `onCommentClick`, `onCommentSubmit`
   - Add `data-comment-id` to comment threads
   - Apply `.comment-active` class to active comment
   - Pass `onCommentClick` to CommentThread

3. **CommentThread.tsx** (Medium Priority)
   - Add onClick handler to trigger `onCommentClick`
   - Make entire card clickable

4. **CommentsPane Comment API** (Medium Priority)
   - Update form to pass `scrollPosition` to API
   - Call `onCommentSubmit` callback after successful submission

5. **API Route** (Low Priority)
   - `src/app/api/prds/[id]/comments/route.ts`
   - Accept `scrollPosition` in request body
   - Save to database

## Quick Implementation Guide

### For MarkdownPane.tsx:
```typescript
import { forwardRef } from 'react'

interface MarkdownPaneProps {
  content: string
  comments: Comment[]
  onTextSelect: (text: string, sectionId: string | null) => void
  highlightRange: { text: string; sectionId: string | null } | null
}

const MarkdownPane = forwardRef<HTMLDivElement, MarkdownPaneProps>(
  ({ content, comments, onTextSelect, highlightRange }, ref) => {
    // ... existing code

    // In handleMouseUp:
    const sectionId = findSectionId(node)
    onTextSelect(text, sectionId)

    // In render: wrap highlightRange.text with span.text-selection-active
  }
)
```

### For CommentsPane.tsx:
```typescript
const CommentsPane = forwardRef<HTMLDivElement, CommentsPaneProps>(
  ({ prdId, comments, activeCommentId, onCommentClick, ... }, ref) => {
    // Pass activeCommentId and onCommentClick to CommentThread
    // Add ref to the scrollable container
  }
)
```

## Estimated Time Remaining: 1.5-2 hours

This will complete all 4 requested features!
