import MicroStory from '../models/MicroStory.js';

const createMicroStory = async (req, res) => {
  try {
    const { title, text, studioId } = req.body;
    
    const story = await MicroStory.create({
      title,
      text,
      author: req.user.name || 'Anonymous',
      authorId: req.user._id,
      studioId: studioId || null,
      likes: 0,
      likedBy: [],
      comments: []
    });

    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMicroStories = async (req, res) => {
  try {
    const { studioId } = req.query;
    const filter = studioId ? { studioId } : {};
    
    const stories = await MicroStory.find(filter)
      .populate('authorId', 'name avatar')
      .populate('studioId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likeMicroStory = async (req, res) => {
  try {
    const story = await MicroStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const alreadyLiked = story.likedBy.some(id => id.equals(req.user._id));
    
    if (alreadyLiked) {
      // Unlike
      story.likedBy = story.likedBy.filter(id => !id.equals(req.user._id));
      story.likes = Math.max(0, story.likes - 1);
    } else {
      // Like
      story.likedBy.push(req.user._id);
      story.likes += 1;
    }
    
    await story.save();
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const story = await MicroStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    story.comments.push({
      text,
      author: req.user.name || 'Anonymous',
      authorId: req.user._id,
      at: new Date()
    });
    
    await story.save();
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createMicroStory,
  getMicroStories,
  likeStory: likeMicroStory,
  addComment
};
