'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Menu, 
  X, 
  Home, 
  Users, 
  BookOpenCheck, 
  Phone,
  LogIn,
  UserPlus,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User
} from 'lucide-react';
import AuthService from '@/services/auth.service';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, [pathname]); // Re-check when route changes

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    router.push('/');
  };

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: BookOpenCheck },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Teachers', href: '/teachers', icon: Users },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'TEACHER':
        return '/teacher';
      case 'STUDENT':
        return '/student';
      default:
        return '/';
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="Tuition LMS Logo" 
              className="h-20 w-auto py-2"
            />
            {/* <span className="text-xl font-bold text-neutral-900">
              Tuition <span className="text-primary">LMS</span>
            </span> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-neutral-600'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              // User is logged in - No Register/Login buttons
              <>
                <Link
                  href={getDashboardLink()}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-neutral-500">{user.role}</p>
                      </div>
                    </div>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-neutral-200">
                      <Link
                        href={`${getDashboardLink()}/profile`}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // User is not logged in - Show Register/Login buttons
              <>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-neutral-200">
                      <Link
                        href="/register/student"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Register as Student
                      </Link>
                      <Link
                        href="/register/teacher"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Register as Teacher
                      </Link>
                    </div>
                  )}
                </div>
                
                <Link
                  href="/login"
                  className="flex items-center space-x-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-neutral-600" />
            ) : (
              <Menu className="h-6 w-6 text-neutral-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 py-4">
            <div className="flex flex-col space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              
              <div className="border-t border-neutral-200 pt-3 space-y-2">
                {user ? (
                  // Mobile menu for logged in users - No Register/Login buttons
                  <>
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                      href={`${getDashboardLink()}/profile`}
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  // Mobile menu for non-logged in users - Show Register/Login buttons
                  <>
                    <Link
                      href="/register/student"
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="h-5 w-5" />
                      <span className="font-medium">Student Registration</span>
                    </Link>
                    <Link
                      href="/register/teacher"
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="h-5 w-5" />
                      <span className="font-medium">Teacher Registration</span>
                    </Link>
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span className="font-medium">Login</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;