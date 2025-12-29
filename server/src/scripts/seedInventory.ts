import mongoose from 'mongoose';
import { Inventory } from '../models/Inventory';
import { connectDB } from '../config/database';

const inventoryData = [
  // Protein
  {
    name: 'Daging Sapi Tenderloin',
    description: 'Daging sapi premium untuk steak',
    category: 'Protein',
    unit: 'kg',
    current_stock: 15,
    min_stock: 5,
    max_stock: 50,
    cost_per_unit: 180000,
    supplier: 'PT Sumber Protein',
    supplier_contact: '081234567890',
    is_perishable: true,
    storage_location: 'Freezer A',
    image_url: 'https://images.unsplash.com/photo-1588347818481-c7c1b6b8b8b8?w=300',
  },
  {
    name: 'Ayam Fillet',
    description: 'Daging ayam tanpa tulang untuk berbagai masakan',
    category: 'Protein',
    unit: 'kg',
    current_stock: 25,
    min_stock: 10,
    max_stock: 100,
    cost_per_unit: 45000,
    supplier: 'CV Ayam Segar',
    supplier_contact: '081234567891',
    is_perishable: true,
    storage_location: 'Freezer B',
    image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300',
  },
  {
    name: 'Ikan Salmon',
    description: 'Ikan salmon segar untuk sashimi dan grilled',
    category: 'Protein',
    unit: 'kg',
    current_stock: 8,
    min_stock: 3,
    max_stock: 20,
    cost_per_unit: 220000,
    supplier: 'Seafood Prima',
    supplier_contact: '081234567892',
    is_perishable: true,
    storage_location: 'Chiller',
    image_url: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300',
  },

  // Sayuran
  {
    name: 'Bawang Merah',
    description: 'Bawang merah lokal untuk bumbu dasar',
    category: 'Sayuran',
    unit: 'kg',
    current_stock: 20,
    min_stock: 5,
    max_stock: 50,
    cost_per_unit: 35000,
    supplier: 'Tani Sejahtera',
    supplier_contact: '081234567893',
    is_perishable: true,
    storage_location: 'Gudang Sayur',
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
  },
  {
    name: 'Tomat',
    description: 'Tomat segar untuk salad dan masakan',
    category: 'Sayuran',
    unit: 'kg',
    current_stock: 12,
    min_stock: 8,
    max_stock: 30,
    cost_per_unit: 15000,
    supplier: 'Tani Sejahtera',
    supplier_contact: '081234567893',
    is_perishable: true,
    storage_location: 'Chiller Sayur',
    image_url: 'https://images.unsplash.com/photo-1546470427-e5b89b618b84?w=300',
  },
  {
    name: 'Selada',
    description: 'Selada segar untuk salad',
    category: 'Sayuran',
    unit: 'kg',
    current_stock: 5,
    min_stock: 3,
    max_stock: 15,
    cost_per_unit: 25000,
    supplier: 'Hidroponik Fresh',
    supplier_contact: '081234567894',
    is_perishable: true,
    storage_location: 'Chiller Sayur',
    image_url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300',
  },

  // Dairy
  {
    name: 'Keju Mozzarella',
    description: 'Keju mozzarella untuk pizza dan pasta',
    category: 'Dairy',
    unit: 'kg',
    current_stock: 10,
    min_stock: 5,
    max_stock: 25,
    cost_per_unit: 85000,
    supplier: 'Dairy Indonesia',
    supplier_contact: '081234567895',
    is_perishable: true,
    storage_location: 'Chiller',
    image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300',
  },
  {
    name: 'Susu Segar',
    description: 'Susu segar untuk minuman dan masakan',
    category: 'Dairy',
    unit: 'liter',
    current_stock: 15,
    min_stock: 10,
    max_stock: 50,
    cost_per_unit: 18000,
    supplier: 'Dairy Indonesia',
    supplier_contact: '081234567895',
    is_perishable: true,
    storage_location: 'Chiller',
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
  },

  // Bumbu
  {
    name: 'Garam',
    description: 'Garam dapur untuk masakan',
    category: 'Bumbu',
    unit: 'kg',
    current_stock: 50,
    min_stock: 20,
    max_stock: 100,
    cost_per_unit: 8000,
    supplier: 'Bumbu Nusantara',
    supplier_contact: '081234567896',
    is_perishable: false,
    storage_location: 'Gudang Kering',
    image_url: 'https://images.unsplash.com/photo-1472162314594-a27637f1bf5f?w=300',
  },
  {
    name: 'Merica Hitam',
    description: 'Merica hitam bubuk untuk seasoning',
    category: 'Bumbu',
    unit: 'kg',
    current_stock: 3,
    min_stock: 2,
    max_stock: 10,
    cost_per_unit: 120000,
    supplier: 'Spice Trading',
    supplier_contact: '081234567897',
    is_perishable: false,
    storage_location: 'Gudang Kering',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
  },

  // Minyak
  {
    name: 'Minyak Goreng',
    description: 'Minyak goreng untuk deep frying',
    category: 'Minyak',
    unit: 'liter',
    current_stock: 40,
    min_stock: 20,
    max_stock: 100,
    cost_per_unit: 16000,
    supplier: 'Minyak Sejahtera',
    supplier_contact: '081234567898',
    is_perishable: false,
    storage_location: 'Gudang Kering',
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300',
  },
  {
    name: 'Olive Oil',
    description: 'Minyak zaitun extra virgin untuk salad',
    category: 'Minyak',
    unit: 'liter',
    current_stock: 5,
    min_stock: 3,
    max_stock: 15,
    cost_per_unit: 180000,
    supplier: 'Import Premium',
    supplier_contact: '081234567899',
    is_perishable: false,
    storage_location: 'Gudang Kering',
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300',
  },

  // Tepung
  {
    name: 'Tepung Terigu',
    description: 'Tepung terigu protein tinggi untuk roti dan pasta',
    category: 'Tepung',
    unit: 'kg',
    current_stock: 100,
    min_stock: 50,
    max_stock: 200,
    cost_per_unit: 12000,
    supplier: 'Tepung Prima',
    supplier_contact: '081234567800',
    is_perishable: false,
    storage_location: 'Gudang Kering',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300',
  },

  // Kemasan
  {
    name: 'Styrofoam Box',
    description: 'Kotak styrofoam untuk takeaway',
    category: 'Kemasan',
    unit: 'pcs',
    current_stock: 500,
    min_stock: 200,
    max_stock: 1000,
    cost_per_unit: 2500,
    supplier: 'Kemasan Jaya',
    supplier_contact: '081234567801',
    is_perishable: false,
    storage_location: 'Gudang Kemasan',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
  },
  {
    name: 'Plastik Wrap',
    description: 'Plastik pembungkus makanan',
    category: 'Kemasan',
    unit: 'roll',
    current_stock: 20,
    min_stock: 10,
    max_stock: 50,
    cost_per_unit: 45000,
    supplier: 'Kemasan Jaya',
    supplier_contact: '081234567801',
    is_perishable: false,
    storage_location: 'Gudang Kemasan',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
  },
];

const seedInventory = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Seeding inventory data...');
    
    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('🗑️  Cleared existing inventory');
    
    // Insert new inventory data
    const inventory = await Inventory.insertMany(inventoryData);
    console.log(`✅ Created ${inventory.length} inventory items`);
    
    console.log('🎉 Inventory seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedInventory();
}

export default seedInventory;