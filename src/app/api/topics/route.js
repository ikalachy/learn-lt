import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const topicsDir = path.join(process.cwd(), 'src/data/topics/basic');
    const topicFiles = fs.readdirSync(topicsDir).filter(file => file.endsWith('.json'));
    
    const topics = topicFiles.map(file => {
      const fileContent = fs.readFileSync(path.join(topicsDir, file), 'utf8');
      const topicData = JSON.parse(fileContent);
      const topicId = file.replace('.json', '');
      
      return {
        id: topicId,
        name: {
          en: topicId.charAt(0).toUpperCase() + topicId.slice(1).replace(/-/g, ' '),
          lt: topicId.charAt(0).toUpperCase() + topicId.slice(1).replace(/-/g, ' '),
        },
        description: {
          en: `Learn ${topicId.replace(/-/g, ' ')} related words and phrases`,
          lt: `Mokykitės žodžius ir frazes, susijusias su ${topicId.replace(/-/g, ' ')}`,
        },
        // phrases: topicData
      };
    });

    return Response.json(topics);
  } catch (error) {
    console.error('Error loading topics:', error);
    return Response.json({ error: 'Failed to load topics' }, { status: 500 });
  }
} 