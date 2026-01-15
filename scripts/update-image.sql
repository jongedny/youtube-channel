-- Update the image URL to point to the manually generated image
UPDATE images 
SET url = '/generated-images/scenario-1.png',
    "generatedBy" = 'imagen-3'
WHERE "scenarioId" = 1;
