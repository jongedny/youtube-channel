import { pgTable, serial, varchar, timestamp, text, integer, boolean } from 'drizzle-orm/pg-core';

// Users table (existing authentication)
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Lore table - stores the foundational PocketRot universe lore
export const lore = pgTable('lore', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    category: varchar('category', { length: 100 }).notNull(), // e.g., "origin", "physics", "aesthetic"
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Characters table - stores both seed characters and AI-generated ones
export const characters = pgTable('characters', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    species: varchar('species', { length: 100 }).notNull(), // e.g., "Raccoon", "Capybara"
    pocketArtifact: varchar('pocket_artifact', { length: 255 }).notNull(),
    roleAndVibe: text('role_and_vibe').notNull(),
    backstory: text('backstory'), // AI-generated extended backstory
    isOriginal: boolean('is_original').default(false).notNull(), // true for the 4 seed characters
    generatedBy: varchar('generated_by', { length: 50 }).default('manual').notNull(), // "manual" or "gemini"
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Scenarios table - stores AI-generated scenarios
export const scenarios = pgTable('scenarios', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(), // max 200 words
    characterIds: text('character_ids').notNull(), // JSON array of character IDs involved
    location: varchar('location', { length: 255 }), // e.g., "Behind radiator", "Under car seat"
    mission: text('mission'), // The "mundane mission" being treated seriously
    generatedBy: varchar('generated_by', { length: 50 }).default('gemini').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Images table - for future AI-generated images
export const images = pgTable('images', {
    id: serial('id').primaryKey(),
    scenarioId: integer('scenario_id').references(() => scenarios.id),
    characterId: integer('character_id').references(() => characters.id),
    url: varchar('url', { length: 500 }).notNull(),
    prompt: text('prompt'),
    generatedBy: varchar('generated_by', { length: 50 }).default('gemini').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Videos table - for future AI-generated videos
export const videos = pgTable('videos', {
    id: serial('id').primaryKey(),
    scenarioId: integer('scenario_id').references(() => scenarios.id),
    url: varchar('url', { length: 500 }).notNull(),
    prompt: text('prompt'),
    duration: integer('duration'), // in seconds
    generatedBy: varchar('generated_by', { length: 50 }).default('gemini').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
