import type { Metadata } from 'next';
import ProductGrid from './components/ProductGrid';

export const metadata: Metadata = {
  title: 'Farming Products - AgriCheck',
  description: 'Browse and buy essential farming equipment, fertilizers, pesticides, and other agricultural products.',
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-headline tracking-tight">Our Products</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Find all your farming essentials in one place. High-quality products to help you grow better.
        </p>
      </header>
      <ProductGrid />
    </div>
  );
}
