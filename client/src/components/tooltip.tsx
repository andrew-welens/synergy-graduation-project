import { useState, cloneElement } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const existingOnMouseEnter = (children.props as { onMouseEnter?: (e: React.MouseEvent) => void }).onMouseEnter
  const existingOnMouseLeave = (children.props as { onMouseLeave?: (e: React.MouseEvent) => void }).onMouseLeave

  return (
    <span
      className="tooltip-wrapper"
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {cloneElement(children, {
        onMouseEnter: (e: React.MouseEvent) => {
          setIsVisible(true)
          existingOnMouseEnter?.(e)
        },
        onMouseLeave: (e: React.MouseEvent) => {
          setIsVisible(false)
          existingOnMouseLeave?.(e)
        }
      } as any)}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`}>
          {content}
        </div>
      )}
    </span>
  )
}
