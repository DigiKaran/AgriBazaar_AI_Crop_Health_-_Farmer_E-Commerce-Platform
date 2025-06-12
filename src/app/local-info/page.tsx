import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Cloud, Sun, Wind, Droplets, Lightbulb, CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Local Farming Information - AgriCheck',
  description: 'Access localized weather forecasts and tailored farming tips for your region.',
};

// Mock data - In a real app, this would come from APIs or user input
const mockLocation = "Green Valley Farms, California";
const mockWeather = {
  condition: "Sunny with partial clouds",
  temperature: "28°C",
  humidity: "55%",
  wind: "12 km/h NW",
  icon: <Sun className="h-12 w-12 text-yellow-500" />,
  dataAiHint: "sunny farm"
};

const farmingTips = [
  {
    id: '1',
    title: 'Optimal Watering Schedule',
    content: 'During sunny spells like today, ensure deep watering early in the morning or late in the evening to minimize evaporation. Check soil moisture 2 inches deep before watering.',
    icon: <Droplets className="h-6 w-6 text-blue-500" />,
    category: "Water Management"
  },
  {
    id: '2',
    title: 'Pest Monitoring',
    content: 'Warm weather can increase pest activity. Regularly inspect crops for early signs of infestation, especially undersides of leaves.',
    icon: <Lightbulb className="h-6 w-6 text-yellow-600" />, // Using Lightbulb for 'insight'
    category: "Pest Control"
  },
  {
    id: '3',
    title: 'Seasonal Planting Guide',
    content: 'For your location and current season (Summer), consider planting heat-tolerant crops like tomatoes, peppers, and cucumbers. Prepare soil with compost for best results.',
    icon: <CalendarDays className="h-6 w-6 text-green-600" />,
    category: "Planting"
  },
];

export default function LocalInfoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-headline tracking-tight">Local Farming Information</h1>
        <div className="flex items-center justify-center mt-4 text-lg text-muted-foreground">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          <span>{mockLocation} (Mock Data)</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-stretch">
        <Card className="shadow-xl rounded-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Cloud className="text-primary"/> Current Weather
            </CardTitle>
            <CardDescription>Today's forecast for {mockLocation}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div className="flex items-center justify-around p-4 bg-secondary/30 rounded-lg">
              <div>{mockWeather.icon}</div>
              <div className="text-center">
                <p className="text-3xl font-semibold">{mockWeather.temperature}</p>
                <p className="text-muted-foreground">{mockWeather.condition}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong className="font-medium">Humidity:</strong> {mockWeather.humidity}</p>
              <p><strong className="font-medium">Wind:</strong> {mockWeather.wind}</p>
            </div>
            <div className="mt-auto pt-4">
                <Image src="https://placehold.co/600x300.png" alt="Weather relevant image" width={600} height={300} className="rounded-lg aspect-[2/1] object-cover" data-ai-hint={mockWeather.dataAiHint}/>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl rounded-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
                <Lightbulb className="text-primary"/> Today's Top Tip
            </CardTitle>
            <CardDescription>A key recommendation for today.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center items-center text-center p-6 bg-accent/10 rounded-b-xl">
             {farmingTips[0].icon}
            <h3 className="font-headline text-xl mt-3 mb-2">{farmingTips[0].title}</h3>
            <p className="text-muted-foreground text-sm">{farmingTips[0].content}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-3xl font-headline mb-6 text-center md:text-left">Seasonal Farming Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmingTips.map((tip) => (
            <Card key={tip.id} className="shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
              <CardHeader className="bg-secondary/20">
                <div className="flex items-center gap-3">
                  {tip.icon}
                  <CardTitle className="font-headline text-lg">{tip.title}</CardTitle>
                </div>
                <CardDescription className="text-xs pt-1">{tip.category}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{tip.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
