# Deployment Guide

This document provides comprehensive deployment instructions for the Blocks MVP application.

## Prerequisites

- Docker 20.10+
- Node.js 20+
- Kubernetes cluster (for production)
- kubectl configured (for Kubernetes deployment)

## Local Development with Docker

### Quick Start

```bash
# Build and run with docker-compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Individual Service Building

```bash
# Build backend
docker build -f backend/Dockerfile -t blocks-backend .

# Build frontend
docker build -f frontend/Dockerfile -t blocks-frontend .
```

## Production Deployment

### Docker Deployment

1. **Environment Variables**

   Create environment files for production:

   ```bash
   # Create .env.production
   NODE_ENV=production
   LOG_LEVEL=info
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

2. **Build Production Images**

   ```bash
   # Tag for production
   docker build -f backend/Dockerfile -t blocks-backend:v1.0.0 .
   docker build -f frontend/Dockerfile -t blocks-frontend:v1.0.0 .
   ```

3. **Deploy with Docker Compose**

   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

### Kubernetes Deployment

1. **Prepare Images**

   ```bash
   # Build and push to registry
   docker build -f backend/Dockerfile -t your-registry/blocks-backend:v1.0.0 .
   docker build -f frontend/Dockerfile -t your-registry/blocks-frontend:v1.0.0 .
   
   docker push your-registry/blocks-backend:v1.0.0
   docker push your-registry/blocks-frontend:v1.0.0
   ```

2. **Update Kubernetes Manifests**

   Update image references in `k8s/*.yaml` files:
   ```yaml
   image: your-registry/blocks-backend:v1.0.0
   image: your-registry/blocks-frontend:v1.0.0
   ```

3. **Deploy to Kubernetes**

   ```bash
   # Apply configurations
   kubectl apply -f k8s/backend.yaml
   kubectl apply -f k8s/frontend.yaml
   kubectl apply -f k8s/ingress.yaml
   
   # Check deployment status
   kubectl get pods -l app=blocks-backend
   kubectl get pods -l app=blocks-frontend
   kubectl get services
   ```

4. **Configure Ingress**

   Update `k8s/ingress.yaml` with your domain:
   ```yaml
   - host: blocks.yourdomain.com
   ```

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `8080` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `3000` | No |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` | Yes |

## Health Checks

### Backend Health Check

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345
}
```

### Frontend Health Check

```bash
curl http://localhost:3000
```

Should return the HTML page with status 200.

## Monitoring and Observability

### Performance Monitoring

The application includes built-in performance monitoring:

- **Backend**: Performance collectors at `/api/performance/collect`
- **Frontend**: Web Vitals collection and Lighthouse CI in GitHub Actions
- **Audit Trail**: Comprehensive audit logging for user actions

### Logging

- **Backend**: Structured logging with configurable levels
- **Frontend**: Browser console logging and error reporting
- **Format**: JSON structured logs in production

### Metrics Collection

Key metrics monitored:
- Response times
- Error rates
- User interactions
- Performance vitals (LCP, FID, CLS)

## Security Considerations

### Production Security Checklist

- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure CORS policies appropriately
- [ ] Set secure environment variables
- [ ] Enable security headers
- [ ] Configure rate limiting
- [ ] Review and update dependencies regularly

### Container Security

- [ ] Use non-root users in containers
- [ ] Scan images for vulnerabilities
- [ ] Keep base images updated
- [ ] Use minimal base images (Alpine Linux)

## Scaling Considerations

### Horizontal Scaling

The application is designed to be stateless and can be horizontally scaled:

- **Frontend**: Scale to multiple replicas behind a load balancer
- **Backend**: Scale to multiple replicas (currently using mock data)

### Resource Requirements

**Minimum Requirements:**
- CPU: 250m per service
- Memory: 256Mi per service

**Recommended Production:**
- CPU: 500m per service
- Memory: 512Mi per service

## Troubleshooting

### Common Issues

1. **Container Build Failures**
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -f backend/Dockerfile .
   ```

2. **Service Connection Issues**
   ```bash
   # Check service status
   kubectl get pods
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

3. **Frontend API Connection**
   - Verify `NEXT_PUBLIC_API_URL` environment variable
   - Check network connectivity between services
   - Validate CORS configuration

### Log Analysis

```bash
# View backend logs
kubectl logs -l app=blocks-backend

# View frontend logs  
kubectl logs -l app=blocks-frontend

# Follow logs in real-time
kubectl logs -f deployment/blocks-backend
```

## Rollback Procedures

### Kubernetes Rollback

```bash
# View rollout history
kubectl rollout history deployment/blocks-backend
kubectl rollout history deployment/blocks-frontend

# Rollback to previous version
kubectl rollout undo deployment/blocks-backend
kubectl rollout undo deployment/blocks-frontend

# Rollback to specific revision
kubectl rollout undo deployment/blocks-backend --to-revision=2
```

### Docker Rollback

```bash
# Stop current containers
docker-compose down

# Deploy previous version
docker-compose up -d
```

## Backup and Recovery

### Application State

Currently using mock data - no persistent state to backup.

For future database integration:
- Implement database backup procedures
- Configure automated backup schedules
- Test recovery procedures regularly

## Performance Optimization

### Production Optimizations Applied

- **Frontend**: Static asset optimization, code splitting, image optimization
- **Backend**: Response compression, efficient routing, caching headers
- **Infrastructure**: CDN integration ready, horizontal scaling support

### Monitoring Performance

- Use built-in Lighthouse CI for automated performance testing
- Monitor Web Vitals in production
- Set up alerts for performance regressions

## Support and Maintenance

### Regular Maintenance Tasks

- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Monitor performance metrics
- [ ] Check log aggregation
- [ ] Validate backup procedures

### Emergency Contacts

- Development Team: [contact-info]
- Infrastructure Team: [contact-info]
- On-call Rotation: [contact-info]