# DNS Configuration Guide for novatra-ai.com

This guide explains how to configure DNS records for your domain `novatra-ai.com` to work with Railway deployment.

## 📋 Overview

After deploying to Railway, you'll need to configure DNS records to point your custom domain to Railway's servers.

## 🌐 DNS Records Required

### Step 1: Get Railway DNS Information

1. **Deploy to Railway first** (follow RAILWAY_DEPLOYMENT.md)
2. **Go to Railway Dashboard** → Your Project → Settings → Domains
3. **Add Custom Domain**: `novatra-ai.com`
4. **Note the provided values**:
   - CNAME target (e.g., `your-app.up.railway.app`)
   - A record IP (if provided)

### Step 2: Configure DNS Records

#### For Root Domain (novatra-ai.com)

**Option A: CNAME Record (Preferred)**
```
Type: CNAME
Name: @
Value: [railway-provided-domain].up.railway.app
TTL: 300
```

**Option B: A Record (Alternative)**
```
Type: A
Name: @
Value: [railway-provided-IP]
TTL: 300
```

#### For WWW Subdomain (www.novatra-ai.com)

```
Type: CNAME
Name: www
Value: [railway-provided-domain].up.railway.app
TTL: 300
```

## 🏢 Provider-Specific Instructions

### Cloudflare

1. **Login to Cloudflare Dashboard**
2. **Select your domain**: `novatra-ai.com`
3. **Go to DNS section**
4. **Add records**:
   ```
   Type: CNAME
   Name: @
   Target: [railway-domain].up.railway.app
   Proxy status: DNS only (gray cloud)
   TTL: Auto
   ```
   ```
   Type: CNAME
   Name: www
   Target: [railway-domain].up.railway.app
   Proxy status: DNS only (gray cloud)
   TTL: Auto
   ```

**Important**: Set proxy status to "DNS only" initially. You can enable proxy later if needed.

### GoDaddy

1. **Login to GoDaddy Account**
2. **Go to Domain Management**
3. **Select novatra-ai.com**
4. **Manage DNS**
5. **Add records**:
   ```
   Type: CNAME
   Host: @
   Points to: [railway-domain].up.railway.app
   TTL: 1 Hour
   ```
   ```
   Type: CNAME
   Host: www
   Points to: [railway-domain].up.railway.app
   TTL: 1 Hour
   ```

### Namecheap

1. **Login to Namecheap**
2. **Domain List** → Manage next to novatra-ai.com
3. **Advanced DNS tab**
4. **Add records**:
   ```
   Type: CNAME Record
   Host: @
   Value: [railway-domain].up.railway.app
   TTL: Automatic
   ```
   ```
   Type: CNAME Record
   Host: www
   Value: [railway-domain].up.railway.app
   TTL: Automatic
   ```

### Google Domains

1. **Login to Google Domains**
2. **Select novatra-ai.com**
3. **DNS section**
4. **Custom resource records**:
   ```
   Name: @
   Type: CNAME
   TTL: 300
   Data: [railway-domain].up.railway.app
   ```
   ```
   Name: www
   Type: CNAME
   TTL: 300
   Data: [railway-domain].up.railway.app
   ```

### AWS Route 53

1. **Login to AWS Console**
2. **Route 53** → Hosted Zones
3. **Select novatra-ai.com**
4. **Create records**:
   ```
   Record name: (empty for root)
   Record type: CNAME
   Value: [railway-domain].up.railway.app
   TTL: 300
   ```
   ```
   Record name: www
   Record type: CNAME
   Value: [railway-domain].up.railway.app
   TTL: 300
   ```

## 🔍 Verification Steps

### 1. Check DNS Propagation

