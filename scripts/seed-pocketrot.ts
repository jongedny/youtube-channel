import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { lore, characters } from '../src/db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedPocketRot() {
    console.log('🎮 Seeding PocketRot universe...\n');

    try {
        // Seed Lore
        console.log('📖 Inserting lore entries...');
        await db.insert(lore).values([
            {
                title: 'The 1:18 Scale Incident',
                category: 'origin',
                sortOrder: 1,
                content: `In 1998, a failing global toy conglomerate attempted to create the world's first "Living Action Figures" to save their stock price. They combined experimental bio-plastic molds with a leaked, corrupted version of a Windows 98 compression codec.

The experiment was a catastrophic success. Instead of plastic toys, four real animals were "zipped" into a digital-physical hybrid state. They emerged exactly 4.20 inches tall, wearing permanent, unremovable "rendered" clothing, and possessed by the erratic logic of a corrupted hard drive.

They exist in the "Gaps" of our world—the spaces behind radiators, under car seats, and along sidewalk cracks. To them, our discarded junk is sacred tech, and our suburban environments are high-stakes RPG levels.`
            },
            {
                title: 'The Fixed Scale',
                category: 'physics',
                sortOrder: 1,
                content: 'They are hard-coded at 4.20 inches. No matter how much they eat, they do not grow; they simply become more "dense" and heavy.'
            },
            {
                title: 'The Respawn',
                category: 'physics',
                sortOrder: 2,
                content: 'If a character is "deleted" (trapped, squashed, or lost), they instantly pop back into existence inside Gort\'s hoodie with a low-res pixel effect.'
            },
            {
                title: 'The Render-Skin',
                category: 'physics',
                sortOrder: 3,
                content: 'Their clothes are part of their physical code. If an item is damaged, it "re-renders" overnight.'
            },
            {
                title: 'Pocket Artifacts',
                category: 'physics',
                sortOrder: 4,
                content: 'Each character is magnetically drawn to a specific piece of "Pocket Rot"—human debris that grants them perceived "powers" or status.'
            },
            {
                title: 'Camera Angle',
                category: 'aesthetic',
                sortOrder: 1,
                content: 'Always at ground level. Humans should only be seen as "The Unrendered"—giant, blurry boots or towering shadows.'
            },
            {
                title: 'Sound Design',
                category: 'aesthetic',
                sortOrder: 2,
                content: 'A mix of nature sounds and digital artifacts (dial-up tones, static purring, microwave beeps).'
            },
            {
                title: 'The Logic',
                category: 'aesthetic',
                sortOrder: 3,
                content: 'Every video should feature a "Mundane Mission" treated with world-ending seriousness (e.g., crossing a puddle, defending a discarded French fry, or "hacking" a TV remote).'
            }
        ]);
        console.log('✅ Lore entries inserted\n');

        // Seed the 4 Original Characters
        console.log('🦝 Inserting original characters...');
        await db.insert(characters).values([
            {
                name: 'Scraps Caps-Lock',
                species: 'Raccoon',
                pocketArtifact: 'Faded Receipt',
                roleAndVibe: 'The Foreman. Wears the receipt as a cape. High-energy, speaks in "All Caps," and believes he is managing a massive, invisible construction project.',
                isOriginal: true,
                generatedBy: 'manual'
            },
            {
                name: 'Gort Short-Sport',
                species: 'Capybara',
                pocketArtifact: 'Linty Jellybean',
                roleAndVibe: 'The Pilot. Carries the bean in a gum-wrapper fanny pack as a "Power Cell." Stoic, stares through the 4th wall, and drives the RC Monster Truck.',
                isOriginal: true,
                generatedBy: 'manual'
            },
            {
                name: 'Bubbles Rubbles',
                species: 'Axolotl',
                pocketArtifact: 'Tangled Earphones',
                roleAndVibe: 'The Wildcard. Uses wires as a reality anchor. Clips through solid objects, moves at erratic frame rates, and is obsessed with "80s fitness."',
                isOriginal: true,
                generatedBy: 'manual'
            },
            {
                name: 'Shelldon Swell-Don',
                species: 'Turtle',
                pocketArtifact: 'Shiny Penny',
                roleAndVibe: 'The Don. His penny is mounted to his shell like a badge of office. He is the slow-moving "Authority" who enforces nonsensical sidewalk regulations.',
                isOriginal: true,
                generatedBy: 'manual'
            }
        ]);
        console.log('✅ Original characters inserted\n');

        console.log('🎉 PocketRot universe seeded successfully!');
        console.log('📊 Summary:');
        console.log('   - 8 lore entries');
        console.log('   - 4 original characters (Scraps, Gort, Bubbles, Shelldon)');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

seedPocketRot();
