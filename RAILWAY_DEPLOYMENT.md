# Railway Deployment Guide for Elegant Drawer v2

This guide provides step-by-step instructions to deploy the Elegant Drawer v2 application on Railway using Docker with the custom domain `novatra-ai.com`.

## 📋 Prerequisites

Before starting, ensure you have:

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Domain Access**: Administrative access to `novatra-ai.com` domain
4. **Local Development Environment**: Node.js 18+ and Git installed

## 🏗️ Project Structure

The following files have been created for Railway deployment:

```
elegant-drawerv2/
├── Dockerfile              # Multi-stage Docker build
├── nginx.conf              # Nginx configuration for serving React app
├── railway.toml            # Railway-specific configuration
├── .dockerignore           # Files to exclude from Docker build
└── RAILWAY_DEPLOYMENT.md   # This guide
```

## 🐳 Docker Configuration

### Dockerfile Features:
- **Multi-stage build** for optimized image size
- **Node.js 18 Alpine** for building
- **Nginx Alpine** for serving
- **Health checks** for monitoring
- **Security headers** and **gzip compression**

### Nginx Configuration:
- **React Router support** (SPA routing)
- **Static asset caching** (1 year cache for assets)
- **Security headers** (XSS, CSRF protection)
- **Health check endpoint** at `/health`
- **Gzip compression** for better performance

## 🚀 Step-by-Step Deployment Guide

### Step 1: Prepare Your Repository

1. **Commit all changes** to your GitHub repository:
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. **Verify required files** are in your repository:
   - ✅ `Dockerfile`
   - ✅ `nginx.conf`
   - ✅ `railway.toml`
   - ✅ `.dockerignore`

### Step 2: Create Railway Project

1. **Sign in to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign in with your GitHub account

2. **Create new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `elegant-drawerv2` repository
   - Railway will automatically detect the Dockerfile

3. **Configure project settings**:
   - Project name: `elegant-drawerv2`
   - Environment: `production`
   - Railway will start the initial deployment automatically

### Step 3: Monitor Initial Deployment

1. **Check build logs**:
   - Go to your project dashboard
   - Click on the service
   - Monitor the "Deployments" tab for build progress

2. **Verify deployment**:
   - Once deployed, Railway will provide a temporary URL (e.g., `elegant-drawerv2-production.up.railway.app`)
   - Click the URL to test your application
   - Verify all diagrams render correctly

### Step 4: Configure Custom Domain

#### A. Add Domain in Railway

1. **Access domain settings**:
   - In your Railway project dashboard
   - Go to "Settings" → "Domains"
   - Click "Custom Domain"

2. **Add your domain**:
   - Enter: `novatra-ai.com`
   - Click "Add Domain"
   - Railway will provide DNS configuration details

#### B. Configure DNS at Your Domain Provider

1. **Access your domain registrar** (where you purchased `novatra-ai.com`)

2. **Add CNAME record**:
   ```
   Type: CNAME
   Name: www
   Value: [Railway-provided-URL]
   TTL: 300 (or default)
   ```

3. **Add A record for root domain**:
   ```
   Type: A
   Name: @
   Value: [Railway-provided-IP]
   TTL: 300 (or default)
   ```

4. **Add CNAME for Railway**:
   ```
   Type: CNAME
   Name: novatra-ai.com
   Value: [provided by Railway in dashboard]
   TTL: 300
   ```

#### C. Enable HTTPS

1. **Automatic SSL**:
   - Railway automatically provides SSL certificates
   - Wait 5-15 minutes for SSL to activate
   - Verify HTTPS works: `https://novatra-ai.com`

### Step 5: Environment Configuration (Optional)

If you need environment variables:

1. **Add environment variables**:
   - Go to "Variables" in Railway dashboard
   - Add any required environment variables
   - Example:
     ```
     NODE_ENV=production
     VITE_API_URL=https://api.novatra-ai.com
     ```

2. **Redeploy** if environment variables are added:
   - Railway will automatically redeploy
   - Monitor deployment logs

### Step 6: Set Up Monitoring and Health Checks

1. **Health check endpoint**:
   - Your app includes a health check at `/health`
   - Railway will use this for monitoring
   - Returns "healthy" status

2. **Monitor application**:
   - Check "Metrics" tab in Railway dashboard
   - Monitor CPU, memory, and response times
   - Set up alerts if needed