Use online tools to verify DNS propagation:
- [whatsmydns.net](https://www.whatsmydns.net)
- [dnschecker.org](https://dnschecker.org)
- [nslookup.io](https://www.nslookup.io)

**Command line verification**:
```bash
# Check CNAME record
nslookup novatra-ai.com
nslookup www.novatra-ai.com

# Check if domain resolves to Railway
dig novatra-ai.com CNAME
dig www.novatra-ai.com CNAME
```

### 2. Test Domain Access

1. **HTTP Access**: `http://novatra-ai.com`
2. **HTTPS Access**: `https://novatra-ai.com`
3. **WWW Redirect**: `https://www.novatra-ai.com`

### 3. SSL Certificate Status

- **Automatic SSL**: Railway provides automatic SSL certificates
- **Verification time**: 5-30 minutes after DNS propagation
- **Check certificate**: Browser should show green lock icon

## ⏰ Timing Expectations

| Step | Expected Time |
|------|---------------|
| DNS Record Creation | Immediate |
| DNS Propagation | 5 minutes - 48 hours |
| SSL Certificate Generation | 5-30 minutes after DNS propagation |
| Full Site Availability | 1-2 hours (typical) |

## 🚨 Troubleshooting

### Common Issues

#### 1. Domain Shows Railway 404 Page

**Problem**: DNS points to Railway but shows default 404
**Solution**:
- Verify domain is added in Railway dashboard
- Check Railway domain configuration
- Ensure domain is exactly: `novatra-ai.com`

#### 2. DNS Not Propagating

**Problem**: nslookup still shows old records
**Solution**:
- Wait longer (up to 48 hours)
- Check TTL values (lower = faster propagation)
- Clear local DNS cache:
  ```bash
  # Windows
  ipconfig /flushdns
  
  # macOS
  sudo dscacheutil -flushcache
  
  # Linux
  sudo systemctl restart systemd-resolved
  ```

#### 3. SSL Certificate Not Working

**Problem**: HTTPS shows security warnings
**Solution**:
- Wait 30 minutes after DNS propagation
- Verify domain ownership in Railway
- Check Railway SSL status in dashboard

#### 4. WWW Subdomain Not Working

**Problem**: www.novatra-ai.com doesn't work
**Solution**:
- Add separate CNAME record for www
- Verify both records in DNS checker
- Consider adding redirect from www to non-www

### Advanced Troubleshooting

#### Check DNS with dig command:
```bash
# Check all records
dig novatra-ai.com ANY

# Check specific record types
dig novatra-ai.com A
dig novatra-ai.com CNAME
dig novatra-ai.com MX
```

#### Check HTTP response:
```bash
# Test HTTP
curl -I http://novatra-ai.com

# Test HTTPS
curl -I https://novatra-ai.com

# Check redirect
curl -I -L http://novatra-ai.com
```

## 🎯 Best Practices

### 1. DNS Configuration
- Use short TTL values (300 seconds) during setup
- Increase TTL after verification (3600 seconds)
- Keep backup of original DNS records

### 2. SSL/HTTPS
- Always use HTTPS in production
- Set up HTTP → HTTPS redirects
- Monitor SSL certificate expiration

### 3. Monitoring
- Set up uptime monitoring
- Monitor DNS resolution
- Track SSL certificate status

## 📞 Support Resources

### Railway Support
- **Documentation**: [docs.railway.app](https://docs.railway.app)
- **Community**: [Railway Discord](https://discord.gg/railway)
- **Help Center**: Help section in Railway dashboard

### DNS Support
- **Your domain registrar's support** (primary contact)
- **Cloudflare Support** (if using Cloudflare)
- **DNS troubleshooting tools** (online)

## ✅ Final Verification Checklist

After DNS configuration:

- [ ] `novatra-ai.com` loads your application
- [ ] `www.novatra-ai.com` works (redirects or loads)
- [ ] HTTPS works with green lock icon
- [ ] All diagram types render correctly
- [ ] Mobile responsiveness works
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Health check responds: `https://novatra-ai.com/health`

Your domain should now be successfully configured! 🎉