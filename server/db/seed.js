// Fills an empty database with starter content from the resume.
// Run with --force to wipe existing content and reseed.
// If the resume folder sits next to this project, the portrait, logo, certificates
// and resume PDF are copied into uploads/ too (set SEED_ASSETS_DIR to point elsewhere).
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = process.env.SEED_ASSETS_DIR || path.resolve(__dirname, '../../..');
const UPLOADS = path.resolve(__dirname, '../uploads');
const force = process.argv.includes('--force');

function copyAsset(relPath, targetName) {
  const src = path.join(ASSETS, relPath);
  if (!fs.existsSync(src)) return '';
  fs.mkdirSync(UPLOADS, { recursive: true });
  fs.copyFileSync(src, path.join(UPLOADS, targetName));
  return `/uploads/${targetName}`;
}

async function insertMany(table, rows) {
  for (const [i, row] of rows.entries()) {
    const data = { sort_order: i, ...row };
    const cols = Object.keys(data);
    await pool.query(
      `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((_, j) => `$${j + 1}`).join(', ')})`,
      cols.map((c) => data[c]),
    );
  }
}

const TABLES = ['experiences', 'projects', 'education', 'skills', 'languages', 'certifications', 'awards', 'leadership'];

try {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM experiences');
  if (rows[0].n > 0 && !force) {
    console.log('Content already exists. Run "npm run db:seed -- --force" to wipe and reseed.');
    process.exit(0);
  }
  if (force) await pool.query(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY`);

  const photo = copyAsset('My Portrait.JPG', 'seed-portrait.jpg');
  const resume = copyAsset('Patcharada_Tawaditap_Resume.pdf', 'Patcharada_Tawaditap_Resume.pdf');
  const chula = copyAsset('Logo_of_Chulalongkorn_University.svg.png', 'seed-chula.png');

  await pool.query(
    `UPDATE profile SET full_name=$1, headline=$2, tagline=$3, bio=$4, location=$5, availability=$6,
       email=$7, phone=$8, linkedin_url=$9, github_url=$10, photo_url=$11, resume_url=$12, updated_at=now()
     WHERE id = 1`,
    [
      'Patcharada Tawaditap',
      'Software Engineer & Computer Engineering student',
      'I build AI products, iOS apps, and the interfaces around them.',
      'Computer Engineering student at Chulalongkorn University and Software Engineer at Basic Concept Ltd. (Hong Kong). I ship AI agents and full-stack web apps, design interfaces in Figma, and founded EiPCA, a portable ECG device for low-cost heart-disease screening. Two-time WWDC Swift Student Challenge winner and Huawei Cloud Student Developer Ambassador.',
      'Bangkok, Thailand',
      'Open to internships and collaborations',
      'patcharada37778@gmail.com',
      '+66 63 112 9384',
      'https://www.linkedin.com/in/patcharada-tawaditap',
      'https://github.com/Patcharada37778',
      photo,
      resume,
    ],
  );

  await insertMany('experiences', [
    {
      role: 'Software Engineer', company: 'Basic Concept Ltd.', location: 'Hong Kong', employment_type: 'Full-time',
      start_date: 'Aug 2026', end_date: 'Present',
      description: 'Built Contentify, a Python-based AI agent that generates and publishes social media content using live web sources, OpenRouter, and the Telegram Bot API; deployed on Google Cloud with automated Git-based deployment.\nSimplified content creation through click-based selections and added Telegram error notifications for production troubleshooting; used in production for company marketing and pitched to a Japanese engineering firm.',
      tech: 'Python, OpenRouter, Telegram Bot API, LinkedIn API, Google Cloud, systemd',
    },
    {
      role: 'ML Engineer Intern', company: 'Basic Concept Ltd.', location: 'Hong Kong', employment_type: 'Internship',
      start_date: 'May 2026', end_date: 'Aug 2026',
      description: 'Developed Memeify.cc using Next.js, React, TypeScript, and PostgreSQL, integrating Claude, Gemini, and Seedance; attracted 87 new users in its first month.\nBuilt 29 API routes and a 7-table database with Prisma; implemented Redis-based rate limiting, caching, and a custom analytics dashboard.\nAuthored a Claude Code custom skill (/video) that automates promo video generation, from Playwright asset capture to script synthesis and mastering.\nDeveloped Neto.la, translating Figma designs into a project-planning web app adopted by 3 client companies.',
      tech: 'Next.js, React, TypeScript, PostgreSQL, Prisma, Redis, Huawei Cloud',
    },
    {
      role: 'UI/UX Designer Intern', company: 'GreenMoons Co., Ltd', location: 'Thailand', employment_type: 'Internship',
      start_date: 'May 2025', end_date: 'Jul 2025',
      description: 'Designed a real-time rooftop solar monitoring app in Figma with Tolgee localization; the app passed 100 users on the App Store.\nDesigned stock-management web interfaces for 2 client companies, refining the UI through iterative testing.',
      tech: 'Figma, Tolgee',
    },
    {
      role: 'Swift Language Tutor', company: 'Algorithmics', location: 'Bangkok, Thailand', employment_type: 'Part-time',
      start_date: 'Jan 2025', end_date: 'Mar 2026',
      description: 'Taught 6 students Swift and iOS development.\nCoached 4 students for the WWDC Swift Student Challenge; 2 became Winners and 1 a Distinguished Winner.',
      tech: 'Swift, SwiftUI',
    },
  ]);

  await insertMany('projects', [
    {
      title: 'EiPCA', role: 'Founder', start_date: 'Oct 2022', end_date: 'Present', featured: true,
      summary: 'A portable 3-electrode ECG device that reconstructs a full 12-lead reading for low-cost heart-disease self-screening.',
      description: 'Founded EiPCA, a rapid, portable 3-electrode ECG device that reconstructs a full 12-lead reading from a single lead using a proprietary algorithm (copyrighted).\nGathered requirements through interviews with at-risk patients, cardiologists, and specialists; turned findings into work tickets and Gantt charts to manage the development team.\nResearched and lab-tested the 3-electrode to 12-lead conversion; validated accuracy against standard 10-electrode hospital equipment and earned approval from a cardiologist.\nRegeneron ISEF 2024 Grand Award and Intel AI Global Impact Festival 2023 Country Winner.',
      tech: 'Signal Processing, Figma, Trello',
    },
    {
      title: 'Memeify.cc', role: 'ML Engineer', start_date: 'May 2026', end_date: 'Aug 2026', featured: true,
      summary: 'An AI viral content engine that turns social trends into branded marketing media.',
      description: 'Architected, built and deployed the product end to end.\nIntegrated Claude, Gemini and Seedance through OpenRouter.\n29 API routes, a 7-table Prisma schema, Redis rate limiting and caching, and a custom analytics dashboard.\n87 new users in the first month.',
      tech: 'Next.js, TypeScript, PostgreSQL, Prisma, Redis, OpenRouter',
      live_url: 'https://memeify.cc',
    },
    {
      title: 'Contentify', role: 'Software Engineer', start_date: 'Aug 2026', end_date: 'Present', featured: true,
      summary: 'A self-hosted AI agent that writes and publishes LinkedIn content from live web sources.',
      description: 'Telegram bot interface with click-based selections.\nLLM generation through OpenRouter and publishing through the LinkedIn API.\nDeployed on Google Cloud with systemd and a Git-based auto-deploy pipeline.',
      tech: 'Python, Telegram Bot API, OpenRouter, LinkedIn API, Google Cloud',
    },
    {
      title: 'Neto.la', role: 'ML Engineer Intern', start_date: '2026', end_date: '',
      summary: 'A project planner web app built from a Figma design system and adopted by 3 client companies.',
      description: 'Translated Figma design systems into production code.\nAuthored documentation and pitched the product to 3 client companies (100% adoption).',
      tech: 'Next.js, Figma',
    },
    {
      title: 'Good Morning Monday', role: 'Developer', start_date: 'Jan 2025', end_date: 'Mar 2025',
      summary: 'A turn-based life-simulation desktop game written in Java.',
      description: 'Object-oriented design with interfaces, inheritance, encapsulation and polymorphism.\nImplemented game logic, player roles, event handling and UI state transitions.',
      tech: 'Java, OOP',
    },
    {
      title: 'Homo Sapiens', role: 'iOS Developer & Illustrator', start_date: '2024', end_date: '',
      summary: 'A 5-level educational iOS app teaching children ages 8 to 12 about human evolution. WWDC24 Distinguished Winner.',
      description: 'Combined Swift development with custom illustration.',
      tech: 'Swift, SwiftUI, Adobe Illustrator',
    },
    {
      title: 'TeethStory', role: 'iOS Developer', start_date: '2023', end_date: '',
      summary: 'A gamified iOS app that teaches children dental hygiene through stories. WWDC23 Winner.',
      description: '5 features: Teeth Model, Song, Progress Bar, Story, and Day & Night Levels.',
      tech: 'Swift, SwiftUI, Figma',
    },
  ]);

  await insertMany('education', [
    {
      school: 'Chulalongkorn University', degree: 'B.Eng., Computer Engineering and Digital Technology',
      location: 'Bangkok, Thailand', start_date: 'Aug 2024', end_date: 'Present', gpa: '3.47', logo_url: chula,
      details: 'Coursework: Data Structures & Algorithms, AI and ML, Database Systems, Software Engineering, Operating Systems, Computer Networks\nActivities: Engineering Student Committee, Thinc. (Thailand Incubator)',
    },
  ]);

  const skills = {
    Languages: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'Swift', 'SQL'],
    Web: ['React', 'Next.js', 'HTML/CSS', 'Node.js'],
    'Data & Tools': ['PostgreSQL', 'Prisma ORM', 'Redis', 'Git', 'DBeaver'],
    Cloud: ['Google Cloud Platform', 'Huawei Cloud'],
    Design: ['Figma', 'Adobe Illustrator'],
  };
  await insertMany('skills', Object.entries(skills).flatMap(([category, names]) => names.map((name) => ({ category, name }))));

  await insertMany('languages', [
    { name: 'Thai', proficiency: 'Native' },
    { name: 'English', proficiency: 'IELTS 6.5' },
    { name: 'Japanese', proficiency: 'JLPT N5' },
  ]);

  await insertMany('certifications', [
    { name: 'HCCDA-AI', issuer: 'Huawei Cloud', image_url: copyAsset('Certificates/HCCDA-AI.png', 'seed-cert-hccda-ai.png') },
    { name: 'HCCDA-Tech Essentials', issuer: 'Huawei Cloud', image_url: copyAsset('Certificates/HCCDA-Tech Essential.png', 'seed-cert-hccda-tech.png') },
    { name: 'HCCDP-Solution Architecture', issuer: 'Huawei Cloud', image_url: copyAsset('Certificates/HCCDP-Solution Architecture.png', 'seed-cert-hccdp-sa.png') },
  ]);

  await insertMany('awards', [
    { title: 'Huawei Developer Competition — 1st Runner-up', issuer: 'Huawei', year: '2025' },
    { title: 'WWDC24 Swift Student Challenge — Distinguished Winner', issuer: 'Apple', year: '2024' },
    { title: 'Regeneron ISEF — Grand Award Winner', issuer: 'Society for Science', year: '2024' },
    { title: 'WWDC23 Swift Student Challenge — Winner', issuer: 'Apple', year: '2023' },
    { title: 'Intel® AI Global Impact Festival — Country Winner', issuer: 'Intel', year: '2023' },
    { title: 'AIS Jump Hackathon Regional Bootcamp Pitching — 1st Runner-up', issuer: 'AIS', year: '' },
  ]);

  await insertMany('leadership', [
    {
      role: 'Huawei Cloud Student Developer Ambassador', organization: 'Huawei Cloud', start_date: 'Jan 2026', end_date: 'Present',
      description: 'Invited speaker at Girls in ICT Thailand 2026 (Huawei Thailand × ITU). Presented "Websites & AI in the Real World", covering networking, cloud computing and AI/ML fundamentals to encourage young people, especially young women, toward careers in ICT.',
    },
  ]);

  console.log('Seed complete');
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
