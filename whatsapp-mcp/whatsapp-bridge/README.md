# WhatsApp Bridge API

A REST API server that bridges WhatsApp messaging functionality using the whatsmeow library.

## Features

- ✅ Send WhatsApp messages via REST API
- ✅ Support for text and media messages
- ✅ CORS enabled for web applications
- ✅ Persistent message storage (SQLite)
- ✅ Docker support
- ✅ Easy deployment to Render

## Quick Start

### Local Development

```bash
# Install dependencies
go mod download

# Run the server
go run main.go

# Server will start on http://localhost:8080
```

On first run, scan the QR code with your WhatsApp mobile app.

### Send a Message

```bash
curl -X POST http://localhost:8080/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "972547217798",
    "message": "Hello from WhatsApp Bridge!"
  }'
```

## API Endpoints

### POST /api/send

Send a WhatsApp message.

**Request Body:**
```json
{
  "recipient": "972547217798",
  "message": "Your message here",
  "media_path": "/path/to/file.jpg" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent to 972547217798"
}
```

### POST /api/download

Download media from a received message.

**Request Body:**
```json
{
  "message_id": "MESSAGE_ID",
  "chat_jid": "CHAT_JID"
}
```

## Deployment

### Deploy to Render (Recommended)

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for complete instructions.

Quick deploy:
1. Push to GitHub
2. Connect to Render
3. Deploy automatically from render.yaml

### Docker Deployment

```bash
# Build
docker build -t whatsapp-bridge .

# Run
docker run -p 8080:8080 -v $(pwd)/store:/app/store whatsapp-bridge
```

## Configuration

The server runs on port 8080 by default. You can change this by setting the `PORT` environment variable.

## Storage

- WhatsApp session data: `/app/store/whatsapp.db`
- Message history: `/app/store/messages.db`

**Important:** Keep the `/app/store` directory persistent to maintain your WhatsApp session.

## Environment Variables

- `PORT` - Server port (default: 8080)

## Requirements

- Go 1.24+
- SQLite3
- WhatsApp account

## License

MIT

## Support

For deployment help, see [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