## 🔧 Advanced Configuration

### Custom Build Commands

If you need custom build commands, modify `railway.toml`:

```toml
[build]
builder = "DOCKERFILE"
buildCommand = "npm run build:production"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
startCommand = "nginx -g 'daemon off;'"
```

### Environment-Specific Configuration

Create environment-specific configurations:

```toml
# railway.toml
[environments.production]
[environments.production.deploy]
healthcheckPath = "/health"
replicas = 2

[environments.staging]
[environments.staging.deploy]
healthcheckPath = "/health"
replicas = 1
```

### Database Integration (if needed later)

To add a database:

1. **Add database service**:
   - In Railway dashboard, click "New"
   - Select database type (PostgreSQL, MySQL, MongoDB, etc.)
   - Railway will provide connection details

2. **Update environment variables**:
   - Add database connection strings
   - Update your application code accordingly

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures

**Problem**: Docker build fails
**Solution**:
```bash
# Check Dockerfile syntax
docker build -t elegant-drawer-test .

# Verify locally
docker run -p 3000:80 elegant-drawer-test
```

#### 2. Application Not Loading

**Problem**: 404 errors or blank page
**Solution**:
- Check nginx.conf configuration
- Verify React Router is properly handled
- Check browser console for errors

#### 3. Domain Not Working

**Problem**: Custom domain shows Railway's 404 page
**Solution**:
- Verify DNS propagation: `nslookup novatra-ai.com`
- Check Railway domain configuration
- Wait 24-48 hours for full DNS propagation

#### 4. SSL Certificate Issues

**Problem**: HTTPS not working
**Solution**:
- Wait 15-30 minutes after domain configuration
- Check Railway SSL status in dashboard
- Verify domain ownership

### Logs and Debugging

1. **View application logs**:
   ```bash
   # In Railway dashboard
   Go to Deployments → View Logs
   ```

2. **Check health status**:
   ```bash
   curl https://novatra-ai.com/health
   # Should return: "healthy"
   ```

3. **Test locally**:
   ```bash
   # Build and test Docker image locally
   docker build -t elegant-drawer .
   docker run -p 8080:80 elegant-drawer
   # Visit http://localhost:8080
   ```

## 📊 Performance Optimization

### 1. Image Optimization

The Dockerfile is already optimized with:
- Multi-stage build (reduces image size by ~70%)
- Alpine Linux (minimal base image)
- Production-only dependencies

### 2. Nginx Optimization

Current nginx.conf includes:
- Gzip compression
- Static asset caching (1 year)
- Security headers
- Health check endpoint

### 3. Railway Optimization

Configure for optimal performance:
- Enable Railway's CDN
- Set appropriate health check intervals
- Monitor resource usage

## 🚀 Deployment Checklist

Before going live:

- [ ] Code committed and pushed to GitHub
- [ ] Dockerfile builds successfully locally
- [ ] Application works with test data
- [ ] All diagram types render correctly
- [ ] Custom domain DNS configured
- [ ] SSL certificate active
- [ ] Health checks passing
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place

## 📞 Support and Maintenance

### Railway Support
- Documentation: [docs.railway.app](https://docs.railway.app)
- Community: [Railway Discord](https://discord.gg/railway)
- Status page: [status.railway.app](https://status.railway.app)

### Application Monitoring

Monitor these metrics:
- Response time
- Error rate
- Memory usage
- CPU utilization
- Uptime percentage

### Regular Maintenance

- **Weekly**: Check deployment logs and metrics
- **Monthly**: Review performance and optimize if needed
- **Quarterly**: Update dependencies and security patches

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ Application loads at `https://novatra-ai.com`
2. ✅ All diagram types render correctly
3. ✅ SSL certificate is active (green lock icon)
4. ✅ Health check returns "healthy"
5. ✅ Page load time < 3 seconds
6. ✅ No console errors in browser
7. ✅ Responsive design works on mobile

## Next Steps

After successful deployment:

1. **Set up monitoring alerts**
2. **Configure backup strategy**
3. **Implement analytics tracking**
4. **Set up staging environment**
5. **Document deployment process for team**

Your Elegant Drawer v2 application should now be successfully deployed on Railway with your custom domain! 🎨✨