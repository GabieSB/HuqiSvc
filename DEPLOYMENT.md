# Deployment Guide for Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Environment Variables

Before deploying, you need to set up the following environment variables in Vercel:

### Required Environment Variables

1. **MONGODB_URI**: Your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

2. **JWT_SECRET**: A secure secret key for JWT token signing
   - Generate a strong random string (at least 32 characters)

3. **BASE_URL**: Your production API URL
   - Format: `https://your-app-name.vercel.app`

### Optional Environment Variables

- **NODE_ENV**: Set to `production` (automatically set by Vercel)
- **PORT**: Automatically handled by Vercel

## Deployment Steps

### Method 1: Using Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy from your project directory**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name
   - Confirm deployment settings

4. **Set environment variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add BASE_URL
   ```

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Method 2: Using Vercel Dashboard

1. **Connect your Git repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure project settings**:
   - Framework Preset: Other
   - Build Command: Leave empty (not needed for Node.js API)
   - Output Directory: Leave empty
   - Install Command: `npm install`

3. **Set environment variables**:
   - Go to Project Settings → Environment Variables
   - Add each required environment variable

4. **Deploy**:
   - Click "Deploy"

## Post-Deployment

### Verify Deployment

1. **Check health endpoint**: `https://your-app-name.vercel.app/health`
2. **Test API endpoints**: `https://your-app-name.vercel.app/api/pets`
3. **Monitor logs**: Use Vercel dashboard to check function logs

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**:
   - Verify MONGODB_URI is correct
   - Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Vercel)

2. **Environment Variables Not Working**:
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding environment variables

3. **Function Timeout**:
   - Check `vercel.json` maxDuration setting
   - Optimize database queries

4. **CORS Issues**:
   - Update CORS configuration in `middleware/security.js`
   - Add your frontend domain to allowed origins

### Performance Optimization

1. **Database Connection Pooling**: Already configured in `server.js`
2. **Rate Limiting**: Already implemented
3. **Security Headers**: Already configured
4. **Error Handling**: Already implemented

## Monitoring

- **Vercel Analytics**: Available in dashboard
- **Function Logs**: Check for errors and performance
- **MongoDB Atlas**: Monitor database performance
- **Health Checks**: Use `/health` endpoint for monitoring

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **JWT Secret**: Use a strong, unique secret
3. **MongoDB Security**: Use connection string with proper authentication
4. **Rate Limiting**: Already configured to prevent abuse
5. **CORS**: Configured to allow only trusted domains

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Project Issues**: Check your repository's issue tracker 