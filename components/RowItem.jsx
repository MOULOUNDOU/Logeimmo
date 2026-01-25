'use client'

import Link from 'next/link'

export default function RowItem({
  href,
  onClick,
  icon,
  title,
  subtitle,
  right,
  className = ''
}) {
  const content = (
    <div
      className={`w-full flex items-center justify-between gap-4 px-4 py-4 ${
        href || onClick ? 'hover:bg-gray-50 active:bg-gray-100 cursor-pointer' : ''
      } transition-colors ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon ? <div className="shrink-0">{icon}</div> : null}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
          {subtitle ? <p className="text-xs text-gray-500 truncate">{subtitle}</p> : null}
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
