# List39 Agent Facts Registry

List39 is an open agent identity infrastructure for the agentic web. It provides standardized agent discovery and interoperability through a centralized registry with public JSON endpoints.

## Architecture Overview

### Core Components

- **Express.js Backend**: RESTful API server with authentication and data management
- **MongoDB Database**: Document storage for agent facts and user accounts
- **Google OAuth 2.0**: Authentication system for agent management
- **Public JSON API**: Vendor-neutral agent discovery endpoints
- **Nginx Reverse Proxy**: Production web server with SSL termination

### Data Models

#### Agent Facts
Agent facts represent AI agent identities with standardized metadata:

```javascript
{
  id: "unique-identifier",
  agent_name: "Agent Display Name",
  username: "unique-username",
  label: "Brief description",
  description: "Detailed agent description",
  version: "1.0.0",
  documentationUrl: "https://docs.example.com",
  jurisdiction: "US",
  provider: {
    name: "Provider Name",
    url: "https://provider.com"
  },
  endpoints: [
    {
      name: "chat",
      url: "https://api.example.com/chat",
      method: "POST",
      description: "Chat endpoint"
    }
  ],
  capabilities: {
    modalities: ["text", "image"],
    languages: ["en", "es"],
    domains: ["general", "coding"]
  },
  skills: ["reasoning", "analysis"],
  evaluations: [
    {
      benchmark: "MMLU",
      score: 85.2,
      date: "2024-01-15"
    }
  ],
  telemetry: {
    usage_tracking: true,
    data_retention_days: 30
  },
  certification: {
    verified: true,
    authority: "List39",
    date: "2024-01-01"
  },
  isPublic: true,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z"
}
```

#### User Accounts
User accounts manage agent ownership and authentication:

```javascript
{
  googleId: "google-oauth-id",
  name: "User Name",
  email: "user@example.com",
  picture: "https://avatar-url.com/image.jpg"
}
```

## API Endpoints

### Public Discovery API

#### Get Agent Facts by Username
```
GET /@{username}.json
```

Returns public agent facts in JSON format. This is the primary discovery endpoint for agent interoperability.

**Example Request:**
```bash
curl https://list39.org/@example-agent.json
```

**Example Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "agent_name": "Example Agent",
  "label": "A demonstration agent",
  "description": "This agent demonstrates the List39 registry format",
  "version": "1.0.0",
  "capabilities": {
    "modalities": ["text"],
    "languages": ["en"],
    "domains": ["general"]
  },
  "endpoints": [
    {
      "name": "chat",
      "url": "https://api.example.com/chat",
      "method": "POST"
    }
  ],
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### Get Agent Facts by Username (HTML)
```
GET /@{username}
```

Returns a human-readable HTML view of the agent facts with a link to the JSON endpoint.

### Authentication API

#### Google OAuth Login
```
GET /auth/google
```

Initiates Google OAuth 2.0 authentication flow.

#### OAuth Callback
```
GET /auth/google/callback
```

Handles Google OAuth callback and creates/updates user sessions.

#### Logout
```
GET /auth/logout
```

Terminates user session and redirects to home page.

#### Get Current User
```
GET /auth/user
```

Returns current authenticated user information.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "picture": "avatar-url"
  }
}
```

### Agent Management API (Authenticated)

#### List User's Agent Facts
```
GET /api/agentfacts
```

Returns all agent facts owned by the authenticated user.

#### Create Agent Fact
```
POST /api/agentfacts
```

Creates a new agent fact. Requires authentication.

**Request Body:**
```json
{
  "agent_name": "My Agent",
  "username": "my-agent",
  "label": "Brief description",
  "description": "Detailed description",
  "version": "1.0.0",
  "isPublic": true
}
```

#### Update Agent Fact
```
PUT /api/agentfacts/{id}
```

Updates an existing agent fact. User must own the agent fact.

#### Delete Agent Fact
```
DELETE /api/agentfacts/{id}
```

Deletes an agent fact. User must own the agent fact.

## Technical Implementation

### Security Features

- **HTTPS Enforcement**: All production traffic uses TLS encryption
- **CORS Configuration**: Proper cross-origin resource sharing policies
- **Rate Limiting**: API throttling to prevent abuse
- **Session Security**: HTTP-only, secure cookies with MongoDB session store
- **Input Validation**: Comprehensive request validation using Joi schemas
- **Security Headers**: Helmet.js security middleware

### Database Design

- **MongoDB Atlas**: Cloud-hosted MongoDB with connection pooling
- **Mongoose ODM**: Schema validation and data modeling
- **Indexes**: Optimized queries on username, email, and googleId fields
- **Session Store**: MongoDB-backed session persistence

### Production Deployment

- **PM2 Process Manager**: Application process management with auto-restart
- **Nginx Reverse Proxy**: Load balancing and SSL termination
- **Let's Encrypt SSL**: Automated certificate management
- **Environment Configuration**: Secure environment variable management

### Error Handling

- **Graceful Degradation**: Proper error responses for all failure modes
- **Logging**: Comprehensive application and access logging
- **Validation**: Client and server-side input validation
- **Rate Limiting**: Request throttling with informative error messages

## Development Setup

### Prerequisites

- Node.js 18+
- MongoDB connection string
- Google OAuth 2.0 credentials

### Environment Variables

Copy `env.example` to `.env` and update with your actual values:

```bash
cp env.example .env
```

Required environment variables:

```bash
MONGODB_URI=mongodb://localhost:27017/list39
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PORT=3000
NODE_ENV=development
DOMAIN=localhost:3000
BASE_URL=http://localhost:3000
```

### Installation

```bash
npm install
npm start
```

The application will be available at `http://localhost:3000`.

## Registry Protocol

List39 implements a simple discovery protocol where agents are identified by username and accessible via predictable URLs:

- **Discovery Pattern**: `https://list39.org/@{username}.json`
- **Content Type**: `application/json`
- **Format**: Standardized agent metadata schema
- **Caching**: ETags for efficient content delivery
- **Versioning**: Schema evolution through optional fields

This enables automated agent discovery and integration across different platforms and services.

## Contributing

List39 is open infrastructure for the agentic web. The registry format and API are designed to be vendor-neutral and extensible.

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues:
- Check the GitHub issues
- Review the documentation
- Contact the development team

---

Built with ❤️ for the AI agent community. 