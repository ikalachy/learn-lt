import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

const topics = [
  "Travel and Tourism",
  "Business and Work",
  "Daily Life",
  "Culture and Traditions",
  "Food and Dining",
  "Education and Learning",
  "Hobbies and Leisure",
  "Health and Wellness",
  "Technology and Innovation",
  "Environment and Nature",
];

export default function TopicSelector({ topicProgress, onTopicSelect }) {
  return (
    <div>
      <h2 className="text-xl font-medium mb-4 text-gray-700">
        Choose a Topic
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topics.map((topic) => {
          const progress = topicProgress[topic];
          return (
            <button
              key={topic}
              onClick={() => onTopicSelect(topic)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative text-left group"
            >
              <span className="text-gray-700 text-sm font-medium group-hover:text-blue-600 transition-colors">
                {topic}
              </span>
              {progress && (
                <div className="absolute top-1.5 right-1.5 text-xs text-gray-400">
                  {progress.completedDialogues} completed
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 