const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const providerSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  url: { type: String, default: '' },
  did: { type: String, default: '' }
});

const endpointsSchema = new mongoose.Schema({
  static: [String],
  adaptive_resolver: {
    url: { type: String, default: '' },
    policies: [String]
  }
});

const authenticationSchema = new mongoose.Schema({
  methods: [String],
  requiredScopes: [String]
});

const capabilitiesSchema = new mongoose.Schema({
  modalities: [String],
  streaming: { type: Boolean, default: false },
  batch: { type: Boolean, default: false },
  authentication: authenticationSchema
});

const skillSchema = new mongoose.Schema({
  id: String,
  description: String,
  inputModes: [String],
  outputModes: [String],
  supportedLanguages: [String]
});

const evaluationsSchema = new mongoose.Schema({
  performanceScore: { type: Number, default: 0 },
  availability90d: { type: String, default: '' },
  lastAudited: { type: String, default: '' },
  auditTrail: { type: String, default: '' },
  auditorID: { type: String, default: '' }
});

const telemetrySchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  retention: { type: String, default: '1d' },
  sampling: { type: Number, default: 0.1 }
});

const certificationSchema = new mongoose.Schema({
  level: { type: String, default: 'verified' },
  issuer: { type: String, default: 'NANDA' },
  issuanceDate: String,
  expirationDate: String
});

const agentFactSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  agent_name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  version: {
    type: String,
    default: '1.0'
  },
  documentationUrl: {
    type: String,
    default: ''
  },
  jurisdiction: {
    type: String,
    default: 'USA'
  },
  provider: providerSchema,
  endpoints: endpointsSchema,
  capabilities: capabilitiesSchema,
  skills: [skillSchema],
  evaluations: evaluationsSchema,
  telemetry: telemetrySchema,
  certification: certificationSchema,
  
  // Additional fields for our application
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  collection: 'agent_facts'
});

// Create indexes
agentFactSchema.index({ username: 1 });
agentFactSchema.index({ userId: 1 });
agentFactSchema.index({ id: 1 });

module.exports = mongoose.model('AgentFact', agentFactSchema); 