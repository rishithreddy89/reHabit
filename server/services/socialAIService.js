import OpenAI from 'openai';

// Only initialize OpenAI if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Analyze post content and determine sentiment, tags, and support needs
 */
export async function analyzePost(content, postType, userHabits = []) {
  try {
    if (!openai) {
      // Return default values if OpenAI is not configured
      return {
        sentiment: 'neutral',
        tags: ['habit', 'progress'],
        suggestedSupport: 'Keep going!',
        needsSupport: false,
        celebrationLevel: 5
      };
    }
    
    const prompt = `Analyze this habit tracking social post:

Post Type: ${postType}
Content: "${content}"
User's Habits: ${userHabits.join(', ')}

Provide analysis in JSON format:
{
  "sentiment": "positive|neutral|struggling|celebrating",
  "tags": ["tag1", "tag2", "tag3"],
  "suggestedSupport": "brief supportive message or advice",
  "needsSupport": true/false,
  "celebrationLevel": 0-10
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error('Error analyzing post:', error);
    return {
      sentiment: 'neutral',
      tags: [],
      suggestedSupport: '',
      needsSupport: false,
      celebrationLevel: 5
    };
  }
}

/**
 * Generate AI supportive comment
 */
export async function generateSupportiveComment(postContent, postSentiment, userProgress) {
  try {
    if (!openai) {
      return "Great work! Keep up the momentum! 🔥";
    }
    
    const prompt = `Generate a warm, authentic, and motivational comment for this habit tracking post:

Post: "${postContent}"
Sentiment: ${postSentiment}
User Progress: ${userProgress}

Write a brief (1-2 sentences) supportive comment that:
- Feels genuine and human
- Acknowledges their effort
- Encourages them to continue
- Uses encouraging emojis appropriately (🔥, 💪, ✨, 🎉, 👏)

Just return the comment text, nothing else.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 100
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating comment:', error);
    return "Great work! Keep up the momentum! 🔥";
  }
}

/**
 * Match users for accountability partnerships based on habits and personality
 */
