import { db } from '../src/db';
import { images } from '../src/db/schema';

async function addImage() {
    try {
        const [newImage] = await db.insert(images).values({
            scenarioId: 1,
            url: '/generated-images/scenario-1.png',
            prompt: 'Operation Golden Rod scene',
            generatedBy: 'imagen-3',
        }).returning();

        console.log('✅ Image added:', newImage);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addImage();
