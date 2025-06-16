const express = require('express');
const AgentFact = require('../models/AgentFact');
const { isAuthenticated } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

router.use(apiLimiter);

// API Documentation endpoint
router.get('/', (req, res) => {
  res.json({
    name: "List39 Agent Facts Registry API",
    version: "1.0.0",
    description: "Open agent identity infrastructure for the agentic web",
    endpoints: {
      public: {
        "GET /@{username}.json": "Get public agent facts in JSON format",
        "GET /@{username}": "Get public agent facts in HTML format"
      },
      authentication: {
        "GET /auth/google": "Initiate Google OAuth login",
        "GET /auth/google/callback": "Google OAuth callback",
        "GET /auth/logout": "Logout user",
        "GET /auth/user": "Get current user information"
      },
      agent_management: {
        "GET /api/agentfacts": "List user's agent facts (authenticated)",
        "POST /api/agentfacts": "Create new agent fact (authenticated)",
        "PUT /api/agentfacts/{id}": "Update agent fact (authenticated)",
        "DELETE /api/agentfacts/{id}": "Delete agent fact (authenticated)"
      }
    },
    documentation: "https://github.com/list39/list39",
    registry_protocol: {
      discovery_pattern: "https://list39.org/@{username}.json",
      content_type: "application/json",
      format: "Standardized agent metadata schema"
    }
  });
});

// @route   GET /api/agentfacts
// @desc    Get all user's agentfacts
// @access  Private
router.get('/agentfacts', isAuthenticated, async (req, res) => {
  try {
    const agentFacts = await AgentFact.find({ userId: req.user._id }).sort({ created_at: -1 });
    res.json({ success: true, data: agentFacts });
  } catch (error) {
    console.error('Error fetching agent facts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/agentfacts/:id
// @desc    Get single agentfact by ID
// @access  Private
router.get('/agentfacts/:id', isAuthenticated, async (req, res) => {
  try {
    const agentFact = await AgentFact.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!agentFact) {
      return res.status(404).json({ success: false, message: 'Agent fact not found' });
    }
    
    res.json({ success: true, data: agentFact });
  } catch (error) {
    console.error('Error fetching agent fact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/agentfacts
// @desc    Create new agentfact
// @access  Private
router.post('/agentfacts', isAuthenticated, async (req, res) => {
  try {
    const { username, agent_name, label, ...otherData } = req.body;
    
    // Check if username is already taken
    const existingAgent = await AgentFact.findOne({ username: username.toLowerCase() });
    if (existingAgent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is already taken' 
      });
    }
    
    // Create new agent fact
    const agentFact = new AgentFact({
      username: username.toLowerCase(),
      agent_name,
      label,
      userId: req.user._id,
      ...otherData,
      // Set default values for required nested objects
      provider: otherData.provider || { name: '', url: '', did: '' },
      endpoints: otherData.endpoints || { 
        static: [], 
        adaptive_resolver: { url: '', policies: [] } 
      },
      capabilities: otherData.capabilities || { 
        modalities: ['text'], 
        streaming: false, 
        batch: false,
        authentication: { methods: [], requiredScopes: [] }
      },
      skills: otherData.skills || [{
        id: 'chat',
        description: 'Basic chat functionality',
        inputModes: ['text'],
        outputModes: ['text'],
        supportedLanguages: ['en']
      }],
      evaluations: otherData.evaluations || {
        performanceScore: 0,
        availability90d: '',
        lastAudited: '',
        auditTrail: '',
        auditorID: ''
      },
      telemetry: otherData.telemetry || {
        enabled: false,
        retention: '1d',
        sampling: 0.1
      },
      certification: otherData.certification || {
        level: 'verified',
        issuer: 'NANDA',
        issuanceDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      }
    });
    
    await agentFact.save();
    res.status(201).json({ success: true, data: agentFact });
  } catch (error) {
    console.error('Error creating agent fact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/agentfacts/:id
// @desc    Update agentfact
// @access  Private
router.put('/agentfacts/:id', isAuthenticated, async (req, res) => {
  try {
    const { username, ...updateData } = req.body;
    
    // Find the agent fact
    const agentFact = await AgentFact.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!agentFact) {
      return res.status(404).json({ success: false, message: 'Agent fact not found' });
    }
    
    // Check if username is being changed and if it's already taken
    if (username && username.toLowerCase() !== agentFact.username) {
      const existingAgent = await AgentFact.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingAgent) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username is already taken' 
        });
      }
      updateData.username = username.toLowerCase();
    }
    
    // Update the agent fact
    const updatedAgentFact = await AgentFact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, data: updatedAgentFact });
  } catch (error) {
    console.error('Error updating agent fact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/agentfacts/:id
// @desc    Delete agentfact
// @access  Private
router.delete('/agentfacts/:id', isAuthenticated, async (req, res) => {
  try {
    const agentFact = await AgentFact.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!agentFact) {
      return res.status(404).json({ success: false, message: 'Agent fact not found' });
    }
    
    res.json({ success: true, message: 'Agent fact deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent fact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 