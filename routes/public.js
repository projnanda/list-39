const express = require('express');
const AgentFact = require('../models/AgentFact');
const router = express.Router();

// @route   GET /@:username.json
// @desc    Get public agent fact by username in JSON format
// @access  Public
router.get('/@:username.json', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const agentFact = await AgentFact.findOne({ 
      username: username,
      isPublic: true 
    });
    
    if (!agentFact) {
      const errorData = { 
        error: 'Agent fact not found',
        message: `No public agent found with username: ${username}`
      };
      res.status(404).set('Content-Type', 'application/json');
      return res.send(JSON.stringify(errorData, null, 2));
    }
    
    // Return the agent fact in the specified format
    const publicData = {
      id: agentFact.id,
      agent_name: agentFact.agent_name,
      label: agentFact.label,
      description: agentFact.description,
      version: agentFact.version,
      documentationUrl: agentFact.documentationUrl,
      jurisdiction: agentFact.jurisdiction,
      provider: agentFact.provider,
      endpoints: agentFact.endpoints,
      capabilities: agentFact.capabilities,
      skills: agentFact.skills,
      evaluations: agentFact.evaluations,
      telemetry: agentFact.telemetry,
      certification: agentFact.certification,
      created_at: agentFact.created_at,
      updated_at: agentFact.updated_at
    };
    
    // Set content type and return pretty-printed JSON
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(publicData, null, 2));
  } catch (error) {
    console.error('Error fetching public agent fact:', error);
    const errorData = { 
      error: 'Server error',
      message: 'Internal server error occurred'
    };
    res.status(500).set('Content-Type', 'application/json');
    res.send(JSON.stringify(errorData, null, 2));
  }
});

// @route   GET /@:username
// @desc    Get public agent fact by username in HTML format (for browsers)
// @access  Public
router.get('/@:username', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const agentFact = await AgentFact.findOne({ 
      username: username,
      isPublic: true 
    });
    
    if (!agentFact) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Agent Not Found - List39</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 40px; background: #0f0f0f; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; text-align: center; }
            h1 { color: #ff6b6b; margin-bottom: 20px; }
            p { color: #999; margin-bottom: 30px; }
            a { color: #4dabf7; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Agent Not Found</h1>
            <p>No public agent found with username: <strong>@${username}</strong></p>
            <p><a href="/">← Back to List39</a></p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Return a simple HTML view of the agent fact
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${agentFact.agent_name} - List39</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 40px; background: #0f0f0f; color: #fff; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { margin: 0; color: #fff; }
          .subtitle { color: #999; margin-top: 5px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #4dabf7; font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px; }
          .json-link { background: #1a1a1a; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .json-link a { color: #4dabf7; text-decoration: none; font-family: monospace; }
          .json-link a:hover { text-decoration: underline; }
          .back-link { margin-top: 40px; }
          .back-link a { color: #666; text-decoration: none; }
          .back-link a:hover { color: #999; }
          .description { color: #ccc; }
          .meta { color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${agentFact.agent_name}</h1>
            <div class="subtitle">@${agentFact.username}</div>
          </div>
          
          <div class="section">
            <h2>Description</h2>
            <p class="description">${agentFact.description || 'No description provided'}</p>
          </div>
          
          <div class="json-link">
            <strong>JSON Endpoint:</strong><br>
            <a href="/@${agentFact.username}.json">/${agentFact.username}.json</a>
          </div>
          
          <div class="section">
            <h2>Details</h2>
            <p><strong>Version:</strong> ${agentFact.version}</p>
            <p><strong>Jurisdiction:</strong> ${agentFact.jurisdiction}</p>
            <p><strong>Provider:</strong> ${agentFact.provider.name || 'N/A'}</p>
            <p><strong>Capabilities:</strong> ${agentFact.capabilities.modalities.join(', ')}</p>
          </div>
          
          <div class="section">
            <p class="meta">
              Created: ${new Date(agentFact.created_at).toLocaleDateString()}<br>
              Updated: ${new Date(agentFact.updated_at).toLocaleDateString()}
            </p>
          </div>
          
          <div class="back-link">
            <a href="/">← Back to List39</a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error fetching public agent fact:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router; 