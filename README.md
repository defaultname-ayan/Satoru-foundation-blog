# Satoru Blog


A modern, full-stack blog platform built with **Next.js 15**, **MongoDB**, and **NextAuth** for authentication. This project offers a robust, secure, and sleek content management system for bloggers with an intuitive admin dashboard and a beautiful public-facing blog.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [Authentication & Security](#authentication--security)
- [Usage](#usage)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Admin Panel**
  - Secure login with NextAuth and credentials provider
  - Dashboard with statistics and recent activity
  - Create, edit, publish/unpublish, and delete blog posts
  - Manage post tags, featured images, and description
  - Efficient search and filter posts by status and tags

- **Public Blog**
  - List of published blog posts with pagination
  - Full read posts with rich content and images
  - Tag filtering and search
  - Related posts suggestions based on tags
  - View count tracking for popularity insights
  - Responsive design optimized for mobile and desktop

---

## Tech Stack

- **Frontend & Backend:**  
  [Next.js 15](https://nextjs.org/) - React framework with App Router for server components and routing

- **Database:**  
  [MongoDB](https://www.mongodb.com/) with Mongoose ODM for schema-driven database interaction

- **Authentication:**  
  [NextAuth.js](https://next-auth.js.org/) for session handling and secure authentication with credentials provider

- **Styling:**  
  [Tailwind CSS](https://tailwindcss.com/) for utility-first, responsive styling  

- **API:**  
  RESTful API routes built with Next.js App Router API handlers (GET, POST, PUT, DELETE)

- **Deployment Ready:**  
  Optimized for static and server-side rendering, compatible with Vercel, Netlify, Railway, etc.

---

## Installation

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas or local MongoDB instance
- npm or yarn package manager

### Setup

1. **Clone the repository:**
git clone https://github.com/yourusername/satoru-blog.git
cd satoru-blog



2. **Install dependencies:**
npm install

or
yarn



3. **Configure environment variables:**  
Create a `.env.local` file at the project root with the following variables:
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
ADMIN_EMAIL=admin@blog.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Blog Administrator



4. **Seed admin user:**
npm run seed:admin

or
yarn seed:admin



---

## Development

Start the development server:

npm run dev

or
yarn dev



- Open [http://localhost:3000](http://localhost:3000) to view the public blog
- Admin panel login at [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Authentication & Security

- User sessions are managed with JWT tokens through NextAuth.js
- Passwords are hashed with bcryptjs before storage
- Admin panel is restricted to authenticated users with admin roles
- API routes are protected and return 401 Unauthorized if accessed without proper auth

---

## Usage

- **Public users:**  
  View published posts, search by tags or keywords, and read full blog entries with related content.

- **Administrators:**  
  Login securely, create and manage blog posts, monitor views and stats on dashboard, and publish or draft posts as needed.

---

## Deployment

The app is production-ready and can be deployed to platforms like Vercel or Netlify.

**Recommended deployment steps:**

- Set environment variables on your hosting provider
- Use production MongoDB URI (Atlas recommended)
- Run build script:  
npm run build
npm start


- Set `NEXTAUTH_URL` to your deployed domain

---

## Future Enhancements

- Comments integration (Disqus, custom)
- Image upload and media management
- Dark mode and UI themes
- RSS feeds and newsletter signup
- Full-text search with Algolia or ElasticSearch

---

## Contributing

Contributions, issues, and feature requests are welcome!

Feel free to submit a pull request or open an issue.

---

## License

This project is licensed under the MIT License.

---

## Contact

Created by Your Name - [your.email@example.com](mailto:your.email@example.com)

[GitHub Profile](https://github.com/yourusername)

---

Thank you for checking out the Satoru Blog! 🚀
