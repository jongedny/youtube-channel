import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the lore context for AI prompts
export async function getLoreContext(): Promise<string> {
    const { db } = await import('../db');
    const { lore: loreTable } = await import('../db/schema');
    const { sql } = await import('drizzle-orm');

    const loreEntries = await db.select().from(loreTable).orderBy(sql`category, sort_order`);

    let context = `# PocketRot Universe - Core Lore\n\n`;
    context += `**Tagline:** Small Scale. Big Glitch. Pure Rot.\n\n`;

    // Group by category
    const categories = {
        origin: 'THE ORIGIN',
        physics: 'THE PHYSICS OF ROT',
        aesthetic: 'VIDEO AESTHETIC GUIDELINES'
    };

    for (const [key, title] of Object.entries(categories)) {
        const entries = loreEntries.filter(e => e.category === key);
        if (entries.length > 0) {
            context += `## ${title}\n\n`;
            entries.forEach(entry => {
                context += `**${entry.title}:** ${entry.content}\n\n`;
            });
        }
    }

    return context;
}

// Get existing characters for context
export async function getCharactersContext(): Promise<string> {
    const { db } = await import('../db');
    const { characters: charactersTable } = await import('../db/schema');

    const characters = await db.select().from(charactersTable);

    let context = `## Existing Characters\n\n`;
    characters.forEach(char => {
        context += `- **${char.name}** (${char.species})\n`;
        context += `  - Pocket Artifact: ${char.pocketArtifact}\n`;
        context += `  - Role: ${char.roleAndVibe}\n`;
        if (char.backstory) {
            context += `  - Backstory: ${char.backstory}\n`;
        }
        context += `\n`;
    });

    return context;
}

// Generate a new character using Gemini
export async function generateCharacter() {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const loreContext = await getLoreContext();
    const charactersContext = await getCharactersContext();

    const prompt = `${loreContext}\n${charactersContext}

You are creating a NEW character for the PocketRot universe. This character should:
- Be a different animal species than the existing characters
- Have a unique "Pocket Artifact" (a piece of human debris/junk)
- Fit the glitchy, corrupted Windows 98 aesthetic
- Have a memorable name with alliteration or wordplay
- Have a distinct role and personality that complements but doesn't duplicate existing characters

Generate a character in this EXACT JSON format:
{
  "name": "Character Name Here",
  "species": "Animal species",
  "pocketArtifact": "The debris item",
  "roleAndVibe": "One sentence describing their role and personality",
  "backstory": "2-3 sentences about how they got corrupted and what makes them unique"
}

Be creative, weird, and stay true to the PocketRot aesthetic!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Gemini response');
    }

    const character = JSON.parse(jsonMatch[0]);
    return character;
}

// Generate a new scenario using Gemini
export async function generateScenario() {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const loreContext = await getLoreContext();
    const charactersContext = await getCharactersContext();

    // Get character IDs for selection
    const { db } = await import('../db');
    const { characters: charactersTable } = await import('../db/schema');
    const allCharacters = await db.select().from(charactersTable);

    const prompt = `${loreContext}\n${charactersContext}

Create a NEW scenario/scene for the PocketRot universe. The scenario should:
- Feature 2-4 characters from the existing roster
- Take place in a "Gap" location (behind radiator, under car seat, sidewalk crack, etc.)
- Involve a "Mundane Mission" treated with world-ending seriousness
- Be described in FEWER than 200 words
- Include specific character interactions and glitchy physics moments
- Be cinematic and ground-level (remember: they're 4.20 inches tall)

Available characters to choose from:
${allCharacters.map(c => `- ${c.name} (${c.species}) - ${c.roleAndVibe}`).join('\n')}

Generate a scenario in this EXACT JSON format:
{
  "title": "Catchy scenario title",
  "characterNames": ["Character Name 1", "Character Name 2"],
  "location": "Specific gap location",
  "mission": "The mundane task being treated seriously",
  "description": "Full scene description in under 200 words"
}

Make it weird, glitchy, and cinematic!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 Raw Gemini response:', text);

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error('❌ No JSON found in response:', text);
        throw new Error('Failed to extract JSON from Gemini response');
    }

    console.log('📦 Extracted JSON:', jsonMatch[0]);

    let scenarioData;
    try {
        scenarioData = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed scenario data:', scenarioData);
    } catch (error) {
        console.error('❌ JSON parse error:', error);
        console.error('❌ Failed to parse:', jsonMatch[0]);
        throw new Error('Failed to parse JSON from Gemini response');
    }

    // Validate required fields
    if (!scenarioData.characterNames || !Array.isArray(scenarioData.characterNames)) {
        console.error('❌ Invalid characterNames field:', scenarioData);
        throw new Error('Gemini response missing or invalid characterNames array');
    }

    // Map character names to IDs
    const characterIds = allCharacters
        .filter(c => scenarioData.characterNames.includes(c.name))
        .map(c => c.id);

    console.log('🎭 Mapped character IDs:', characterIds);

    if (characterIds.length === 0) {
        console.warn('⚠️ No matching characters found for:', scenarioData.characterNames);
    }

    return {
        title: scenarioData.title,
        description: scenarioData.description,
        characterIds: JSON.stringify(characterIds),
        location: scenarioData.location,
        mission: scenarioData.mission
    };
}
