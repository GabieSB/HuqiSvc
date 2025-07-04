# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All code is committed to Git repository
- [ ] No sensitive data in code (API keys, passwords, etc.)
- [ ] Environment variables are properly configured
- [ ] CORS settings updated for production domains
- [ ] Error handling is comprehensive

### 2. Database Setup
- [ ] MongoDB Atlas cluster is running
- [ ] Database connection string is ready
- [ ] IP whitelist includes `0.0.0.0/0` for Vercel
- [ ] Database user has proper permissions
- [ ] Test database connection locally

### 3. Environment Variables
- [ ] Generate secure JWT_SECRET: `npm run generate:env`
- [ ] Prepare MONGODB_URI connection string
- [ ] Set BASE_URL to your Vercel app URL
- [ ] Document all required environment variables

### 4. Security Review
- [ ] Rate limiting is configured
- [ ] Security headers are enabled
- [ ] Input validation is implemented
- [ ] Authentication middleware is working
- [ ] CORS is properly configured

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy to Vercel
```bash
vercel
```

### Step 4: Set Environment Variables
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add BASE_URL
```

### Step 5: Deploy to Production
```bash
vercel --prod
```

## ✅ Post-Deployment Verification

### 1. Health Check
- [ ] Run: `npm run health:check https://your-app.vercel.app`
- [ ] Verify API responds correctly
- [ ] Check database connection status

### 2. API Endpoints Test
- [ ] Test `/` endpoint (welcome message)
- [ ] Test `/health` endpoint
- [ ] Test `/api/pets` endpoint
- [ ] Test `/api/users` endpoint
- [ ] Verify authentication works

### 3. Monitoring Setup
- [ ] Check Vercel function logs
- [ ] Monitor MongoDB Atlas metrics
- [ ] Set up error tracking (optional)
- [ ] Configure uptime monitoring

### 4. Performance Check
- [ ] Test response times
- [ ] Verify rate limiting works
- [ ] Check memory usage
- [ ] Monitor function execution time

## 🔧 Troubleshooting

### Common Issues
1. **MongoDB Connection Failed**
   - Check connection string format
   - Verify IP whitelist settings
   - Test connection locally

2. **Environment Variables Not Working**
   - Redeploy after adding variables
   - Check variable names (case-sensitive)
   - Verify production environment setting

3. **CORS Errors**
   - Update allowed origins in security.js
   - Add your frontend domain
   - Check browser console for details

4. **Function Timeout**
   - Optimize database queries
   - Check vercel.json maxDuration
   - Monitor function logs

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Project Issues**: Check your repository

## 🎯 Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Set up CI/CD pipeline
4. Plan for scaling and optimization
5. Document API endpoints for frontend team 