import User from '../models/User.js';
import Community from '../models/Community.js';
import CommunityRecommendation from '../models/CommunityRecommendation.js';
import AccountabilityPartner from '../models/AccountabilityPartner.js';
import Habit from '../models/Habit.js';
import Post from '../models/Post.js';
import {
  recommendCommunities,
  findAccountabilityMatch,
  createMicroSupportCircle,
  suggestTrendingChallenges,
  recommendMentors
} from '../services/socialAIService.js';

// Get community recommendations for user
const getCommunityRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('communities')
      .lean();

    // Get user's habits
    const userHabits = await Habit.find({ userId: req.user._id, isActive: true })
      .select('title category')
      .lean();

    // Prepare user data
    const userData = {
      ...user,
      habits: userHabits.map(h => h.title),
      interests: userHabits.map(h => h.category),
      goals: user.goals || []
    };

    // Get communities user hasn't joined
    const joinedCommunityIds = user.communities?.map(c => c._id.toString()) || [];
    const availableCommunities = await Community.find({
      _id: { $nin: joinedCommunityIds },
      isActive: true,
      isPublic: true
    }).lean();

    if (availableCommunities.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Get AI recommendations
    const aiRecommendations = await recommendCommunities(userData, availableCommunities);

    // Save recommendations to database
    const savedRecommendations = await Promise.all(
      aiRecommendations.map(async (rec) => {
        const existing = await CommunityRecommendation.findOne({
          userId: req.user._id,
          communityId: rec.communityId
        });

        if (existing) {
          return existing;
        }

        return await CommunityRecommendation.create({
          userId: req.user._id,
          communityId: rec.communityId,
          matchScore: rec.matchScore,
          reasons: rec.reasons,
          matchFactors: rec.matchFactors
        });
      })
    );

    // Populate community details
    const populatedRecommendations = await CommunityRecommendation.find({
      _id: { $in: savedRecommendations.map(r => r._id) }
    })
      .populate('communityId')
      .sort({ matchScore: -1 })
      .lean();

    res.json({ recommendations: populatedRecommendations });
  } catch (error) {
    console.error('Get community recommendations error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get accountability partner matches
const getAccountabilityMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('communities')
      .lean();

    // Get user's habits
    const userHabits = await Habit.find({ userId: req.user._id, isActive: true })
      .select('title')
      .lean();

    // Get potential partners from same communities
    const communityIds = user.communities?.map(c => c._id) || [];
    const potentialPartners = await User.find({
      _id: { $ne: req.user._id },
      communities: { $in: communityIds },
      role: 'user'
    })
      .select('name avatar personalityType stats')
      .limit(50)
      .lean();

    // Get their habits
    const partnersWithHabits = await Promise.all(
      potentialPartners.map(async (partner) => {
        const habits = await Habit.find({ userId: partner._id, isActive: true })
          .select('title')
          .lean();
        return {
          ...partner,
          habits: habits.map(h => h.title)
        };
      })
    );

    // Prepare user data
    const userData = {
      ...user,
      habits: userHabits.map(h => h.title)
    };

    // Get AI matches
    const aiMatches = await findAccountabilityMatch(userData, partnersWithHabits);

    // Save matches
    const savedMatches = await Promise.all(
      aiMatches.slice(0, 5).map(async (match) => {
        const existing = await AccountabilityPartner.findOne({
          $or: [
            { user1Id: req.user._id, user2Id: match.userId },
            { user1Id: match.userId, user2Id: req.user._id }
          ]
        });

        if (existing) {
          return existing;
        }

        // Find shared habits
        const partnerHabits = await Habit.find({ 
          userId: match.userId, 
          isActive: true 
        }).select('title').lean();

        const shared = userHabits.filter(uh => 
          partnerHabits.some(ph => ph.title.toLowerCase() === uh.title.toLowerCase())
        ).map(h => h._id);

        return await AccountabilityPartner.create({
          user1Id: req.user._id,
          user2Id: match.userId,
          matchScore: match.matchScore,
          matchReasons: match.reasons,
          sharedHabits: shared,
          status: 'pending'
        });
      })
    );

    // Populate partner details
    const populatedMatches = await AccountabilityPartner.find({
      _id: { $in: savedMatches.map(m => m._id) }
    })
      .populate('user2Id', 'name avatar level bio stats')
      .sort({ matchScore: -1 })
      .lean();

    res.json({ matches: populatedMatches });
  } catch (error) {
    console.error('Get accountability matches error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Accept accountability partner
const acceptAccountabilityPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const partnership = await AccountabilityPartner.findById(partnerId);
    if (!partnership) {
      return res.status(404).json({ message: 'Partnership not found' });
    }

    // Check if user is part of this partnership
    if (partnership.user2Id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    partnership.status = 'active';
    partnership.activeSince = new Date();
    await partnership.save();

    res.json({ message: 'Accountability partner accepted', partnership });
  } catch (error) {
    console.error('Accept partner error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get micro support circles
const getMicroSupportCircles = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Get community members
    const community = await Community.findById(communityId)
      .populate('members', 'name personalityType stats level')
      .lean();

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Get habits for each member
    const membersWithHabits = await Promise.all(
      community.members.map(async (member) => {
        const habits = await Habit.find({ userId: member._id, isActive: true })
          .select('title')
          .lean();
        return {
          ...member,
          habits: habits.map(h => h.title)
        };
      })
    );

    // Create AI-powered circles
    const circles = await createMicroSupportCircle(membersWithHabits, 5);

    res.json({ circles });
  } catch (error) {
    console.error('Get micro support circles error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get trending challenges
const getTrendingChallenges = async (req, res) => {
  try {
    // Get user's habits
    const userHabits = await Habit.find({ userId: req.user._id, isActive: true })
      .select('title')
      .lean();

    // Get recent popular posts
    const recentPosts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
      .sort({ likeCount: -1, commentCount: -1 })
      .limit(50)
      .lean();

    // Get AI challenge suggestions
    const challenges = await suggestTrendingChallenges(
      recentPosts,
      userHabits.map(h => h.title)
    );

    res.json({ challenges });
  } catch (error) {
    console.error('Get trending challenges error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get mentor recommendations
const getMentorRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();

    // Get user's habits
    const userHabits = await Habit.find({ userId: req.user._id, isActive: true })
      .select('title')
      .lean();

    // Get available mentors
    const mentors = await User.find({
      role: 'mentor',
      'mentorProfile.isVerified': true,
      'mentorProfile.currentClients': { $lt: 10 }
    })
      .select('name avatar mentorProfile')
      .limit(20)
      .lean();

    if (mentors.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Prepare user data
    const userData = {
      ...user,
      habits: userHabits.map(h => h.title),
      recentStruggles: [],
      goals: user.goals || []
    };

    // Get AI recommendations
    const recommendations = await recommendMentors(userData, mentors);

    res.json({ recommendations });
  } catch (error) {
    console.error('Get mentor recommendations error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Dismiss recommendation
const dismissRecommendation = async (req, res) => {
  try {
    const { recommendationId } = req.params;

    await CommunityRecommendation.findByIdAndUpdate(recommendationId, {
      dismissed: true
    });

    res.json({ message: 'Recommendation dismissed' });
  } catch (error) {
    console.error('Dismiss recommendation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark recommendation as viewed
const markRecommendationViewed = async (req, res) => {
  try {
    const { recommendationId } = req.params;

    await CommunityRecommendation.findByIdAndUpdate(recommendationId, {
      viewed: true
    });

    res.json({ message: 'Marked as viewed' });
  } catch (error) {
    console.error('Mark viewed error:', error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getCommunityRecommendations,
  getAccountabilityMatches,
  acceptAccountabilityPartner,
  getMicroSupportCircles,
  getTrendingChallenges,
  getMentorRecommendations,
  dismissRecommendation,
  markRecommendationViewed
};
