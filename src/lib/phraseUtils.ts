/**
 * Utility functions for phrase-based viewport detection
 * Used for synchronized scrolling in PRD viewer
 */

/**
 * Finds all occurrences of a phrase in DOM and returns their bounding rectangles
 * @param container - The DOM element to search within
 * @param phrase - The text phrase to find
 * @returns Array of DOMRect objects representing phrase positions
 */
export function findPhraseInDOM(
  container: Element,
  phrase: string
): DOMRect[] {
  const rects: DOMRect[] = []

  // Create tree walker to traverse text nodes
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip code blocks, pre tags, and already-highlighted content
        let parent = node.parentElement
        while (parent && parent !== container) {
          if (
            parent.tagName === 'CODE' ||
            parent.tagName === 'PRE' ||
            parent.classList.contains('comment-highlight')
          ) {
            return NodeFilter.FILTER_REJECT
          }
          parent = parent.parentElement
        }

        // Accept only nodes that contain the phrase
        return node.textContent?.includes(phrase)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT
      }
    }
  )

  // Find all occurrences and get their rectangles
  let node: Node | null
  while (node = walker.nextNode()) {
    const text = node.textContent || ''
    let index = text.indexOf(phrase)

    // Handle multiple occurrences in same text node
    while (index !== -1) {
      // Create range for this occurrence
      const range = document.createRange()
      range.setStart(node, index)
      range.setEnd(node, index + phrase.length)

      // Get all rectangles (handles multi-line phrases)
      const rangeRects = Array.from(range.getClientRects())
      rects.push(...rangeRects)

      // Look for next occurrence
      index = text.indexOf(phrase, index + 1)
    }
  }

  return rects
}

/**
 * Checks if a DOMRect is visible within the viewport
 * @param rect - The rectangle to check
 * @param viewport - Viewport boundaries and scroll information
 * @returns true if the rectangle is at least partially visible
 */
export function isRectInViewport(
  rect: DOMRect,
  viewport: {
    top: number
    bottom: number
    scrollTop: number
    containerTop: number
  }
): boolean {
  // Convert rect coordinates (relative to page) to scroll container coordinates
  const rectTop = rect.top + viewport.scrollTop - viewport.containerTop
  const rectBottom = rect.bottom + viewport.scrollTop - viewport.containerTop

  // Check if rectangle intersects with viewport
  // Visible if: bottom is below viewport top AND top is above viewport bottom
  return rectBottom >= viewport.top && rectTop <= viewport.bottom
}

/**
 * Gets viewport information for a scroll container
 * @param container - The scrolling container element
 * @returns Viewport boundaries and scroll information
 */
export function getViewportInfo(container: HTMLElement) {
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight
  const containerRect = container.getBoundingClientRect()

  return {
    top: scrollTop,
    bottom: scrollTop + clientHeight,
    scrollTop,
    scrollHeight,
    clientHeight,
    containerTop: containerRect.top,
  }
}
