import { useState, cloneElement } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <span
      className="tooltip-wrapper"
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {cloneElement(children, {
        ...children.props,
        onMouseEnter: (e: React.MouseEvent) => {
          setIsVisible(true)
          children.props.onMouseEnter?.(e)
        },
        onMouseLeave: (e: React.MouseEvent) => {
          setIsVisible(false)
          children.props.onMouseLeave?.(e)
        }
      })}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`}>
          {content}
        </div>
      )}
    </span>
  )
}
