import Studio from '../models/Studio.js';

const createStudio = async (req, res) => {
  try {
    const { name, description, category, isPublic } = req.body;
    
    const studio = await Studio.create({
      name,
      description,
      category: category || 'general',
      creatorId: req.user._id,
      members: [req.user._id],
      memberCount: 1,
      isPublic: isPublic !== undefined ? isPublic : true,
      checkins: [],
      energy: 0,
      scoreboard: [{ userId: req.user._id, points: 0 }]
    });

    res.status(201).json(studio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudios = async (req, res) => {
  try {
    const studios = await Studio.find({ isPublic: true })
      .populate('creatorId', 'name avatar')
      .populate('members', 'name avatar level streak')
      .sort({ energy: -1, createdAt: -1 });
    
    console.log(`Found ${studios.length} studios`);
    res.json(studios);
  } catch (error) {
    console.error('Error fetching studios:', error);
    res.status(500).json({ message: error.message });
  }
};

const getStudio = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id)
      .populate('creatorId', 'name avatar')
      .populate('members', 'name avatar level streak')
      .populate('checkins.userId', 'name avatar')
      .populate('scoreboard.userId', 'name avatar level streak');
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio not found' });
    }
    
    studio.updateEnergy();
    await studio.save();
    
    res.json(studio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinStudio = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio not found' });
    }

    const alreadyJoined = studio.members.some(m => m.equals(req.user._id));
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this studio' });
    }

    studio.members.push(req.user._id);
    studio.memberCount = studio.members.length;
    studio.scoreboard.push({ userId: req.user._id, points: 0 });
    await studio.save();

    res.json(studio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkInStudio = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio not found' });
    }

    const isMember = studio.members.some(m => m.equals(req.user._id));
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to check in' });
    }

    studio.checkins.push({ userId: req.user._id, at: new Date() });
    studio.updateEnergy();
    
    // Add points to scoreboard
    const scoreEntry = studio.scoreboard.find(s => s.userId.equals(req.user._id));
    if (scoreEntry) {
      scoreEntry.points += 10;
    }
    
    await studio.save();

    res.json(studio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const leaveStudio = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    
    if (!studio) {
      return res.status(404).json({ message: 'Studio not found' });
    }

    studio.members = studio.members.filter(m => !m.equals(req.user._id));
    studio.memberCount = studio.members.length;
    studio.scoreboard = studio.scoreboard.filter(s => !s.userId.equals(req.user._id));
    
    await studio.save();

    res.json({ message: 'Left studio successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createStudio,
  getStudios,
  getStudio,
  joinStudio,
  checkInStudio,
  leaveStudio
};
