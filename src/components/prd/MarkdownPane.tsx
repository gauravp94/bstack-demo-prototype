'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Comment } from '@/types'

interface MarkdownPaneProps {
  content: string
  comments: Comment[]
  onTextSelect: (text: string, sectionId: string | null) => void
  highlightRange: { text: string; sectionId: string | null } | null
  onHighlightClick?: (commentId: number) => void
}

const MarkdownPane = forwardRef<HTMLDivElement, MarkdownPaneProps>(
  ({ content, comments, onTextSelect, highlightRange, onHighlightClick }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [highlightedSections, setHighlightedSections] = useState<Set<string>>(new Set())
    const [isMarkdownRendered, setIsMarkdownRendered] = useState(false)

    useEffect(() => {
      // Extract sections that have comments
      const sections = new Set(
        comments
          .filter(c => c.sectionId)
          .map(c => c.sectionId as string)
      )
      setHighlightedSections(sections)
    }, [comments])

    // Trigger re-render detection after markdown renders
    useEffect(() => {
      setIsMarkdownRendered(true)
    }, [content])

    // Pre-highlight all commented phrases after markdown renders
    useEffect(() => {
      if (!containerRef.current || !isMarkdownRendered || comments.length === 0) return

      // Get all comments with selectedText
      const commentPhrases = comments
        .filter(c => c.selectedText && c.selectedText.trim().length > 0)
        .map(c => ({
          id: c.id,
          text: c.selectedText as string,
          category: c.category
        }))

      if (commentPhrases.length === 0) return

      // Helper function to wrap phrases in DOM
      const highlightPhrasesInDOM = () => {
        const proseContainer = containerRef.current?.querySelector('.prose')
        if (!proseContainer) return

        // Remove existing highlights first (to avoid duplicates on re-render)
        const existingHighlights = proseContainer.querySelectorAll('.comment-highlight')
        existingHighlights.forEach(span => {
          const parent = span.parentNode
          const textNode = document.createTextNode(span.textContent || '')
          parent?.replaceChild(textNode, span)
          parent?.normalize() // Merge adjacent text nodes
        })

        // Wrap each phrase
        commentPhrases.forEach(({ id, text, category }) => {
          const walker = document.createTreeWalker(
            proseContainer,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                // Skip if already inside a highlight span or code/pre element
                let parent = node.parentElement
                while (parent && parent !== proseContainer) {
                  if (
                    parent.classList.contains('comment-highlight') ||
                    parent.tagName === 'CODE' ||
                    parent.tagName === 'PRE'
                  ) {
                    return NodeFilter.FILTER_REJECT
                  }
                  parent = parent.parentElement
                }
                return node.textContent && node.textContent.includes(text)
                  ? NodeFilter.FILTER_ACCEPT
                  : NodeFilter.FILTER_REJECT
              }
            }
          )

          const nodesToProcess: { node: Node; text: string }[] = []
          let node
          while (node = walker.nextNode()) {
            nodesToProcess.push({ node, text: node.textContent || '' })
          }

          nodesToProcess.forEach(({ node, text: nodeText }) => {
            const parent = node.parentNode
            if (!parent) return

            const index = nodeText.indexOf(text)
            if (index === -1) return

            // Split text node into three parts: before, match, after
            const beforeText = nodeText.substring(0, index)
            const matchText = nodeText.substring(index, index + text.length)
            const afterText = nodeText.substring(index + text.length)

            const fragment = document.createDocumentFragment()

            if (beforeText) {
              fragment.appendChild(document.createTextNode(beforeText))
            }

            // Create highlighted span
            const span = document.createElement('span')
            span.className = `comment-highlight comment-highlight-${category} cursor-pointer bg-yellow-200 hover:bg-yellow-300 border-b-2 border-yellow-600 px-0.5 rounded-sm transition-colors`
            span.dataset.commentId = String(id)
            span.textContent = matchText
            span.title = 'Click to view comment'
            fragment.appendChild(span)

            if (afterText) {
              fragment.appendChild(document.createTextNode(afterText))
            }

            parent.replaceChild(fragment, node)
          })
        })
      }

      // Run after a small delay to ensure React has finished rendering
      const timeoutId = setTimeout(highlightPhrasesInDOM, 100)

      return () => clearTimeout(timeoutId)
    }, [comments, content, isMarkdownRendered])

    // Handle clicks on highlighted phrases
    const handleClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('comment-highlight') && target.dataset.commentId) {
        const commentId = parseInt(target.dataset.commentId, 10)
        if (!isNaN(commentId) && onHighlightClick) {
          onHighlightClick(commentId)
        }
      }
    }

    const handleMouseUp = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()

      if (text && text.length > 0) {
        // Try to find the section this text belongs to
        const range = selection?.getRangeAt(0)
        let node = range?.startContainer.parentElement
        let sectionId: string | null = null

        while (node && node !== containerRef.current) {
          if (node.id) {
            sectionId = node.id
            break
          }
          node = node.parentElement
        }

        onTextSelect(text, sectionId)
      }
    }

    // Process content to add persistent highlighting
    const processedContent = highlightRange ? highlightContent(content, highlightRange.text) : content

    // Custom renderer for headings to add IDs
    const components = {
      h1: ({ children, ...props }: any) => {
        const text = String(children)
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        const hasComments = highlightedSections.has(id)

        return (
          <h1
            {...props}
            id={id}
            className={`text-3xl font-bold mt-6 mb-4 transition-all ${
              hasComments ? 'border-l-4 border-yellow-600 pl-4 bg-yellow-100 pr-4 py-2 -ml-2 shadow-sm' : ''
            }`}
          >
            {hasComments && <span className="mr-2 text-yellow-600">💬</span>}
            {children}
          </h1>
        )
      },
      h2: ({ children, ...props }: any) => {
        const text = String(children)
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        const hasComments = highlightedSections.has(id)

        return (
          <h2
            {...props}
            id={id}
            className={`text-2xl font-semibold mt-5 mb-3 transition-all ${
              hasComments ? 'border-l-4 border-yellow-600 pl-4 bg-yellow-100 pr-4 py-2 -ml-2 shadow-sm' : ''
            }`}
          >
            {hasComments && <span className="mr-2 text-yellow-600">💬</span>}
            {children}
          </h2>
        )
      },
      h3: ({ children, ...props }: any) => {
        const text = String(children)
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        const hasComments = highlightedSections.has(id)

        return (
          <h3
            {...props}
            id={id}
            className={`text-xl font-semibold mt-4 mb-2 transition-all ${
              hasComments ? 'border-l-4 border-yellow-600 pl-4 bg-yellow-100 pr-4 py-2 -ml-2 shadow-sm' : ''
            }`}
          >
            {hasComments && <span className="mr-2 text-yellow-600">💬</span>}
            {children}
          </h3>
        )
      },
      p: ({ children, ...props }: any) => (
        <p {...props} className="mb-4 leading-relaxed">
          {children}
        </p>
      ),
      ul: ({ children, ...props }: any) => (
        <ul {...props} className="list-disc pl-6 mb-4">
          {children}
        </ul>
      ),
      ol: ({ children, ...props }: any) => (
        <ol {...props} className="list-decimal pl-6 mb-4">
          {children}
        </ol>
      ),
      li: ({ children, ...props }: any) => (
        <li {...props} className="mb-2">
          {children}
        </li>
      ),
      code: ({ children, ...props }: any) => (
        <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      ),
      pre: ({ children, ...props }: any) => (
        <pre {...props} className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          {children}
        </pre>
      ),
      blockquote: ({ children, ...props }: any) => (
        <blockquote {...props} className="border-l-4 border-gray-300 pl-4 italic my-4">
          {children}
        </blockquote>
      ),
    }

    return (
      <div
        ref={(node) => {
          // Assign to both refs
          if (ref) {
            if (typeof ref === 'function') {
              ref(node)
            } else {
              ref.current = node
            }
          }
          if (containerRef) {
            containerRef.current = node
          }
        }}
        className="flex-1 border-r border-gray-200 bg-white overflow-y-auto scrollbar-thin p-8"
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      >
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {processedContent}
          </ReactMarkdown>
        </div>
      </div>
    )
  }
)

MarkdownPane.displayName = 'MarkdownPane'

// Helper function to highlight text in markdown
function highlightContent(content: string, highlightText: string): string {
  if (!highlightText) return content

  // Escape special regex characters
  const escapedText = highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedText})`, 'gi')

  // Replace with highlighted version (using a special marker that won't break markdown)
  return content.replace(regex, '**`$1`**')
}

export default MarkdownPane
