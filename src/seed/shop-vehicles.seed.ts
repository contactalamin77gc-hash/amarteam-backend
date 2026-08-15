import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Category } from '../shop/entities/category.entity';
import { Product } from '../shop/entities/product.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleType } from '../common/enums';

/** Unsplash source images — swap for Cloudinary uploads before launch. */
const img = (id: string) => ({
  url: `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`,
  publicId: `demo/${id}`,
});

const CATEGORIES = [
  { name: 'Jerseys',    nameBn: 'জার্সি',        icon: '👕', sortOrder: 1, description: 'Club and custom team jerseys' },
  { name: 'Boots',      nameBn: 'বুট',           icon: '👟', sortOrder: 2, description: 'Football boots for turf and grass' },
  { name: 'Footballs',  nameBn: 'ফুটবল',         icon: '⚽', sortOrder: 3, description: 'Match and training balls' },
  { name: 'Goalkeeping',nameBn: 'গোলকিপিং',      icon: '🧤', sortOrder: 4, description: 'Gloves and keeper gear' },
  { name: 'Training',   nameBn: 'ট্রেনিং',        icon: '🎯', sortOrder: 5, description: 'Cones, bibs, ladders and kit' },
  { name: 'Accessories',nameBn: 'আনুষাঙ্গিক',     icon: '🎒', sortOrder: 6, description: 'Bags, socks, guards and bottles' },
];

