import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkDevice()

    // Listen for window resize events
    window.addEventListener('resize', checkDevice)

    // Listen for media query changes
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener('change', checkDevice)

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('resize', checkDevice)
      mql.removeEventListener('change', checkDevice)
    }
  }, [])

  return !!isMobile
}
