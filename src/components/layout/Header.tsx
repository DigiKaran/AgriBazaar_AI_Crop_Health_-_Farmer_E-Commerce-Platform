import Link from 'next/link';
import { Leaf, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/diagnose', label: 'Diagnose Crop' },
  { href: '/products', label: 'Products' },
  { href: '/chatbot', label: 'Chatbot' },
  { href: '/local-info', label: 'Local Info' },
];

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 text-2xl font-headline text-primary hover:text-primary/80 transition-colors">
    <Leaf className="h-7 w-7" />
    AgriCheck
  </Link>
);

const NavLinks = ({ className, itemClassName }: { className?: string; itemClassName?: string }) => (
  <nav className={cn("items-center space-x-4 lg:space-x-6", className)}>
    {navItems.map((item) => (
      <Link
        key={item.label}
        href={item.href}
        className={cn("text-sm font-medium text-foreground/80 hover:text-primary transition-colors", itemClassName)}
      >
        {item.label}
      </Link>
    ))}
  </nav>
);

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLinks />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Select language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem disabled>Español (Soon)</DropdownMenuItem>
              <DropdownMenuItem disabled>हिन्दी (Soon)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-6">
              <div className="flex flex-col space-y-6">
                <Logo />
                <NavLinks className="flex flex-col space-x-0 space-y-4" itemClassName="text-lg" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="mr-2 h-5 w-5" />
                      Select Language
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[220px]">
                    <DropdownMenuItem>English</DropdownMenuItem>
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
