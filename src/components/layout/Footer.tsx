export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AgriCheck. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