const PRODUCTS: any[] = [
  // ── Jerseys ──
  { cat: 'Jerseys', name: 'Amar Team Custom Home Jersey', nameBn: 'কাস্টম হোম জার্সি',
    price: 850, oldPrice: 1200, stock: 120, brand: 'Amar Team', featured: true, sold: 340,
    photo: '1517466787929-bc90951d0974',
    description: 'Breathable polyester mesh with your club name and number printed. Minimum order of one; bulk pricing available for full squads.',
    variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] }, { name: 'Colour', options: ['Red', 'Blue', 'Green', 'Black', 'White'] }] },

  { cat: 'Jerseys', name: 'Full Sleeve Training Jersey', nameBn: 'ফুল স্লিভ জার্সি',
    price: 950, stock: 80, brand: 'Amar Team', sold: 95,
    photo: '1580087433295-ab2600c1030e',
    description: 'Long sleeve dri-fit top for cooler mornings and evening sessions.',
    variants: [{ name: 'Size', options: ['M', 'L', 'XL'] }] },

  { cat: 'Jerseys', name: 'Goalkeeper Jersey Padded', nameBn: 'গোলকিপার জার্সি',
    price: 1350, oldPrice: 1600, stock: 40, brand: 'Sondico', sold: 52,
    photo: '1526232761682-d26e03ac148e',
    description: 'Elbow-padded keeper shirt with a loose cut for diving.',
    variants: [{ name: 'Size', options: ['M', 'L', 'XL'] }] },

  { cat: 'Jerseys', name: 'Team Kit Set — Jersey + Shorts', nameBn: 'টিম কিট সেট',
    price: 1450, oldPrice: 1900, stock: 60, brand: 'Amar Team', featured: true, sold: 180,
    photo: '1571019613454-1cb2f99b2d8b',
    description: 'Complete kit for one player. Order eleven or more for a full squad discount.',
    variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'] }, { name: 'Colour', options: ['Red/White', 'Blue/White', 'Green/Black'] }] },

  // ── Boots ──
  { cat: 'Boots', name: 'Nike Phantom GX Academy TF', nameBn: 'নাইকি ফ্যান্টম TF',
    price: 4800, oldPrice: 5500, stock: 25, brand: 'Nike', featured: true, sold: 67,
    photo: '1511886929837-354d827aae26',
    description: 'Turf sole for artificial pitches, which is what most Dhaka grounds use.',
    variants: [{ name: 'Size', options: ['39', '40', '41', '42', '43', '44'] }] },

  { cat: 'Boots', name: 'Adidas Predator Club FG', nameBn: 'অ্যাডিডাস প্রিডেটর FG',
    price: 5200, stock: 18, brand: 'Adidas', sold: 41,
    photo: '1560769629-975ec94e6a86',
    description: 'Firm ground studs with a textured strike zone for shooting.',
    variants: [{ name: 'Size', options: ['40', '41', '42', '43', '44'] }] },

  { cat: 'Boots', name: 'Puma King Match TT', nameBn: 'পুমা কিং TT',
    price: 3900, oldPrice: 4600, stock: 30, brand: 'Puma', sold: 88,
    photo: '1542291026-7eec264c27ff',
    description: 'Classic leather upper. Comfortable straight out of the box.',
    variants: [{ name: 'Size', options: ['39', '40', '41', '42', '43'] }] },

  { cat: 'Boots', name: 'Indoor Court Shoes', nameBn: 'ইনডোর কোর্ট শু',
    price: 2400, stock: 35, brand: 'Kelme', sold: 29,
    photo: '1595950653106-6c9ebd614d3a',
    description: 'Non-marking flat sole for futsal and indoor courts.',
    variants: [{ name: 'Size', options: ['39', '40', '41', '42', '43'] }] },

  // ── Footballs ──
  { cat: 'Footballs', name: 'FIFA Quality Match Ball Size 5', nameBn: 'ম্যাচ বল সাইজ ৫',
    price: 2200, oldPrice: 2800, stock: 45, brand: 'Molten', featured: true, sold: 210,
    photo: '1614632537190-23e4146777db',
    description: 'Thermally bonded, holds shape and pressure through a full season.',
    variants: [] },

  { cat: 'Footballs', name: 'Training Ball Size 5', nameBn: 'ট্রেনিং বল',
    price: 950, stock: 100, brand: 'Amar Team', sold: 320,
    photo: '1552667466-07770ae110d0',
    description: 'Hand-stitched practice ball. Buy several — they take a beating.',
    variants: [] },

  { cat: 'Footballs', name: 'Futsal Ball Size 4', nameBn: 'ফুটসাল বল',
    price: 1400, stock: 30, brand: 'Molten', sold: 44,
    photo: '1517927033932-b3d18e61fb3a',
    description: 'Low-bounce ball built for hard indoor courts.',
    variants: [] },

  { cat: 'Footballs', name: 'Kids Ball Size 3', nameBn: 'কিডস বল',
    price: 650, stock: 55, brand: 'Amar Team', sold: 130,
    photo: '1486286701208-1d58e9338013',
    description: 'Lighter and smaller for academy players under twelve.',
    variants: [] },

  // ── Goalkeeping ──
  { cat: 'Goalkeeping', name: 'Pro Grip Goalkeeper Gloves', nameBn: 'গোলকিপার গ্লাভস',
    price: 1800, oldPrice: 2300, stock: 22, brand: 'Reusch', featured: true, sold: 76,
    photo: '1551958219-acbc608c6377',
    description: '4mm German latex palm with a wrap-around wrist strap.',
    variants: [{ name: 'Size', options: ['7', '8', '9', '10', '11'] }] },

  { cat: 'Goalkeeping', name: 'Padded Keeper Shorts', nameBn: 'কিপার শর্টস',
    price: 1100, stock: 28, brand: 'Sondico', sold: 33,
    photo: '1593341646782-e0b495cc86d9',
    description: 'Hip padding that actually helps on hard grounds.',
    variants: [{ name: 'Size', options: ['M', 'L', 'XL'] }] },

  { cat: 'Goalkeeping', name: 'Glove Wash & Grip Spray', nameBn: 'গ্লাভ স্প্রে',
    price: 450, stock: 60, brand: 'Reusch', sold: 91,
    photo: '1584464491033-06628f3a6b7b',
    description: 'Restores tack on worn latex. Spray before kickoff.',
    variants: [] },

  // ── Training ──
  { cat: 'Training', name: 'Training Cones — Set of 50', nameBn: 'ট্রেনিং কোন ৫০',
    price: 900, oldPrice: 1200, stock: 40, brand: 'Amar Team', sold: 165,
    photo: '1526506118085-60ce8714f8c5',
    description: 'Flexible disc cones in four colours, with a carry stand.',
    variants: [] },

  { cat: 'Training', name: 'Agility Ladder 6m', nameBn: 'এজিলিটি ল্যাডার',
    price: 750, stock: 35, brand: 'Amar Team', sold: 82,
    photo: '1517838277536-f5f99be501cd',
    description: 'Adjustable rungs for footwork drills. Folds into the bag.',
    variants: [] },

  { cat: 'Training', name: 'Training Bibs — Pack of 12', nameBn: 'ট্রেনিং বিব ১২',
    price: 1200, stock: 25, brand: 'Amar Team', featured: true, sold: 118,
    photo: '1594736797933-d0401ba2fe65',
    description: 'Mesh bibs for splitting a squad into sides.',
    variants: [{ name: 'Colour', options: ['Orange', 'Yellow', 'Pink', 'Green'] }] },

  // ── Accessories ──
  { cat: 'Accessories', name: 'Shin Guards with Ankle Sock', nameBn: 'শিন গার্ড',
    price: 550, oldPrice: 750, stock: 70, brand: 'Nivia', sold: 245,
    photo: '1543326727-cf6c39e8f84c',
    description: 'Hard shell with a compression sleeve. Required in most leagues.',
    variants: [{ name: 'Size', options: ['S', 'M', 'L'] }] },

  { cat: 'Accessories', name: 'Grip Football Socks', nameBn: 'গ্রিপ মোজা',
    price: 480, stock: 90, brand: 'Amar Team', sold: 310,
    photo: '1586350977771-b3b0abd50c82',
    description: 'Silicone grip pads inside the boot to stop your foot sliding.',
    variants: [{ name: 'Size', options: ['Free'] }, { name: 'Colour', options: ['Black', 'White', 'Red', 'Blue'] }] },
];

