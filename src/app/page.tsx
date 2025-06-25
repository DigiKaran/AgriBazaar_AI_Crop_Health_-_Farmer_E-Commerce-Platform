import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanLine, ShoppingCart, MessageCircle, CloudSun, Leaf } from 'lucide-react';
import Image from 'next/image';

const featureCards = [
  {
    title: 'AI Crop Diagnosis',
    description: 'Upload a photo of your crop to get an AI-powered disease diagnosis and treatment recommendations.',
    href: '/diagnose',
    icon: <ScanLine className="h-10 w-10 text-primary mb-4" />,
    cta: 'Diagnose Crop',
  },
  {
    title: 'Farmer E-Commerce',
    description: 'Browse and buy essential farming equipment, fertilizers, pesticides, and more.',
    href: '/products',
    icon: <ShoppingCart className="h-10 w-10 text-primary mb-4" />,
    cta: 'Shop Products',
  },
  {
    title: 'Chatbot Support',
    description: 'Get quick answers to your farming questions with our AI-powered chatbot assistant.',
    href: '/chatbot',
    icon: <MessageCircle className="h-10 w-10 text-primary mb-4" />,
    cta: 'Ask Chatbot',
  },
  {
    title: 'Local Farming Info',
    description: 'Access localized weather forecasts and tailored farming tips for your region.',
    href: '/local-info',
    icon: <CloudSun className="h-10 w-10 text-primary mb-4" />,
    cta: 'Get Local Info',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex flex-col items-center space-y-6">
            <Leaf className="h-20 w-20 text-primary" />
            <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
              Welcome to AgriBazaar
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Your AI-powered assistant for healthier crops and smarter farming. Detect diseases, shop for essentials, and get expert advice, all in one place.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/diagnose">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-headline tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
                <CardHeader className="items-center text-center bg-secondary/30 p-6">
                  {feature.icon}
                  <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between p-6">
                  <CardDescription className="text-center mb-6 text-base">
                    {feature.description}
                  </CardDescription>
                  <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href={feature.href}>{feature.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-headline tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-muted-foreground md:text-lg mb-8">
              Join thousands of farmers who are using AgriBazaar to improve crop health and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Image src="https://placehold.co/600x400.png" alt="Happy Farmer" width={600} height={400} className="rounded-lg shadow-md" data-ai-hint="farm harvest" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
