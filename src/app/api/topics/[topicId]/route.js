import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { topicId } = await params;
    
    // Import the topic-specific file
    const topicData = await import(`@/data/topics/basic/${topicId}.json`);
    
    return Response.json(topicData);
  } catch (error) {
    console.error('Error loading topic:', error);
    return Response.json(
      { error: 'Failed to load topic' },
      { status: 500 }
    );
  }
} 