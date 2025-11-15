import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Community from '../models/Community.js';
import Habit from '../models/Habit.js';
import { analyzePost, generateSupportiveComment } from '../services/socialAIService.js';

// Create a new post
const createPost = async (req, res) => {
  try {
    const { communityId, habitId, content, images, postType } = req.body;

    if (!content || !communityId) {
      return res.status(400).json({ message: 'Content and community are required' });
    }

    // Get user habits for AI analysis
    const userHabits = await Habit.find({ userId: req.user._id, isActive: true })
      .select('title')
      .lean();
    const habitTitles = userHabits.map(h => h.title);

    // AI Analysis of post
    const aiAnalysis = await analyzePost(content, postType || 'general', habitTitles);

    const post = await Post.create({
      userId: req.user._id,
      communityId,
      habitId,
      content,
      images: images || [],
      postType: postType || 'general',
      aiSentiment: aiAnalysis.sentiment,
      aiTags: aiAnalysis.tags || [],
      aiSuggestedSupport: aiAnalysis.suggestedSupport || ''
    });

    // Populate user details
    await post.populate('userId', 'name avatar level');

    // Update community stats
    await Community.findByIdAndUpdate(communityId, {
      $inc: { postCount: 1 }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get community feed
const getCommunityFeed = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 20, sort = 'recent' } = req.query;

    let sortOption = { createdAt: -1 }; // Default: most recent
    if (sort === 'popular') sortOption = { likeCount: -1, commentCount: -1 };
    if (sort === 'trending') sortOption = { likeCount: -1, createdAt: -1 };

    const posts = await Post.find({ 
      communityId, 
      isApproved: true,
      isPublic: true
    })
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name avatar level bio')
      .populate('habitId', 'title category')
      .populate({
        path: 'reactions.userId',
        select: 'name avatar'
      })
      .lean();

    const totalPosts = await Post.countDocuments({ communityId, isApproved: true });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    });
  } catch (error) {
    console.error('Get community feed error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('communityId', 'name category')
      .populate('habitId', 'title')
      .lean();

    const totalPosts = await Post.countDocuments({ userId });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: error.message });
  }
};

// React to a post
const reactToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reactionType } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reacted
    const existingReactionIndex = post.reactions.findIndex(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (existingReactionIndex > -1) {
      // Update existing reaction
      post.reactions[existingReactionIndex].type = reactionType;
    } else {
      // Add new reaction
      post.reactions.push({
        userId: req.user._id,
        type: reactionType
      });
    }

    // Also add to likes array if not exists
    if (!post.likes.includes(req.user._id)) {
      post.likes.push(req.user._id);
      post.likeCount += 1;
    }

    await post.save();

    res.json({ 
      message: 'Reaction added', 
      reactions: post.reactions,
      likeCount: post.likeCount
    });
  } catch (error) {
    console.error('React to post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove reaction
const removeReaction = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove from reactions
    post.reactions = post.reactions.filter(
      r => r.userId.toString() !== req.user._id.toString()
    );

    // Remove from likes
    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
      post.likeCount = Math.max(0, post.likeCount - 1);
    }

    await post.save();

    res.json({ message: 'Reaction removed', likeCount: post.likeCount });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add comment to post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      postId,
      userId: req.user._id,
      content,
      parentCommentId: parentCommentId || null
    });

    // Update post comment count
    post.commentCount += 1;
    await post.save();

    // Populate user details
    await comment.populate('userId', 'name avatar level');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get post comments
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const comments = await Comment.find({ 
      postId,
      isApproved: true,
      parentCommentId: null // Only top-level comments
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name avatar level')
      .lean();

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ 
          parentCommentId: comment._id,
          isApproved: true
        })
          .sort({ createdAt: 1 })
          .populate('userId', 'name avatar level')
          .lean();
        
        return { ...comment, replies };
      })
    );

    const totalComments = await Comment.countDocuments({ postId, isApproved: true });

    res.json({
      comments: commentsWithReplies,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Like a comment
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already liked' });
    }

    comment.likes.push(req.user._id);
    comment.likeCount += 1;
    await comment.save();

    res.json({ message: 'Comment liked', likeCount: comment.likeCount });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate AI supportive comment
const generateAIComment = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('userId', 'stats level')
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userProgress = `Level ${post.userId.level}, ${post.userId.stats?.totalCompletions || 0} completions`;
    
    const aiComment = await generateSupportiveComment(
      post.content,
      post.aiSentiment,
      userProgress
    );

    res.json({ suggestedComment: aiComment });
  } catch (error) {
    console.error('Generate AI comment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(postId);
    
    // Delete associated comments
    await Comment.deleteMany({ postId });

    // Update community post count
    await Community.findByIdAndUpdate(post.communityId, {
      $inc: { postCount: -1 }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get personalized feed (from all joined communities)
const getPersonalizedFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get user's communities
    const user = await User.findById(req.user._id).select('communities').lean();
    const communityIds = user.communities || [];

    if (communityIds.length === 0) {
      return res.json({ posts: [], currentPage: 1, totalPages: 0, totalPosts: 0 });
    }

    const posts = await Post.find({ 
      communityId: { $in: communityIds },
      isApproved: true,
      isPublic: true
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name avatar level bio')
      .populate('communityId', 'name category')
      .populate('habitId', 'title category')
      .lean();

    const totalPosts = await Post.countDocuments({ 
      communityId: { $in: communityIds },
      isApproved: true 
    });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    });
  } catch (error) {
    console.error('Get personalized feed error:', error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  createPost,
  getCommunityFeed,
  getUserPosts,
  reactToPost,
  removeReaction,
  addComment,
  getPostComments,
  likeComment,
  generateAIComment,
  deletePost,
  getPersonalizedFeed
};
