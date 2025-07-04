# MongoDB Atlas Setup Guide for Vercel

## 🎯 Overview

This guide will help you set up MongoDB Atlas to work with your Vercel deployment. The 500 error you're experiencing is likely due to MongoDB connection issues.

## 📋 Prerequisites

- MongoDB Atlas account (free tier available)
- Your Vercel project deployed
- Access to Vercel dashboard

## 🚀 Step-by-Step Setup

### Step 1: Create MongoDB Atlas Account

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com
2. **Sign up** for a free account
3. **Create a new project** (optional, you can use the default)

### Step 2: Create a Cluster

1. **Click "Build a Database"**
2. **Choose "FREE" tier** (M0 Sandbox)
3. **Select cloud provider** (AWS, Google Cloud, or Azure)
4. **Choose region** (closest to your users)
5. **Click "Create"**

### Step 3: Configure Network Access

1. **Go to "Network Access"** in the left sidebar
2. **Click "Add IP Address"**
3. **For Vercel deployment**:
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - This allows Vercel's serverless functions to connect
4. **Click "Confirm"**

### Step 4: Create Database User

1. **Go to "Database Access"** in the left sidebar
2. **Click "Add New Database User"**
3. **Configure user**:
   - Authentication Method: Password
   - Username: Create a strong username (e.g., `huqisvc_user`)
   - Password: Generate a strong password
   - Database User Privileges: "Read and write to any database"
4. **Click "Add User"**

### Step 5: Get Connection String

1. **Go to "Database"** in the left sidebar
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Copy the connection string**

### Step 6: Customize Connection String

Your connection string looks like this:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Replace the placeholders**:
- `username`: Your database username
- `password`: Your database password
- `database`: Your database name (e.g., `huqisvc`)

**Example**:
```
mongodb+srv://huqisvc_user:MySecurePassword123@cluster0.abc123.mongodb.net/huqisvc?retryWrites=true&w=majority
```

### Step 7: Test Connection Locally

1. **Create a `.env` file** in your project root:
   ```
   MONGODB_URI=your_connection_string_here
   ```

2. **Test the connection**:
   ```bash
   npm run test:mongodb
   ```

3. **If successful**, you'll see:
   ```
   ✅ Successfully connected to MongoDB!
   📊 Database: huqisvc
   ```

### Step 8: Set Environment Variables in Vercel

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add these variables**:

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/huqisvc?retryWrites=true&w=majority` | Production |
   | `JWT_SECRET` | `your_generated_jwt_secret` | Production |
   | `BASE_URL` | `https://your-app-name.vercel.app` | Production |

4. **Click "Save"**

### Step 9: Redeploy Your Application

1. **Go to your Vercel project**
2. **Click "Redeploy"** or push new changes to trigger deployment
3. **Wait for deployment to complete**

### Step 10: Test Your API

1. **Test health endpoint**:
   ```
   https://your-app-name.vercel.app/health
   ```

2. **Test main endpoint**:
   ```
   https://your-app-name.vercel.app/
   ```

## 🔧 Troubleshooting

### Common Issues

#### 1. "MongoServerSelectionError"
- **Cause**: Network access not configured properly
- **Solution**: Add `0.0.0.0/0` to Network Access in MongoDB Atlas

#### 2. "Authentication failed"
- **Cause**: Wrong username/password
- **Solution**: Double-check credentials in connection string

#### 3. "Connection timeout"
- **Cause**: Network issues or wrong connection string
- **Solution**: Verify connection string format and network access

#### 4. "Environment variable not found"
- **Cause**: MONGODB_URI not set in Vercel
- **Solution**: Add environment variable in Vercel dashboard

### Debugging Steps

1. **Check Vercel logs**:
   ```bash
   vercel logs --follow
   ```

2. **Test connection locally**:
   ```bash
   npm run test:mongodb
   ```

3. **Verify environment variables**:
   - Check Vercel dashboard
   - Ensure variables are set for Production environment

4. **Check MongoDB Atlas**:
   - Verify cluster is running
   - Check Network Access settings
   - Verify database user exists

## 📊 Monitoring

### MongoDB Atlas Monitoring

1. **Go to your cluster**
2. **Click "Metrics"** tab
3. **Monitor**:
   - Connection count
   - Query performance
   - Storage usage

### Vercel Monitoring

1. **Go to your Vercel project**
2. **Click "Functions"** tab
3. **Monitor**:
   - Function execution time
   - Error rates
   - Memory usage

## 🔒 Security Best Practices

1. **Use strong passwords** for database users
2. **Rotate credentials** regularly
3. **Monitor access logs** in MongoDB Atlas
4. **Use connection pooling** (already configured)
5. **Keep connection strings secure** (never commit to Git)

## 📞 Support

- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com
- **Vercel Documentation**: https://vercel.com/docs
- **MongoDB Community**: https://community.mongodb.com

## ✅ Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Network Access configured (`0.0.0.0/0`)
- [ ] Database user created with proper permissions
- [ ] Connection string obtained and customized
- [ ] Local connection test successful
- [ ] Environment variables set in Vercel
- [ ] Application redeployed
- [ ] Health endpoint working
- [ ] API endpoints tested 