'use client'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const formatText = (text: string) => {
    // Split by newlines first to handle paragraphs
    const paragraphs = text.split('\n\n')
    
    return paragraphs.map((paragraph, pIndex) => {
      // Handle bullet points
      if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
        const items = paragraph.split('\n').filter(line => line.trim())
        return (
          <ul key={pIndex} className="list-disc list-inside space-y-2 my-3">
            {items.map((item, iIndex) => {
              const cleanItem = item.replace(/^[-•]\s*/, '')
              return (
                <li key={iIndex} className="ml-2">
                  {formatInlineText(cleanItem)}
                </li>
              )
            })}
          </ul>
        )
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(paragraph.trim())) {
        const items = paragraph.split('\n').filter(line => line.trim())
        return (
          <ol key={pIndex} className="list-decimal list-inside space-y-2 my-3">
            {items.map((item, iIndex) => {
              const cleanItem = item.replace(/^\d+\.\s*/, '')
              return (
                <li key={iIndex} className="ml-2">
                  {formatInlineText(cleanItem)}
                </li>
              )
            })}
          </ol>
        )
      }
      
      // Regular paragraphs
      return (
        <p key={pIndex} className="mb-4 leading-relaxed">
          {formatInlineText(paragraph)}
        </p>
      )
    })
  }

  const formatInlineText = (text: string) => {
    const parts: React.ReactNode[] = []
    let currentIndex = 0
    
    // Regex to match **bold** text
    const boldRegex = /\*\*([^*]+)\*\*/g
    let match
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index))
      }
      
      // Add bold text
      parts.push(
        <strong key={match.index} className="font-bold text-white">
          {match[1]}
        </strong>
      )
      
      currentIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex))
    }
    
    return parts.length > 0 ? parts : text
  }

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {formatText(content)}
    </div>
  )
}