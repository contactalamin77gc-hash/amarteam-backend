import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Player } from '../players/entities/player.entity';
import { Role, AuthProvider, PlayerType, Position, Tier } from '../common/enums';

const PASSWORD = 'Demo@12345';
const DOMAIN = '@demo.amarteam.test';

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const num = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const DISTRICTS: [string, string][] = [
  ['Dhaka', 'Savar'], ['Dhaka', 'Keraniganj'], ['Chattogram', 'Sitakunda'],
  ['Sylhet', 'Beanibazar'], ['Rajshahi', 'Paba'], ['Khulna', 'Dumuria'],
  ['Barishal', 'Babuganj'], ['Rangpur', 'Badarganj'], ['Mymensingh', 'Trishal'],
  ['Cumilla', 'Debidwar'], ['Gazipur', 'Kaliakair'], ['Narayanganj', 'Rupganj'],
];

const CLUBS = [
  'Bashundhara Kings', 'Abahani Limited Dhaka', 'Mohammedan SC', 'Sheikh Russel KC',
  'Chittagong Abahani', 'Sheikh Jamal DC', 'Rahmatganj MFS', 'Fortis FC',
  'Brothers Union', 'Police FC', 'Dhaka Wanderers', 'Arambagh KS',
  'Uttar Baridhara', 'Swadhinata KS', 'CS Tigers',
];

