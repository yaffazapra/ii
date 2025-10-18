# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY main.go ./

# Build the application
RUN CGO_ENABLED=1 go build -o whatsapp-bridge main.go

# Runtime stage
FROM alpine:latest

# Install required libraries
RUN apk --no-cache add ca-certificates sqlite-libs

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/whatsapp-bridge .

# Create store directory for database
RUN mkdir -p /app/store

# Expose port
EXPOSE 8080

# Run the application
CMD ["./whatsapp-bridge"]