export async function findAccountabilityMatch(user, allUsers) {
  try {
    if (!openai) {
      return [];
    }
    
    const userSummary = {
      habits: user.habits || [],
      personality: user.personalityType || 'unknown',
      goals: user.goals || [],
      activityLevel: user.stats?.weeklyCompletionRate || 0
    };

    const candidateSummaries = allUsers.map(u => ({
      id: u._id.toString(),
      habits: u.habits || [],
      personality: u.personalityType || 'unknown',
      activityLevel: u.stats?.weeklyCompletionRate || 0
    }));

    const prompt = `Find the best accountability partner match for this user:

User Profile:
- Habits: ${userSummary.habits.join(', ')}
- Personality: ${userSummary.personality}
- Activity Level: ${userSummary.activityLevel}%

Candidates:
${candidateSummaries.map((c, i) => `${i + 1}. ID: ${c.id}, Habits: ${c.habits.join(', ')}, Personality: ${c.personality}, Activity: ${c.activityLevel}%`).join('\n')}

Return JSON with top 3 matches:
{
  "matches": [
    {
      "userId": "candidate_id",
      "matchScore": 0-100,
      "reasons": ["reason1", "reason2"]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.matches || [];
  } catch (error) {
    console.error('Error finding accountability match:', error);
    return [];
  }
}

/**
 * Recommend communities based on user profile
 */
export async function recommendCommunities(user, availableCommunities) {
  try {
    if (!openai) {
      return [];
    }
    
    const userProfile = {
      habits: user.habits || [],
      interests: user.interests || [],
      goals: user.goals || [],
      level: user.level || 1,
      personality: user.personalityType || 'unknown'
    };

    const communityProfiles = availableCommunities.map(c => ({
      id: c._id.toString(),
      name: c.name,
      category: c.category,
      description: c.description,
      memberCount: c.memberCount,
      focusAreas: c.focusAreas || []
    }));

    const prompt = `Recommend the best communities for this user:

User Profile:
- Habits: ${userProfile.habits.join(', ')}
- Interests: ${userProfile.interests.join(', ')}
- Level: ${userProfile.level}
- Personality: ${userProfile.personality}

Available Communities:
${communityProfiles.map((c, i) => `${i + 1}. ${c.name} (${c.category}) - ${c.description} - ${c.memberCount} members`).join('\n')}

Return JSON with top 5 recommendations:
{
  "recommendations": [
    {
      "communityId": "id",
      "matchScore": 0-100,
      "reasons": ["reason1", "reason2", "reason3"],
      "matchFactors": {
        "habitSimilarity": 0-100,
        "goalAlignment": 0-100,
        "personalityMatch": 0-100
      }
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.recommendations || [];
  } catch (error) {
    console.error('Error recommending communities:', error);
    return [];
  }
}

/**
 * Group users by personality type for micro support circles
 */
export async function createMicroSupportCircle(users, maxSize = 5) {
  try {
    if (!openai) {
      return [];
    }
    
    const userProfiles = users.map(u => ({
      id: u._id.toString(),
      personality: u.personalityType || 'unknown',
      habits: u.habits || [],
      experienceLevel: u.level || 1,
      activityLevel: u.stats?.weeklyCompletionRate || 0
    }));

    const prompt = `Create optimal micro support circles (max ${maxSize} people each) from these users:

${userProfiles.map((u, i) => `${i + 1}. ID: ${u.id}, Personality: ${u.personality}, Level: ${u.experienceLevel}, Activity: ${u.activityLevel}%`).join('\n')}

Group them by:
1. Similar personality types
2. Compatible activity levels
3. Shared habit interests
4. Balanced experience levels (mix of beginners and experienced)

Return JSON:
{
  "circles": [
    {
      "name": "Circle name based on common trait",
      "userIds": ["id1", "id2", "id3"],
      "focusArea": "What this circle will focus on",
      "compatibilityScore": 0-100
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.circles || [];
  } catch (error) {
    console.error('Error creating micro support circles:', error);
    return [];
  }
}

/**
 * Suggest trending challenges based on community activity
 */
export async function suggestTrendingChallenges(communityPosts, userHabits) {
  try {
    if (!openai) {
      return [];
    }
    
    const trendingTopics = communityPosts.map(p => ({
      content: p.content.substring(0, 100),
      tags: p.aiTags,
      engagement: p.likeCount + p.commentCount
    }));

    const prompt = `Based on trending community activity, suggest 3 challenges:

User's Current Habits: ${userHabits.join(', ')}

Trending Topics:
${trendingTopics.map((t, i) => `${i + 1}. Tags: ${t.tags.join(', ')}, Engagement: ${t.engagement}`).join('\n')}

Return JSON:
{
  "challenges": [
    {
      "title": "Challenge name",
      "description": "Brief description",
      "duration": "days",
      "difficulty": "easy|medium|hard",
      "category": "category",
      "whyRelevant": "Why this fits the user"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.challenges || [];
  } catch (error) {
    console.error('Error suggesting challenges:', error);
    return [];
  }
}

/**
 * Recommend mentors based on user behavior and needs
 */
export async function recommendMentors(user, availableMentors) {
  try {
    if (!openai) {
      return [];
    }
    
    const userNeeds = {
      habits: user.habits || [],
      struggles: user.recentStruggles || [],
      goals: user.goals || [],
      completionRate: user.stats?.weeklyCompletionRate || 0
    };

    const mentorProfiles = availableMentors.map(m => ({
      id: m._id.toString(),
      name: m.name,
      specialization: m.mentorProfile?.specialization || [],
      experience: m.mentorProfile?.experience || 'beginner',
      rating: m.mentorProfile?.avgRating || 0,
      successRate: m.mentorProfile?.successRate || 0
    }));

    const prompt = `Recommend the best mentors for this user:

User Profile:
- Habits: ${userNeeds.habits.join(', ')}
- Completion Rate: ${userNeeds.completionRate}%
- Goals: ${userNeeds.goals.join(', ')}

Available Mentors:
${mentorProfiles.map((m, i) => `${i + 1}. ${m.name} - Specialization: ${m.specialization.join(', ')}, Rating: ${m.rating}/5`).join('\n')}

Return JSON with top 3 mentor recommendations:
{
  "recommendations": [
    {
      "mentorId": "id",
      "matchScore": 0-100,
      "reasons": ["reason1", "reason2"],
      "expectedValue": "What user will gain"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 600
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.recommendations || [];
  } catch (error) {
    console.error('Error recommending mentors:', error);
    return [];
  }
}

export default {
  analyzePost,
  generateSupportiveComment,
  findAccountabilityMatch,
  recommendCommunities,
  createMicroSupportCircle,
  suggestTrendingChallenges,
  recommendMentors
};