const talent: any[] = [
  // ─── Local players (12) — one for every line of a 4-3-3 plus cover ───
  { name: 'Tariqul Islam',    type: 'player', pos: 'GK',  tier: 'A', age: 27, exp: 9,  nat: true },
  { name: 'Hasibul Karim',    type: 'player', pos: 'GK',  tier: 'C', age: 21, exp: 3 },
  { name: 'Rahat Hossain',    type: 'player', pos: 'CB',  tier: 'A', age: 25, exp: 7,  nat: true },
  { name: 'Imran Sheikh',     type: 'player', pos: 'CB',  tier: 'B', age: 29, exp: 11 },
  { name: 'Sabbir Ahmed',     type: 'player', pos: 'LB',  tier: 'B', age: 23, exp: 4 },
  { name: 'Fahim Reza',       type: 'player', pos: 'RB',  tier: 'B', age: 24, exp: 5 },
  { name: 'Mehedi Hasan',     type: 'player', pos: 'CDM', tier: 'B', age: 26, exp: 6 },
  { name: 'Jubayer Alam',     type: 'player', pos: 'CM',  tier: 'C', age: 20, exp: 2 },
  { name: 'Nayeem Uddin',     type: 'player', pos: 'CAM', tier: 'A', age: 24, exp: 6,  nat: true },
  { name: 'Shakil Mahmud',    type: 'player', pos: 'RW',  tier: 'B', age: 22, exp: 3 },
  { name: 'Tanvir Ahsan',     type: 'player', pos: 'LW',  tier: 'C', age: 21, exp: 3 },
  { name: 'Ariful Rahman',    type: 'player', pos: 'ST',  tier: 'A', age: 28, exp: 10, nat: true },

  // ─── Foreign players (4) ───
  { name: 'Carlos Mendes',    type: 'player', pos: 'ST',  tier: 'A', age: 29, exp: 11,
    foreign: 'Brazil',    living: 'Bangladesh' },
  { name: 'Emeka Okafor',     type: 'player', pos: 'CB',  tier: 'A', age: 26, exp: 8,
    foreign: 'Nigeria',   living: 'Bangladesh' },
  { name: 'Ali Reza Karimi',  type: 'player', pos: 'LW',  tier: 'B', age: 24, exp: 5,
    foreign: 'Iran',      living: 'Iran' },
  { name: 'Diego Fernandes',  type: 'player', pos: 'CM',  tier: 'A', age: 27, exp: 9,
    foreign: 'Argentina', living: 'Bangladesh' },

  // ─── Coaches (2) ───
  { name: 'Mostafizur Rahman', type: 'coach', tier: 'A', age: 45, exp: 18,
    spec: 'Head Coach',        license: 'AFC B License', tactics: '4-3-3 possession-based, high press' },
  { name: 'Kamrul Hasan',      type: 'coach', tier: 'B', age: 38, exp: 11,
    spec: 'Goalkeeping Coach', license: 'AFC C License', tactics: 'Shot-stopping and distribution focus' },

  // ─── Referee (1) ───
  { name: 'Jalal Uddin', type: 'referee', tier: 'A', age: 41, exp: 14,
    refLicense: 'National Level', fifa: true, matches: 210 },

  // ─── Cameraman (1) ───
  { name: 'Rafiq Chowdhury', type: 'cameraman', tier: 'B', age: 31, exp: 7,
    rate: 6500, gear: 'Sony A7 IV, 70-200mm f/2.8, DJI RS3 gimbal', drone: true, editing: true },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);
  const users = ds.getRepository(User);
  const players = ds.getRepository(Player);

  const hashed = await bcrypt.hash(PASSWORD, 12);
  let created = 0;

  for (let i = 0; i < talent.length; i++) {
    const t = talent[i];
    const email = t.name.toLowerCase().replace(/\s+/g, '.') + DOMAIN;

    if (await users.findOne({ where: { email } })) {
      console.log(`skip  ${email}`);
      continue;
    }

    const [district, upazila] = pick(DISTRICTS);

    const user = await users.save(users.create({
      name: t.name,
      email,
      password: hashed,
      phone: `019${String(30000000 + i * 137).slice(0, 8)}`,
      location: district,
      role: Role.PLAYER,
      authProvider: AuthProvider.LOCAL,
      emailVerified: true,   // demo accounts skip verification
      phoneVerified: true,
      isActive: true,
    } as any)) as unknown as User;

    const clubCount = num(1, 3);
    const clubs = Array.from({ length: clubCount }, (_, k) => ({
      name: pick(CLUBS),
      joinYear: 2018 + k * 2,
      leftYear: k === clubCount - 1 ? null : 2019 + k * 2,
      isCurrent: k === clubCount - 1,
    }));

    await players.save(players.create({
      userId: user.id,
      playerType: t.type as PlayerType,
      isApproved: true,      // publicly visible immediately
      isAvailable: Math.random() > 0.2,
      photo: `https://i.pravatar.cc/500?img=${(i % 70) + 1}`,
      position: t.pos ? (t.pos as Position) : undefined,
      tier: t.tier as Tier,
      age: t.age,
      experience: t.exp,
      rating: 0,
      district,
      upazila,
      location: district,
      bio: `${t.name} — ${t.exp} years of competitive football in Bangladesh.`,
      clubs,
      nationalTeams: t.nat ? [{ level: 'Senior', year: 2023, isCurrent: true }] : [],
      charges: {
        friendly:   t.tier === 'A' ? 12000 : t.tier === 'B' ? 8000  : 5000,
        groupRound: t.tier === 'A' ? 18000 : t.tier === 'B' ? 12000 : 7000,
        final:      t.tier === 'A' ? 25000 : t.tier === 'B' ? 16000 : 10000,
        friendlyDiscount: null, groupRoundDiscount: null, finalDiscount: null,
      },
      stats: {
        goals: t.pos === 'ST' ? num(20, 60) : num(0, 15),
        assists: num(0, 30),
        matches: num(30, 150),
        cleanSheets: t.pos === 'GK' ? num(10, 40) : 0,
        yellowCards: num(0, 12),
        redCards: num(0, 2),
      },
      videos: [],
      portfolioPhotos: [],
      portfolioVideos: [],
      // Foreign
      isForeign: !!t.foreign,
      nationality: t.foreign ?? null,
      currentCountry: t.living ?? null,
      availableFrom: t.foreign ? '2026-09-01' : null,
      availableTo: t.foreign ? '2027-03-31' : null,
      // Coach
      specialization: t.spec ?? null,
      coachingLicense: t.license ?? null,
      tacticsStyle: t.tactics ?? null,
      // Referee
      refereeLicense: t.refLicense ?? null,
      fifaBadge: t.fifa ?? false,
      matchesOfficiated: t.matches ?? 0,
      // Cameraman
      perMatchRate: t.rate ?? null,
      equipment: t.gear ?? null,
      hasDrone: t.drone ?? false,
      doesEditing: t.editing ?? false,
    } as any));

    created++;
    console.log(`ok    ${String(t.type).padEnd(10)} ${t.pos ?? '—'}  ${t.name}`);
  }

  console.log(`\n${created} of ${talent.length} talent accounts created.`);
  console.log(`Login: <firstname>.<lastname>${DOMAIN}  /  ${PASSWORD}`);
  await app.close();
}

run().catch(e => { console.error(e); process.exit(1); });