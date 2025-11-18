import { useEffect, useState, useRef, RefObject } from 'react'
import { Comment } from '@/types'
import { findPhraseInDOM, getViewportInfo } from '@/lib/phraseUtils'

interface UseSyncScrollOptions {
  markdownRef: RefObject<HTMLDivElement | null>
  commentsRef: RefObject<HTMLDivElement | null>
  comments: Comment[]
  enabled: boolean
}

export function useSyncScroll({
  markdownRef,
  commentsRef,
  comments,
  enabled,
}: UseSyncScrollOptions) {
  const [visibleSections, setVisibleSections] = useState<string[]>([])
  const [visibleCommentIds, setVisibleCommentIds] = useState<number[]>([])
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)
  const isScrollingProgrammatically = useRef(false)
  const phrasePositionsRef = useRef<Map<number, DOMRect[]>>(new Map())

  // Track visible sections using Intersection Observer
  useEffect(() => {
    if (!enabled || !markdownRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible: string[] = []

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            visible.push(entry.target.id)
          }
        })

        setVisibleSections(visible)
      },
      {
        root: markdownRef.current,
        threshold: 0.3,
        rootMargin: '-20% 0px -60% 0px', // Focus on top portion
      }
    )

    // Observe all headings
    const headings = markdownRef.current.querySelectorAll('h1, h2, h3')
    headings.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [enabled, markdownRef])

  // Scroll comments pane when visible sections change
  useEffect(() => {
    if (!enabled || !commentsRef.current || visibleSections.length === 0) return
    if (isScrollingProgrammatically.current) return

    // Find first comment for the first visible section
    const firstVisibleSection = visibleSections[0]
    const relevantComment = comments.find(
      (c) => c.sectionId === firstVisibleSection && !c.parentId
    )

    if (relevantComment) {
      scrollToComment(relevantComment.id, false)
    }
  }, [visibleSections, comments, enabled, commentsRef])

  // Track visible comment phrases using viewport detection
  useEffect(() => {
    if (!enabled || !markdownRef.current) return

    const container = markdownRef.current
    const proseContainer = container.querySelector('.prose')
    if (!proseContainer) return

    // Find all comment phrases in the DOM
    const findPhrases = () => {
      phrasePositionsRef.current.clear()

      comments
        .filter(c => c.selectedText && c.selectedText.trim().length > 0)
        .forEach(comment => {
          const rects = findPhraseInDOM(proseContainer, comment.selectedText!)
          if (rects.length > 0) {
            phrasePositionsRef.current.set(comment.id, rects)
          }
        })
    }

    // Check which phrases are visible in the viewport
    const checkVisibility = () => {
      if (!container || phrasePositionsRef.current.size === 0) return

      const viewport = getViewportInfo(container)
      const visible: number[] = []

      phrasePositionsRef.current.forEach((rects, commentId) => {
        // Check if any rectangle for this phrase is visible
        const isVisible = rects.some(rect => {
          // Convert rect coordinates to container-relative coordinates
          const rectTop = rect.top + viewport.scrollTop - viewport.containerTop
          const rectBottom = rect.bottom + viewport.scrollTop - viewport.containerTop

          // Check if rect intersects with viewport
          return rectBottom >= viewport.top && rectTop <= viewport.bottom
        })

        if (isVisible) {
          visible.push(commentId)
        }
      })

      setVisibleCommentIds(visible)
    }

    const refreshPositions = () => {
      findPhrases()
      checkVisibility()
    }

    // Immediate initial checks (for instant sync when enabled)
    refreshPositions()

    // Delayed checks (after MarkdownPane has finished highlighting)
    const findTimeout = setTimeout(refreshPositions, 250)
    const checkTimeout = setTimeout(checkVisibility, 300)

    // Observe DOM mutations so visibility recalculates as soon as the markdown updates/highlights
    const observer = new MutationObserver(() => {
      refreshPositions()
    })
    observer.observe(proseContainer, { childList: true, subtree: true })

    // Scroll handler with requestAnimationFrame throttling
    let rafId: number | null = null
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(checkVisibility)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      clearTimeout(findTimeout)
      clearTimeout(checkTimeout)
      observer.disconnect()
      container.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
      phrasePositionsRef.current.clear()
    }
  }, [enabled, markdownRef, comments])

  const scrollToComment = (commentId: number, smooth: boolean = true) => {
    if (!commentsRef.current) return

    isScrollingProgrammatically.current = true
    setActiveCommentId(commentId)

    const commentElement = commentsRef.current.querySelector(
      `[data-comment-id="${commentId}"]`
    )

    if (commentElement) {
      commentElement.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start',
        inline: 'nearest',
      })
    }

    // Reset flag after a delay
    setTimeout(() => {
      isScrollingProgrammatically.current = false
    }, 1000)
  }

  const scrollToSection = (sectionId: string, smooth: boolean = true) => {
    if (!markdownRef.current) return

    isScrollingProgrammatically.current = true

    const sectionElement = markdownRef.current.querySelector(`#${sectionId}`)

    if (sectionElement) {
      sectionElement.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start',
        inline: 'nearest',
      })

      // Flash highlight
      sectionElement.classList.add('flash-highlight')
      setTimeout(() => {
        sectionElement.classList.remove('flash-highlight')
      }, 2000)
    }

    // Reset flag
    setTimeout(() => {
      isScrollingProgrammatically.current = false
    }, 1000)
  }

  return {
    visibleSections,
    visibleCommentIds,
    activeCommentId,
    scrollToComment,
    scrollToSection,
  }
}
