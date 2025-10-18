# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies for CGO
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY main.go ./

# Build the application with CGO enabled
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o whatsapp-bridge main.go

# Runtime stage
FROM alpine:latest

# Install required libraries
RUN apk --no-cache add ca-certificates sqlite-libs

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/whatsapp-bridge .

# Create store directory for database
RUN mkdir -p /app/store

# Expose port (Render will set PORT env variable)
EXPOSE 8080

# Run the application
CMD ["./whatsapp-bridge"]
