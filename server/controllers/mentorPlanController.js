import MentorPlan from '../models/MentorPlan.js';
import MentorSubscription from '../models/MentorSubscription.js';
import User from '../models/User.js';

// Get all available mentor plans
const getMentorPlans = async (req, res) => {
  try {
    const plans = await MentorPlan.find({ isActive: true }).sort({ price: 1 });
    
    // If no plans exist, create default plans
    if (plans.length === 0) {
      const defaultPlans = [
        {
          name: 'basic',
          displayName: 'Basic Plan',
          price: 29.99,
          duration: 30,
          maxMentees: 1,
          sessionsPerMonth: 4,
          responseTime: '48 hours',
          groupSessions: false,
          prioritySupport: false,
          customPlans: false,
          features: [
            '4 one-on-one sessions per month',
            'Email support within 48 hours',
            'Access to mentor resources',
            'Progress tracking dashboard',
            'Monthly goal setting session'
          ]
        },
        {
          name: 'duo',
          displayName: 'Duo Plan',
          price: 49.99,
          duration: 30,
          maxMentees: 2,
          sessionsPerMonth: 8,
          responseTime: '24 hours',
          groupSessions: true,
          prioritySupport: false,
          customPlans: false,
          features: [
            'Everything in Basic Plan',
            '8 sessions per month (4 per person)',
            'Share with a friend or family member',
            'Group accountability sessions',
            'Email support within 24 hours',
            'Weekly progress check-ins',
            'Shared habit tracking'
          ]
        },
        {
          name: 'family',
          displayName: 'Family Plan',
          price: 79.99,
          duration: 30,
          maxMentees: 5,
          sessionsPerMonth: 15,
          responseTime: '12 hours',
          groupSessions: true,
          prioritySupport: true,
          customPlans: true,
          features: [
            'Everything in Duo Plan',
            'Up to 5 family members',
            '15 sessions per month',
            'Priority email & chat support',
            'Custom family goal planning',
            'Monthly family wellness workshop',
            'Dedicated family success manager',
            'Flexible session scheduling'
          ]
        }
      ];
      
      const createdPlans = await MentorPlan.insertMany(defaultPlans);
      return res.json(createdPlans);
    }
    
    res.json(plans);
  } catch (error) {
    console.error('Error fetching mentor plans:', error);
    res.status(500).json({ message: error.message });
  }
};

// Subscribe to a mentor plan
const subscribeToPlan = async (req, res) => {
  try {
    const { mentorId, planId, additionalMembers } = req.body;
    const userId = req.user._id;

    // Validate mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Validate plan exists
    const plan = await MentorPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user already has an active subscription with this mentor
    const existingSubscription = await MentorSubscription.findOne({
      userId,
      mentorId,
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(409).json({ message: 'You already have an active subscription with this mentor' });
    }

    // Validate additional members for duo/family plans
    if (additionalMembers && additionalMembers.length > 0) {
      if (plan.name === 'basic') {
        return res.status(400).json({ message: 'Basic plan does not support additional members' });
      }
      if (additionalMembers.length >= plan.maxMentees) {
        return res.status(400).json({ message: `This plan supports up to ${plan.maxMentees} members` });
      }
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    // Create subscription
    const subscription = await MentorSubscription.create({
      userId,
      mentorId,
      planId,
      planType: plan.name,
      startDate,
      endDate,
      price: plan.price,
      sessionsTotal: plan.sessionsPerMonth,
      additionalMembers: additionalMembers || [],
      status: 'active', // In production, this would be 'pending' until payment confirmation
      paymentStatus: 'completed' // In production, this would be 'pending'
    });

    // Update mentor's client count
    await User.findByIdAndUpdate(mentorId, {
      $inc: { 'mentorProfile.currentClients': additionalMembers ? additionalMembers.length + 1 : 1 }
    });

    const populatedSubscription = await MentorSubscription.findById(subscription._id)
      .populate('planId')
      .populate('mentorId', 'name avatar bio mentorProfile')
      .populate('additionalMembers', 'name email avatar');

    res.status(201).json(populatedSubscription);
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's active subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    console.log('Fetching subscriptions for user:', req.user._id);
    
    // Fetch all subscriptions for debugging
    const allSubscriptions = await MentorSubscription.find({
      $or: [
        { userId: req.user._id },
        { additionalMembers: req.user._id }
      ]
    });
    console.log('Total subscriptions found (all statuses):', allSubscriptions.length);
    
    const subscriptions = await MentorSubscription.find({
      $or: [
        { userId: req.user._id },
        { additionalMembers: req.user._id }
      ]
    })
      .populate('planId')
      .populate('mentorId', 'name avatar bio mentorProfile')
      .populate('additionalMembers', 'name email avatar')
      .sort({ createdAt: -1 });

    console.log('Subscriptions being returned:', subscriptions.length);
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await MentorSubscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Only the subscription owner can cancel
    if (subscription.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this subscription' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    // Update mentor's client count
    const memberCount = (subscription.additionalMembers?.length || 0) + 1;
    await User.findByIdAndUpdate(subscription.mentorId, {
      $inc: { 'mentorProfile.currentClients': -memberCount }
    });

    res.json({ message: 'Subscription cancelled successfully', subscription });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: error.message });
  }
};

// Check if user has access to a mentor
const checkMentorAccess = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const subscription = await MentorSubscription.findOne({
      $or: [
        { userId: req.user._id },
        { additionalMembers: req.user._id }
      ],
      mentorId,
      status: 'active',
      endDate: { $gte: new Date() }
    }).populate('planId');

    if (!subscription) {
      return res.json({ hasAccess: false });
    }

    res.json({
      hasAccess: true,
      subscription: {
        planType: subscription.planType,
        sessionsRemaining: subscription.sessionsTotal - subscription.sessionsUsed,
        endDate: subscription.endDate,
        features: subscription.planId.features
      }
    });
  } catch (error) {
    console.error('Error checking mentor access:', error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getMentorPlans,
  subscribeToPlan,
  getUserSubscriptions,
  cancelSubscription,
  checkMentorAccess
};
