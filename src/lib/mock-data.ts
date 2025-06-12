import type { Product } from '@/types';

export const mockProducts: Product[] = [
  { 
    id: '1', 
    name: 'SuperGrow Organic Fertilizer', 
    category: 'Fertilizers', 
    price: 25.99, 
    stock: 100, 
    imageUrl: 'https://placehold.co/400x400.png', 
    description: 'Boost your crop yield with our premium organic fertilizer. Suitable for all types of plants.',
    dataAiHint: 'fertilizer bag'
  },
  { 
    id: '2', 
    name: 'PestAway Natural Pesticide', 
    category: 'Pesticides', 
    price: 15.49, 
    stock: 75, 
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'Effectively control pests while being safe for the environment. Made from natural ingredients.',
    dataAiHint: 'pesticide bottle'
  },
  { 
    id: '3', 
    name: 'Heavy Duty Power Tiller', 
    category: 'Equipment', 
    price: 350.00, 
    stock: 10, 
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'Prepare your soil with ease using our robust and reliable power tiller. Built for tough conditions.',
    dataAiHint: 'farm equipment'
  },
  { 
    id: '4', 
    name: 'Miracle Seeds - Tomato Hybrid', 
    category: 'Seeds', 
    price: 5.99, 
    stock: 200, 
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'High-yield, disease-resistant hybrid tomato seeds for a bountiful harvest.',
    dataAiHint: 'seed packet'
  },
  { 
    id: '5', 
    name: 'AquaFlow Irrigation System', 
    category: 'Equipment', 
    price: 120.50, 
    stock: 25, 
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'Efficient drip irrigation system to conserve water and ensure optimal plant hydration.',
    dataAiHint: 'irrigation system'
  },
  { 
    id: '6', 
    name: 'SoilBoost Compost Mix', 
    category: 'Fertilizers', 
    price: 19.99, 
    stock: 150, 
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'Enrich your soil with this nutrient-rich compost mix, perfect for organic farming.',
    dataAiHint: 'compost bag'
  },
];

export const productCategories: string[] = ['All', 'Fertilizers', 'Pesticides', 'Equipment', 'Seeds'];
