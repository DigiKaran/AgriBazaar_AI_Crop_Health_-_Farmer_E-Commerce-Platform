
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Leaf, Globe, Menu, LogOut, LogIn, UserPlus, ShoppingCart, User, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/diagnose', label: 'AI Diagnose' },
  { href: '/ask-expert', label: 'Ask Expert' },
  { href: '/products', label: 'Products' },
  { href: '/chatbot', label: 'Chatbot' },
  { href: '/local-info', label: 'Local Info' },
];

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 text-2xl font-headline text-primary hover:text-primary/80 transition-colors">
    <Leaf className="h-7 w-7" />
    AgriBazaar
  </Link>
);

const NavLinks = ({ className, itemClassName, onLinkClick, userRole }: { className?: string; itemClassName?: string; onLinkClick?: () => void; userRole?: string | null; }) => {
  const allNavItems = [...navItems];
  if (userRole === 'admin') {
    allNavItems.push({ href: '/admin', label: 'Admin Panel' });
  }
  if (userRole === 'expert') {
    allNavItems.push({ href: '/expert', label: 'Expert Dashboard' });
  }

  return (
    <nav className={cn("items-center space-x-4 lg:space-x-6", className)}>
      {allNavItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onLinkClick}
          className={cn("text-sm font-medium text-foreground/80 hover:text-primary transition-colors", itemClassName)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};


export default function Header() {
  const { currentUser, userProfile, logout, loading } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const UserAvatarButton = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userProfile?.photoURL || undefined} alt={userProfile?.displayName || 'User'} />
            <AvatarFallback>{getInitials(userProfile?.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userProfile?.displayName || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser?.email}
            </p>
            {userProfile?.role && <p className="text-xs leading-none text-muted-foreground capitalize">Role: {userProfile.role}</p>}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserCog className="mr-2 h-4 w-4" />
            <span>My Profile & Orders</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  const CartButton = () => (
     <Button variant="ghost" size="icon" asChild>
        <Link href="/cart" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0 text-xs">
              {cartCount}
            </Badge>
          )}
          <span className="sr-only">View Cart</span>
        </Link>
      </Button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        
        <div className="hidden md:flex items-center space-x-2">
          <NavLinks userRole={userProfile?.role} />
          <CartButton />
          {loading ? null : currentUser ? (
            <UserAvatarButton />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Select language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>मराठी (Marathi)</DropdownMenuItem>
              <DropdownMenuItem disabled>Español (Soon)</DropdownMenuItem>
              <DropdownMenuItem disabled>हिन्दी (Soon)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="md:hidden flex items-center">
          <CartButton />
          {loading ? null : currentUser ? (
             <UserAvatarButton />
          ) : (
            <Button size="sm" variant="ghost" asChild onClick={() => setMobileMenuOpen(false)}>
                 <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
            </Button>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-6 flex flex-col">
              <div className="mb-6">
                <Logo />
              </div>
              <NavLinks 
                className="flex flex-col space-x-0 space-y-4" 
                itemClassName="text-lg" 
                onLinkClick={() => setMobileMenuOpen(false)}
                userRole={userProfile?.role}
              />
              <div className="mt-auto space-y-2">
                {loading ? null : currentUser ? (
                  <>
                    <div className="flex items-center gap-2 p-2 border-t">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.photoURL || undefined} alt={userProfile?.displayName || 'User'} />
                        <AvatarFallback>{getInitials(userProfile?.displayName)}</AvatarFallback>
                      </Avatar>
                       <div>
                        <p className="text-sm font-medium leading-none">{userProfile?.displayName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser?.email}
                        </p>
                         {userProfile?.role && <p className="text-xs leading-none text-muted-foreground capitalize">Role: {userProfile.role}</p>}
                      </div>
                    </div>
                     <Button variant="outline" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                       <Link href="/profile"><UserCog className="mr-2 h-4 w-4" /> My Profile & Orders</Link>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
                    </Button>
                    <Button className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
                    </Button>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="mr-2 h-5 w-5" />
                      Select Language
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[calc(280px-2*theme(spacing.6))]">
                    <DropdownMenuItem>English</DropdownMenuItem>
                     <DropdownMenuItem>मराठी (Marathi)</DropdownMenuItem>
                    <DropdownMenuItem disabled>Español (Soon)</DropdownMenuItem>
                    <DropdownMenuItem disabled>हिन्दी (Soon)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
