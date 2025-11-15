const Challenge = require('../models/Challenge');

exports.createChallenge = async (req, res) => {
  try {
    const { title, description, category, duration, startDate, communityId, difficulty } = req.body;
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    const challenge = await Challenge.create({
      title,
      description,
      category,
      creatorId: req.user._id,
      communityId,
      duration,
      startDate,
      endDate,
      difficulty
    });

    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ isActive: true })
      .populate('creatorId', 'name avatar')
      .sort({ startDate: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creatorId', 'name avatar')
      .populate('participants.userId', 'name avatar');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const alreadyJoined = challenge.participants.some(p => p.userId.equals(req.user._id));
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    challenge.participants.push({ userId: req.user._id });
    challenge.participantCount += 1;
    await challenge.save();

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const participant = challenge.participants.find(p => p.userId.equals(req.user._id));
    if (!participant) {
      return res.status(400).json({ message: 'Not a participant' });
    }

    participant.progress = progress;
    if (progress >= 100) {
      participant.completed = true;
    }
    
    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
