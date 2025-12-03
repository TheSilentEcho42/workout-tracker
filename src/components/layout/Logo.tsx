// ============================================
// MAIN LOGO COMPONENT (Option 5 - Full Size)
// ============================================
// Use this in your main navigation/header

export const GymBrainLogo = () => {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-gray-900 mb-1">
        Gym Br<span className="text-cyan-500">AI</span>n
      </div>
      <div className="h-1 w-full bg-gray-200 rounded">
        <div className="h-1 w-1/3 bg-cyan-500 rounded ml-auto"></div>
      </div>
    </div>
  )
}

// ============================================
// NAVIGATION LOGO (Horizontal, Compact)
// ============================================
// Use this in your top navigation bar

export const NavLogo = () => {
  return (
    <div className="inline-flex flex-col">
      <div className="text-2xl font-bold text-gray-900 leading-tight">
        Gym Br<span className="text-cyan-500">AI</span>n
      </div>
      <div className="h-0.5 w-full bg-gray-200 rounded mt-0.5">
        <div className="h-0.5 w-1/3 bg-cyan-500 rounded ml-auto"></div>
      </div>
    </div>
  )
}

// ============================================
// COMPACT LOGO (Small, Inline)
// ============================================
// Use this in buttons, cards, or inline with text

export const CompactLogo = () => {
  return (
    <span className="inline-flex flex-col">
      <span className="text-lg font-bold text-gray-900">
        Gym Br<span className="text-cyan-500">AI</span>n
      </span>
      <span className="h-0.5 w-full bg-gray-200 rounded">
        <span className="block h-0.5 w-1/3 bg-cyan-500 rounded ml-auto"></span>
      </span>
    </span>
  )
}

// ============================================
// FAVICON / ICON VERSION
// ============================================
// Simplified square icon for favicons, app icons, etc.

export const IconLogo = () => {
  return (
    <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center relative">
      <span className="text-white text-xl font-black">AI</span>
      <div className="absolute bottom-1 right-1 left-1 h-0.5 bg-white rounded"></div>
    </div>
  )
}

// ============================================
// LOADING LOGO (Animated)
// ============================================
// Use this on loading screens or splash pages

export const LoadingLogo = () => {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-gray-900 mb-1">
        Gym Br<span className="text-cyan-500">AI</span>n
      </div>
      <div className="h-1 w-full bg-gray-200 rounded overflow-hidden">
        <div className="h-1 bg-cyan-500 rounded animate-pulse w-1/3 ml-auto"></div>
      </div>
    </div>
  )
}

// ============================================
// DARK MODE VERSION
// ============================================
// Use this if you implement dark mode

export const DarkModeLogo = () => {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-white mb-1">
        Gym Br<span className="text-cyan-500">AI</span>n
      </div>
      <div className="h-1 w-full bg-gray-700 rounded">
        <div className="h-1 w-1/3 bg-cyan-500 rounded ml-auto"></div>
      </div>
    </div>
  )
}

// ============================================
// RESPONSIVE LOGO (Size-adjustable)
// ============================================

type ResponsiveLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const ResponsiveLogo = ({ size = 'md' }: ResponsiveLogoProps) => {
  const sizes = {
    sm: { text: 'text-lg', line: 'h-0.5' },
    md: { text: 'text-2xl', line: 'h-0.5' },
    lg: { text: 'text-4xl', line: 'h-1' },
    xl: { text: 'text-5xl', line: 'h-1' }
  }
  
  const { text, line } = sizes[size]
  
  return (
    <div className="inline-flex flex-col">
      <div className={`${text} font-bold text-gray-900 leading-tight`}>
        Gym Br<span className="text-cyan-500">AI</span>n
      </div>
      <div className={`${line} w-full bg-gray-200 rounded mt-0.5`}>
        <div className={`${line} w-1/3 bg-cyan-500 rounded ml-auto`}></div>
      </div>
    </div>
  )
}

// ============================================
// LINKED LOGO (Clickable with hover effect)
// ============================================

type LinkedLogoProps = {
  href?: string
  to?: string
  onClick?: () => void
  as?: 'a' | 'button' | 'div'
}

export const LinkedLogo = ({ href, to, onClick, as = 'a' }: LinkedLogoProps) => {
  const content = (
    <div className="inline-flex flex-col group cursor-pointer">
      <div className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors">
        Gym Br<span className="text-cyan-500">AI</span>n
      </div>
      <div className="h-0.5 w-full bg-gray-200 rounded mt-0.5">
        <div className="h-0.5 w-1/3 bg-cyan-500 rounded ml-auto group-hover:w-full transition-all duration-300"></div>
      </div>
    </div>
  )

  if (as === 'button' || onClick) {
    return (
      <button 
        onClick={onClick} 
        className="focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded"
        aria-label="Gym Brain Home"
      >
        {content}
      </button>
    )
  }

  if (as === 'div') {
    return (
      <div className="focus:outline-none" aria-label="Gym Brain">
        {content}
      </div>
    )
  }

  return (
    <a 
      href={href || to || '/'} 
      className="focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded"
      aria-label="Gym Brain Home"
    >
      {content}
    </a>
  )
}

