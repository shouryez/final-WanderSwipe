# Supabase OTP Configuration Guide

To enable proper OTP email authentication (6-digit codes instead of magic links), you need to configure your Supabase project settings:

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

## Step 2: Configure OTP Email Template

1. Find the **Magic Link** template
2. Change the email content to send OTP codes instead
3. Use this template:

\`\`\`html
<h2>Your Verification Code</h2>
<p>Your 6-digit verification code is:</p>
<h1 style="font-size: 32px; letter-spacing: 8px; font-family: monospace;">{{ .Token }}</h1>
<p>This code will expire in 60 minutes.</p>
<p>If you didn't request this code, please ignore this email.</p>
\`\`\`

## Step 3: Enable Email OTP in Auth Settings

1. Go to **Authentication** → **Providers** → **Email**
2. Make sure **Enable Email Provider** is ON
3. Set **Confirm Email** to ON (recommended for production)
4. Set **Secure Email Change** to ON (recommended)

## Step 4: Test the Configuration

1. Try signing up with a new email address
2. You should receive a 6-digit OTP code instead of a magic link
3. Enter the code on the verification page

## Environment Variables

Make sure these environment variables are set in your `.env.local`:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/explore
\`\`\`

## Troubleshooting

**Still receiving magic links instead of OTP codes?**
- Clear your browser cache and cookies
- Wait 5-10 minutes for Supabase configuration to propagate
- Check your spam folder
- Verify the email template was saved correctly

**OTP codes not working?**
- Ensure you're entering the code within 60 minutes
- Check that the email address matches exactly
- Try resending the code

For more information, visit the [Supabase Authentication Docs](https://supabase.com/docs/guides/auth).
