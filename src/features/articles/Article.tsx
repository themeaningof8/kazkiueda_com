import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// 独自ウィジェット
const Widget = ({ type }: { type: string }) => {
  if (type === 'clock') {
    const [now, setNow] = useState(() => new Date().toLocaleTimeString())
    useEffect(() => {
      const timer = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000)
      return () => clearInterval(timer)
    }, [])
    return <span>{now}</span>
  }
  return null
}

// Markdownテキストを前処理してウィジェット記法をHTMLに変換
const preprocessMarkdown = (content: string): string => {
  return content.replace(/:::widget\{type="([^"]+)"\}\s*:::/g, '<div data-widget-type="$1"></div>')
}

const components = {
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag='div' {...props}>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  div({ 'data-widget-type': widgetType, ...props }: any) {
    if (widgetType) {
      return <Widget type={widgetType} />
    }
    return <div {...props} />
  },
}

export const Article = ({ content }: { content: string }) => {
  const processedContent = preprocessMarkdown(content)

  return (
    <ReactMarkdown
      children={processedContent}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={components}
    />
  )
}
