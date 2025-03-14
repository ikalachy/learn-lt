export class AIProgressManager {
  static saveProgress(userId, topic, score) {
    const progress = this.getProgress(userId);
    
    if (!progress[topic]) {
      progress[topic] = {
        completedDialogues: 0,
        lastDialogueDate: null,
        averageScore: 0
      };
    }

    const topicProgress = progress[topic];
    topicProgress.completedDialogues += 1;
    topicProgress.lastDialogueDate = new Date().toISOString();
    
    // Update average score
    const totalScore = topicProgress.averageScore * (topicProgress.completedDialogues - 1);
    topicProgress.averageScore = (totalScore + score) / topicProgress.completedDialogues;

    localStorage.setItem(`ai_progress_${userId}`, JSON.stringify(progress));
  }

  static getProgress(userId) {
    const storedProgress = localStorage.getItem(`ai_progress_${userId}`);
    return storedProgress ? JSON.parse(storedProgress) : {};
  }

  static getTopicProgress(userId, topic) {
    const progress = this.getProgress(userId);
    return progress[topic] || null;
  }

  static calculateScore(summary) {
    let score = 0;
    
    // Check for key elements in the summary
    if (summary.includes('Key Points:')) score += 1;
    if (summary.includes('Grammar Notes:')) score += 1;
    if (summary.includes('Vocabulary:')) score += 1;
    if (summary.includes('Practice Suggestions:')) score += 1;
    
    return score;
  }
} 