# User Authentication System

A secure user authentication system built with Next.js, NextAuth.js, and Neon Postgres.

## 🎯 Features

- ✅ **Clean Login Page** - Simple, modern login form with glassmorphism design
- ✅ **User Registration** - Secure account creation with password validation
- ✅ **Password Hashing** - Bcrypt encryption for maximum security
- ✅ **Session Management** - JWT-based authentication with NextAuth.js
- ✅ **Protected Routes** - Dashboard accessible only to authenticated users
- ✅ **Neon Postgres** - Cloud database integration
- ✅ **Modern UI** - Beautiful design with gradients and animations

## 🚀 Setup Instructions

### 1. Environment Variables

You need to add the following environment variable to your `.env.local` file:

```bash
# This should already be set from Vercel/Neon integration
DATABASE_URL="your-neon-database-url"

# Generate a random secret for NextAuth
# You can generate one by running: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here"

# For local development
NEXTAUTH_URL="http://localhost:3000"

# For production (Vercel will set this automatically)
# NEXTAUTH_URL="https://your-domain.vercel.app"
```

### 2. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env.local` file as `NEXTAUTH_SECRET`.

### 3. Set up the Database

Run the database setup script to create the users table:

```bash
npm run db:setup
```

This will create the `users` table in your Neon database with the following schema:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### 4. Add Environment Variables to Vercel

For production deployment, add these environment variables in your Vercel project settings:

1. Go to https://vercel.com/jon-gednys-projects/youtube-channel/settings/environment-variables
2. Add `NEXTAUTH_SECRET` (use the same value from step 2)
3. Add `NEXTAUTH_URL` with your production URL (e.g., `https://youtube-channel-omega.vercel.app`)
4. `DATABASE_URL` should already be set from the Neon integration

### 5. Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the login page.

## 📱 Usage

### Creating an Account

1. Visit the homepage (login page)
2. Click "Create one" link
3. Enter your email and password (minimum 8 characters)
4. Confirm your password
5. Click "Create Account"
6. You'll be redirected to the login page

### Logging In

1. Enter your email and password
2. Click "Sign In"
3. You'll be redirected to the dashboard

### Dashboard

After logging in, you'll see:
- Welcome message with your email
- Authentication status
- System features overview
- Sign out button

## 🗂️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts          # NextAuth configuration
│   │       └── register/
│   │           └── route.ts          # Registration API endpoint
│   ├── dashboard/
│   │   └── page.tsx                  # Protected dashboard page
│   ├── register/
│   │   └── page.tsx                  # Registration page
│   ├── page.tsx                      # Login page (homepage)
│   ├── layout.tsx                    # Root layout with AuthProvider
│   ├── providers.tsx                 # NextAuth SessionProvider wrapper
│   └── globals.css                   # Design system & styles
├── db/
│   ├── index.ts                      # Database connection
│   └── schema.ts                     # Database schema (users table)
└── scripts/
    └── setup-db.ts                   # Database setup script
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with a cost factor of 10
- **Email Uniqueness**: Duplicate email addresses are prevented at the database level
- **Input Validation**: Email format and password length validation
- **Session Security**: JWT tokens with secure secret
- **Protected Routes**: Dashboard requires authentication
- **HTTPS Only**: Production cookies are secure and HTTP-only

## 🎨 Design System

The application uses a modern design system with:

- **Dark Theme**: Professional dark background with vibrant accents
- **Glassmorphism**: Frosted glass effects on cards and navigation
- **Gradient Text**: Eye-catching purple-to-blue gradients
- **Smooth Animations**: Fade-in, slide, and hover effects
- **Custom Colors**: Purple (#8b5cf6), Blue (#38bdf8), Pink (#ec4899)
- **Typography**: Inter for body text, Space Grotesk for headings

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5 (beta)
- **Database**: Neon Postgres
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + Custom CSS
- **Password Hashing**: bcryptjs
- **TypeScript**: Full type safety

## 📝 Next Steps

Now that authentication is set up, you can:

1. Add more user fields (name, profile picture, etc.)
2. Implement password reset functionality
3. Add email verification
4. Create user profile pages
5. Add role-based access control (admin, user, etc.)
6. Build your application features in the dashboard

## 🐛 Troubleshooting

### "NEXTAUTH_SECRET is not set" error

Make sure you've added `NEXTAUTH_SECRET` to your `.env.local` file.

### "DATABASE_URL is not set" error

Check that your `.env.local` file contains the `DATABASE_URL` from Neon.

### Can't log in after registration

Make sure the database setup script ran successfully and the users table was created.

### Redirect loop on login

Verify that `NEXTAUTH_URL` matches your current environment (localhost for dev, your domain for production).

## 📄 License

This project is private and proprietary.
