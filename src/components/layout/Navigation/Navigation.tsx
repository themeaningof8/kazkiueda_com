import { memo, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navigation = memo(() => {
  const location = useLocation()

  const navItems = useMemo(
    () => [
      { path: '/', label: 'ホーム' },
      { path: '/about', label: 'アバウト' },
    ],
    []
  )

  const navLinks = useMemo(
    () =>
      navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            location.pathname === item.path ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {item.label}
        </Link>
      )),
    [navItems, location.pathname]
  )

  return (
    <nav className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          <Link to='/' className='font-bold text-xl'>
            Kazk Iueda
          </Link>
          <div className='flex space-x-6'>{navLinks}</div>
        </div>
      </div>
    </nav>
  )
})

Navigation.displayName = 'Navigation'

export default Navigation
