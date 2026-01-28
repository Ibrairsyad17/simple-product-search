import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import type { Category } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['error'],
});

// Sample data
const categories = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports & Outdoors',
  'Toys & Games',
  'Beauty & Personal Care',
  'Health & Wellness',
  'Automotive',
  'Office Products',
];

const productNames = [
  'Premium',
  'Deluxe',
  'Pro',
  'Ultra',
  'Smart',
  'Advanced',
  'Essential',
  'Classic',
  'Modern',
  'Professional',
  'Compact',
  'Portable',
  'Wireless',
];

const productTypes = [
  'Laptop',
  'Phone',
  'Watch',
  'Camera',
  'Headphones',
  'Speaker',
  'Tablet',
  'Shirt',
  'Jeans',
  'Shoes',
  'Jacket',
  'Dress',
  'Bag',
  'Sunglasses',
  'Novel',
  'Cookbook',
  'Textbook',
  'Magazine',
  'Journal',
  'Calendar',
  'Blender',
  'Coffee Maker',
  'Vacuum',
  'Lamp',
  'Chair',
  'Desk',
  'Bed',
  'Basketball',
  'Tennis Racket',
  'Yoga Mat',
  'Dumbbells',
  'Bike',
  'Tent',
  'Action Figure',
  'Board Game',
  'Puzzle',
  'Doll',
  'Building Blocks',
  'Shampoo',
  'Moisturizer',
  'Perfume',
  'Makeup Kit',
  'Hair Dryer',
  'Vitamins',
  'Protein Powder',
  'Thermometer',
  'Blood Pressure Monitor',
  'Car Seat',
  'Tool Kit',
  'Car Polish',
  'Air Freshener',
  'GPS Navigator',
  'Printer',
  'Mouse',
  'Keyboard',
  'Monitor',
  'Webcam',
  'Desk Organizer',
];

const adjectives = [
  'Excellent',
  'Amazing',
  'Fantastic',
  'Outstanding',
  'Superior',
  'Premium',
  'High-Quality',
  'Durable',
  'Reliable',
  'Efficient',
  'Innovative',
  'Sleek',
];

function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function generateProductName(): string {
  return `${getRandomElement(productNames)} ${getRandomElement(productTypes)}`;
}

function generateDescription(): string {
  const features = getRandomElements(adjectives, 3);
  return `${features.join(', ')} product that delivers exceptional performance and value. Perfect for everyday use with premium quality materials and modern design.`;
}

function generatePrice(): number {
  return Math.round((Math.random() * 999 + 1) * 100) / 100;
}

function generateRating(): number {
  return Math.round((Math.random() * 2 + 3) * 100) / 100; // Between 3.00 and 5.00
}

function generateImageUrls(count: number): string[] {
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    images.push(
      `https://picsum.photos/seed/${generateRandomString(10)}/800/600`
    );
  }
  return images;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.productCategory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  console.log('📁 Creating categories...');
  const createdCategories = await Promise.all(
    categories.map((name) =>
      prisma.category.create({
        data: { name },
      })
    )
  );
  console.log(`✅ Created ${createdCategories.length} categories`);

  // Create users
  console.log('👥 Creating 1,000 users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = [];

  for (let i = 1; i <= 1000; i++) {
    const email = `user${i}@example.com`;
    const name = `User ${i}`;

    users.push({
      email,
      password: hashedPassword,
      name,
      provider: 'local',
    });
  }

  // Batch insert users
  await prisma.user.createMany({
    data: users,
  });
  console.log(`✅ Created 1,000 users`);

  // Create products
  console.log('📦 Creating 1,000 products...');

  for (let i = 1; i <= 1000; i++) {
    const productCategories: Category[] = getRandomElements(
      createdCategories,
      Math.floor(Math.random() * 3) + 1
    );

    const imageUrls = generateImageUrls(Math.floor(Math.random() * 4) + 1);

    await prisma.product.create({
      data: {
        name: generateProductName(),
        description: generateDescription(),
        price: generatePrice(),
        rating: generateRating(),
        inStock: Math.random() > 0.2, // 80% in stock
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
        categories: {
          create: productCategories.map((category) => ({
            categoryId: category.id,
          })),
        },
      },
    });

    if (i % 100 === 0) {
      console.log(`  Created ${i} products...`);
    }
  }

  console.log(`✅ Created 1,000 products`);

  // Get counts
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.productImage.count(),
    prisma.productCategory.count(),
  ]);

  console.log('\n📊 Database Statistics:');
  console.log(`  Users: ${counts[0]}`);
  console.log(`  Products: ${counts[1]}`);
  console.log(`  Categories: ${counts[2]}`);
  console.log(`  Product Images: ${counts[3]}`);
  console.log(`  Product-Category Relations: ${counts[4]}`);
  console.log('\n✨ Seed completed successfully!');
  console.log('📝 Default password for all users: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
