const Community = require('../models/Community');

exports.createCommunity = async (req, res) => {
  try {
    const { name, description, category, isPublic, rules } = req.body;
    
    const community = await Community.create({
      name,
      description,
      category,
      creatorId: req.user._id,
      members: [req.user._id],
      memberCount: 1,
      isPublic,
      rules
    });

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ isActive: true, isPublic: true })
      .populate('creatorId', 'name avatar')
      .sort({ memberCount: -1 });
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creatorId', 'name avatar')
      .populate('members', 'name avatar');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    community.members.push(req.user._id);
    community.memberCount += 1;
    await community.save();

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    community.members = community.members.filter(m => !m.equals(req.user._id));
    community.memberCount -= 1;
    await community.save();

    res.json({ message: 'Left community successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
