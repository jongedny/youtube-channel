#!/usr/bin/env node

/**
 * Script to generate an image for a scenario using AI
 * Usage: node scripts/generate-scenario-image.js <scenarioId>
 */

const { db } = require('../src/db/index.ts');
const { scenarios, characters, images } = require('../src/db/schema.ts');
const { eq, inArray } = require('drizzle-orm');

async function generateScenarioImage(scenarioId) {
    try {
        console.log(`🎨 Generating image for scenario ${scenarioId}...`);

        // Get the scenario
        const scenario = await db.query.scenarios.findFirst({
            where: eq(scenarios.id, parseInt(scenarioId)),
        });

        if (!scenario) {
            console.error('❌ Scenario not found');
            process.exit(1);
        }

        // Get the characters involved in this scenario
        const characterIds = JSON.parse(scenario.characterIds);
        const scenarioCharacters = await db.query.characters.findMany({
            where: inArray(characters.id, characterIds),
        });

        // Build a detailed prompt for image generation
        const characterDescriptions = scenarioCharacters
            .map(char => `${char.name} (${char.species}) - ${char.roleAndVibe}`)
            .join(', ');

        const imagePrompt = `Cinematic scene from PocketRot universe: ${scenario.title}

Setting: ${scenario.location}
Mission: ${scenario.mission}

Characters (all exactly 4.20 inches tall): ${characterDescriptions}

${scenario.description}

Art style: Dramatic cinematic composition with a slightly surreal, VHS-tape aesthetic. Vibrant, saturated colors with subtle glitch effects. Show the extreme scale difference - these tiny characters in a massive human world. The scene should feel epic and dramatic despite the mundane mission. Photorealistic but with intentional glitch artifacts and analog video distortion.`;

        console.log('📝 Image prompt:', imagePrompt);
        console.log('\n✅ Prompt generated successfully!');
        console.log('\nTo generate the actual image, you would need to:');
        console.log('1. Use an image generation API (Imagen, DALL-E, Stable Diffusion)');
        console.log('2. Save the generated image to public/generated-images/');
        console.log('3. Update the database with the image URL');

        // Output the prompt so it can be used
        return {
            scenarioId,
            prompt: imagePrompt,
            scenario: scenario.title
        };
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    const scenarioId = process.argv[2];
    if (!scenarioId) {
        console.error('Usage: node scripts/generate-scenario-image.js <scenarioId>');
        process.exit(1);
    }
    generateScenarioImage(scenarioId).then(result => {
        console.log('\n📋 Result:', JSON.stringify(result, null, 2));
        process.exit(0);
    });
}

module.exports = { generateScenarioImage };
