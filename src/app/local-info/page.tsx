
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, CloudRain, Sun, Wind, Droplets, Lightbulb, CalendarDays, Thermometer } from 'lucide-react'; // Added CloudRain, Thermometer
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Local Farming Information - AgriCheck India',
  description: 'Access localized weather forecasts and tailored farming tips for your region in India.',
};

// Mock data - Tailored for India
const mockLocation = "Wardha District, Maharashtra, India";
const mockWeather = {
  condition: "Cloudy with chance of monsoon showers",
  temperature: "29°C",
  humidity: "78%",
  wind: "15 km/h SW",
  icon: <CloudRain className="h-12 w-12 text-blue-500" />,
  dataAiHint: "monsoon farm india"
};

const farmingTips = [
  {
    id: '1',
    title: 'Monsoon Season Water Management',
    content: 'During the monsoon, ensure proper drainage in fields to prevent waterlogging for crops like cotton and soybean. For rice paddies, maintain adequate water levels. Harvest rainwater where possible.',
    icon: <Droplets className="h-6 w-6 text-blue-500" />,
    category: "Water Management (Monsoon)"
  },
  {
    id: '2',
    title: 'Pest & Disease Watch: Kharif Crops',
    content: 'Increased humidity during monsoon can lead to fungal diseases and pest attacks on Kharif crops. Regularly inspect for signs of stem borer in rice or aphids in cotton. Use neem-based pesticides as a preventive.',
    icon: <Lightbulb className="h-6 w-6 text-yellow-600" />, // Using Lightbulb for 'insight'
    category: "Pest Control (Kharif)"
  },
  {
    id: '3',
    title: 'Kharif Season Planting & Care',
    content: 'In Maharashtra, for the Kharif season (June-October), this is a good time for sowing cotton, soybean, tur (pigeon pea), and rice. Ensure use of certified seeds and balanced fertilization.',
    icon: <CalendarDays className="h-6 w-6 text-green-600" />,
    category: "Planting (Kharif)"
  },
];

export default function LocalInfoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-headline tracking-tight">Local Farming Information</h1>
        <div className="flex items-center justify-center mt-4 text-lg text-muted-foreground">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          <span>{mockLocation} (Sample Data for India)</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-stretch">
        <Card className="shadow-xl rounded-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Thermometer className="text-primary"/> Current Weather
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
                <Image src="https://placehold.co/600x300.png" alt="Weather relevant image for Indian farm" width={600} height={300} className="rounded-lg aspect-[2/1] object-cover" data-ai-hint={mockWeather.dataAiHint}/>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl rounded-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
                <Lightbulb className="text-primary"/> Today's Top Tip
            </CardTitle>
            <CardDescription>A key recommendation for today in your area.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center items-center text-center p-6 bg-accent/10 rounded-b-xl">
             {farmingTips[0].icon}
            <h3 className="font-headline text-xl mt-3 mb-2">{farmingTips[0].title}</h3>
            <p className="text-muted-foreground text-sm">{farmingTips[0].content}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-3xl font-headline mb-6 text-center md:text-left">Seasonal Farming Tips for India</h2>
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
