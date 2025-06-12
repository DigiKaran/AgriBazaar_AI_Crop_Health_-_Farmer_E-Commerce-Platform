
import type { Product } from '@/types';

export const mockProducts: Product[] = [
  { 
    id: '1', 
    name: 'Krishi Vikas Organic Manure (Jaivik Khad)', 
    category: 'Fertilizers', 
    price: 450.00, // INR, adjust as needed
    stock: 100, 
    imageUrl: 'https://placehold.co/400x400.png', 
    description: 'Premium organic manure to boost soil fertility and crop yield. Suitable for all Indian crops. (50kg Bag)',
    dataAiHint: 'organic manure india'
  },
  { 
    id: '2', 
    name: 'Neemastra Natural Pest Repellent', 
    category: 'Pesticides', 
    price: 250.00, // INR
    stock: 75, 
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'Effective botanical pest repellent made from neem extracts. Safe for beneficial insects and environment. (1 Litre)',
    dataAiHint: 'neem pesticide india'
  },
  { 
    id: '3', 
    name: 'Durable Manual Seed Drill', 
    category: 'Equipment', 
    price: 2500.00, // INR
    stock: 10, 
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'Robust manual seed drill for precise sowing of various crops like wheat, maize, and pulses. Ideal for small to medium farms.',
    dataAiHint: 'seed drill india'
  },
  { 
    id: '4', 
    name: 'Basmati Rice Seeds - Pusa 1121', 
    category: 'Seeds', 
    price: 120.00, // INR per kg
    stock: 200, 
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'High-quality Pusa Basmati 1121 rice seeds, known for long grains and aroma. Certified quality.',
    dataAiHint: 'rice seeds india'
  },
  { 
    id: '5', 
    name: 'AgroFlow Drip Irrigation Kit', 
    category: 'Equipment', 
    price: 3500.00, // INR
    stock: 25, 
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'Complete drip irrigation kit for 1/4 acre. Saves water and ensures efficient delivery to crop roots.',
    dataAiHint: 'drip irrigation india'
  },
  { 
    id: '6', 
    name: 'Kisan Shakti Urea Fertilizer', 
    category: 'Fertilizers', 
    price: 300.00, // INR for 45kg bag (example price)
    stock: 150, 
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'High-quality urea fertilizer (46% N) for promoting healthy plant growth. Standard 45kg bag.',
    dataAiHint: 'urea bag india'
  },
  {
    id: '7',
    name: 'Hybrid Cotton Seeds (BT Cotton)',
    category: 'Seeds',
    price: 850.00, // INR per packet
    stock: 90,
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'High-yield, pest-resistant hybrid BT cotton seeds suitable for Indian climate zones.',
    dataAiHint: 'cotton seeds india'
  },
  {
    id: '8',
    name: 'FarmKing Power Sprayer (16L)',
    category: 'Equipment',
    price: 4200.00, // INR
    stock: 15,
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'Battery-operated power sprayer with 16-litre tank capacity for efficient application of pesticides and fertilizers.',
    dataAiHint: 'power sprayer india'
  }
];

export const productCategories: string[] = ['All', 'Fertilizers', 'Pesticides', 'Equipment', 'Seeds', 'Herbicides'];