const VEHICLES: any[] = [
  { model: 'Toyota Hiace 15-Seater', vehicleType: VehicleType.MICROBUS, seats: 15, hasAc: true,
    basePerDay: 6500, minDays: 1, maxDays: 15, baseDistrict: 'Dhaka', registrationNo: 'DHA-KA-1234',
    photo: '1464219789935-c2d9d9aba644',
    description: 'The standard team transport. Fits a full squad with kit bags in the rear.',
    charges: [
      { district: 'Chattogram', extraCharge: 4000 }, { district: 'Sylhet', extraCharge: 3500 },
      { district: 'Rajshahi', extraCharge: 4500 }, { district: 'Khulna', extraCharge: 5000 },
      { district: 'Rangpur', extraCharge: 6000 }, { district: 'Barishal', extraCharge: 5500 },
    ] },

  { model: 'Toyota Noah 11-Seater', vehicleType: VehicleType.MICROBUS, seats: 11, hasAc: true,
    basePerDay: 5000, minDays: 1, maxDays: 10, baseDistrict: 'Dhaka', registrationNo: 'DHA-KHA-5678',
    photo: '1519641471654-76ce0107ad1b',
    description: 'Smaller squad or a coaching staff run. More comfortable than the Hiace.',
    charges: [
      { district: 'Chattogram', extraCharge: 3500 }, { district: 'Sylhet', extraCharge: 3000 },
      { district: 'Gazipur', extraCharge: 800 }, { district: 'Cumilla', extraCharge: 2000 },
    ] },

  { model: 'Ashok Leyland 32-Seater Bus', vehicleType: VehicleType.BUS, seats: 32, hasAc: true,
    basePerDay: 12000, minDays: 1, maxDays: 20, baseDistrict: 'Dhaka', registrationNo: 'DHA-GA-9012',
    photo: '1544620347-c4fd4a3d5957',
    description: 'Two squads plus staff and supporters. Book early for tournament weekends.',
    charges: [
      { district: 'Chattogram', extraCharge: 8000 }, { district: 'Sylhet', extraCharge: 7000 },
      { district: 'Rajshahi', extraCharge: 9000 }, { district: 'Khulna', extraCharge: 9500 },
    ] },

  { model: 'Toyota Premio Sedan', vehicleType: VehicleType.CAR, seats: 4, hasAc: true,
    basePerDay: 3500, minDays: 1, maxDays: 30, baseDistrict: 'Dhaka', registrationNo: 'DHA-GHA-3456',
    photo: '1503376780353-7e6692767b70',
    description: 'For a coach, a scout, or a couple of players travelling separately.',
    charges: [
      { district: 'Chattogram', extraCharge: 2500 }, { district: 'Sylhet', extraCharge: 2200 },
      { district: 'Gazipur', extraCharge: 500 },
    ] },

  { model: 'Nissan X-Trail SUV', vehicleType: VehicleType.CAR, seats: 7, hasAc: true,
    basePerDay: 4800, minDays: 1, maxDays: 15, baseDistrict: 'Chattogram', registrationNo: 'CTG-KA-7788',
    photo: '1533473359331-0135ef1b58bf',
    description: 'Based in Chattogram. Handles rough approach roads to rural grounds.',
    charges: [
      { district: 'Dhaka', extraCharge: 3000 }, { district: 'Cox\'s Bazar', extraCharge: 1500 },
      { district: 'Rangamati', extraCharge: 2000 },
    ] },

 { model: 'Kit & Equipment Van', vehicleType: VehicleType.PICKUP, seats: 3, hasAc: false,
    basePerDay: 3000, minDays: 1, maxDays: 20, baseDistrict: 'Dhaka', registrationNo: 'DHA-CHA-2211',
    photo: '1601584115197-04ecc0da31d7',
    description: 'Cargo space for goals, cones, water and kit. Runs alongside the team bus.',
    charges: [
      { district: 'Chattogram', extraCharge: 2500 }, { district: 'Sylhet', extraCharge: 2200 },
      { district: 'Mymensingh', extraCharge: 1200 },
    ] },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  const catRepo = ds.getRepository(Category);
  const prodRepo = ds.getRepository(Product);
  const vehRepo = ds.getRepository(Vehicle);

  // ─── Categories ───
  const catMap: Record<string, Category> = {};
  for (const c of CATEGORIES) {
    let row = await catRepo.findOne({ where: { name: c.name } });
    if (!row) {
      row = await catRepo.save(catRepo.create({ ...c, isActive: true } as any)) as unknown as Category;
      console.log(`cat   + ${c.name}`);
    } else {
      console.log(`cat   = ${c.name}`);
    }
    catMap[c.name] = row;
  }

  // ─── Products ───
  let prodCount = 0;
  for (const p of PRODUCTS) {
    if (await prodRepo.findOne({ where: { name: p.name } })) {
      console.log(`prod  = ${p.name}`);
      continue;
    }
    await prodRepo.save(prodRepo.create({
      name: p.name,
      nameBn: p.nameBn,
      description: p.description,
      categoryId: catMap[p.cat]?.id,
      photos: [img(p.photo)],
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      stock: p.stock,
      brand: p.brand,
      variants: p.variants ?? [],
      dhakaDeliveryCharge: 60,
      outsideDeliveryCharge: 120,
      isFeatured: !!p.featured,
      isActive: true,
      soldCount: p.sold ?? 0,
    } as any));
    prodCount++;
    console.log(`prod  + ${p.name}`);
  }

  // ─── Vehicles ───
  let vehCount = 0;
  for (const v of VEHICLES) {
    if (await vehRepo.findOne({ where: { model: v.model } })) {
      console.log(`veh   = ${v.model}`);
      continue;
    }
    await vehRepo.save(vehRepo.create({
      model: v.model,
      vehicleType: v.vehicleType,
      seats: v.seats,
      hasAc: v.hasAc,
      description: v.description,
      photos: [img(v.photo)],
      basePerDay: v.basePerDay,
      districtCharges: v.charges,
      minDays: v.minDays,
      maxDays: v.maxDays,
      isAvailable: true,
      unavailableDates: [],
      baseDistrict: v.baseDistrict,
      registrationNo: v.registrationNo,
    } as any));
    vehCount++;
    console.log(`veh   + ${v.model}`);
  }

  console.log(`\n${CATEGORIES.length} categories, ${prodCount} products, ${vehCount} vehicles seeded.`);
  await app.close();
}

run().catch(e => { console.error(e); process.exit(1); });