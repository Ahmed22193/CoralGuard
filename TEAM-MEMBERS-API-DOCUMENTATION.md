# Team Members API Documentation

## Endpoints

### GET /api/team-members
- Returns all team members
- Response format: JSON
- Example response:
```json
{
  "success": true,
  "message": "Team members retrieved successfully",
  "data": {
    "count": 3,
    "members": [...]
  }
}
```

### GET /api/team-members/count
- Returns the count of team members
- Response format: JSON
- Example response:
```json
{
  "success": true,
  "count": 3
}
```

### GET /api/health
- Server health check
- Response format: JSON
- Example response:
```json
{
  "status": "ok",
  "timestamp": "2025-09-03T12:34:56.789Z",
  "uptime": 123.456
}
```
