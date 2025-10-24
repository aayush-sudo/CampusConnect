import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Post from './models/Post.js';
import Request from './models/Request.js';
import Chat from './models/Chat.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Request.deleteMany({});
    await Chat.deleteMany({});

    // Create users
    const users = [
      {
        firstName: 'Aayush',
        lastName: 'Hardas',
        email: 'aayush.hardas@somaiya.edu',
        username: 'aayush_hardas',
        university: 'Somaiya Vidyavihar University',
        major: 'Computer Science',
        password: await bcrypt.hash('password123', 10),
        avatar: '/placeholder.svg'
      },
      {
        firstName: 'Aditya',
        lastName: 'Sontakke',
        email: 'aditya.sontakke@somaiya.edu',
        username: 'aditya_sontakke',
        university: 'Somaiya Vidyavihar University',
        major: 'Computer Science',
        password: await bcrypt.hash('password123', 10),
        avatar: '/placeholder.svg'
      },
      {
        firstName: 'Anirudh',
        lastName: 'Navuduri',
        email: 'anirudh.navuduri@somaiya.edu',
        username: 'anirudh_navuduri',
        university: 'Somaiya Vidyavihar University',
        major: 'Chemistry',
        password: await bcrypt.hash('password123', 10),
        avatar: '/placeholder.svg'
      },
      {
        firstName: 'Arya',
        lastName: 'Patil',
        email: 'arya.patil@somaiya.edu',
        username: 'arya_patil',
        university: 'Somaiya Vidyavihar University',
        major: 'Mathematics',
        password: await bcrypt.hash('password123', 10),
        avatar: '/placeholder.svg'
      },
      {
        firstName: 'Aarush',
        lastName: 'Jain',
        email: 'aarush.jain@somaiya.edu',
        username: 'aarush_jain',
        university: 'Somaiya Vidyavihar University',
        major: 'Computer Science',
        password: await bcrypt.hash('password123', 10),
        avatar: '/placeholder.svg'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Created users:', createdUsers.length);

    // Create posts
    const posts = [
      {
        title: 'Data Structures Cheat Sheet',
        description: 'Complete guide with examples, time complexities, and implementation details for all major data structures.',
        category: 'Programming',
        tags: ['algorithms', 'coding', 'computer-science'],
        author: createdUsers[0]._id,
        authorName: 'Aayush Hardas',
        fileType: 'PDF',
        likes: 24,
        downloads: 156,
        views: 340
      },
      {
        title: 'Physics Lab Report Template',
        description: 'Professional template for physics lab reports with proper formatting and structure.',
        category: 'Physics',
        tags: ['lab-report', 'template', 'physics'],
        author: createdUsers[1]._id,
        authorName: 'Aditya Sontakke',
        fileType: 'DOC',
        likes: 18,
        downloads: 89,
        views: 210
      },
      {
        title: 'Calculus Study Guide',
        description: 'Comprehensive study guide covering derivatives, integrals, and applications.',
        category: 'Mathematics',
        tags: ['calculus', 'math', 'study-guide'],
        author: createdUsers[2]._id,
        authorName: 'Anirudh Navuduri',
        fileType: 'PDF',
        likes: 31,
        downloads: 203,
        views: 450
      },
      {
        title: 'Complete React.js Tutorial Series',
        description: 'Step-by-step guide to building modern web applications with React, including hooks and context.',
        category: 'Programming',
        tags: ['react', 'javascript', 'web-development'],
        author: createdUsers[0]._id,
        authorName: 'Aayush Hardas',
        fileType: 'VIDEO',
        likes: 145,
        downloads: 567,
        views: 1240
      },
      {
        title: 'Linear Algebra Study Guide',
        description: 'Essential concepts in linear algebra with solved examples and practice problems.',
        category: 'Mathematics',
        tags: ['linear-algebra', 'matrices', 'vectors'],
        author: createdUsers[1]._id,
        authorName: 'Aditya Sontakke',
        fileType: 'PDF',
        likes: 98,
        downloads: 234,
        views: 890
      },
      {
        title: 'Psychology Research Methods Notes',
        description: 'Comprehensive notes on research methodologies in psychology, including statistical analysis.',
        category: 'Other',
        tags: ['research', 'statistics', 'psychology'],
        author: createdUsers[2]._id,
        authorName: 'Anirudh Navuduri',
        fileType: 'PDF',
        likes: 76,
        downloads: 167,
        views: 560
      }
    ];

    const createdPosts = await Post.insertMany(posts);
    console.log('Created posts:', createdPosts.length);

    // Create requests
    const requests = [
      {
        title: 'Looking for Machine Learning Study Partner',
        description: 'Need someone to practice coding interviews and ML concepts with. Available weekends.',
        requester: createdUsers[0]._id,
        requesterName: 'Aayush Hardas',
        requesterDetails: {
          year: '3rd Year',
          major: 'Computer Science',
          avatar: '/placeholder.svg'
        },
        category: 'Study Partner',
        urgency: 'medium',
        location: 'Library Study Room',
        tags: ['machine-learning', 'coding', 'interviews'],
        responseCount: 0
      },
      {
        title: 'Need Data Structures Assignment Help',
        description: 'Struggling with binary trees and graph algorithms. Looking for tutoring or study group.',
        requester: createdUsers[1]._id,
        requesterName: 'Aditya Sontakke',
        requesterDetails: {
          year: '2nd Year',
          major: 'Computer Science',
          avatar: '/placeholder.svg'
        },
        category: 'Tutoring',
        urgency: 'high',
        location: 'Computer Lab',
        tags: ['data-structures', 'algorithms', 'tutoring'],
        responseCount: 2
      },
      {
        title: 'Organic Chemistry Lab Report Examples',
        description: 'Looking for well-formatted lab report examples for organic chemistry course.',
        requester: createdUsers[2]._id,
        requesterName: 'Anirudh Navuduri',
        requesterDetails: {
          year: '2nd Year',
          major: 'Chemistry',
          avatar: '/placeholder.svg'
        },
        category: 'Study Material',
        urgency: 'medium',
        location: 'Chemistry Building',
        tags: ['chemistry', 'lab-report', 'examples'],
        responseCount: 1
      },
      {
        title: 'Linear Algebra Study Group',
        description: 'Starting a study group for linear algebra. Meeting twice a week before midterm.',
        requester: createdUsers[3]._id,
        requesterName: 'Arya Patil',
        requesterDetails: {
          year: '1st Year',
          major: 'Mathematics',
          avatar: '/placeholder.svg'
        },
        category: 'Study Group',
        urgency: 'low',
        location: 'Math Building',
        tags: ['linear-algebra', 'study-group', 'midterm'],
        responseCount: 3
      },
      {
        title: 'React.js Project Team Member Needed',
        description: 'Working on a web app project for CS course. Need someone with React/Node.js experience.',
        requester: createdUsers[4]._id,
        requesterName: 'Aarush Jain',
        requesterDetails: {
          year: '3rd Year',
          major: 'Computer Science',
          avatar: '/placeholder.svg'
        },
        category: 'Project Team',
        urgency: 'high',
        location: 'Innovation Hub',
        tags: ['react', 'nodejs', 'web-development', 'project'],
        responseCount: 4
      }
    ];

    const createdRequests = await Request.insertMany(requests);
    console.log('Created requests:', createdRequests.length);

    // Create chats
    const chats = [
      {
        title: 'ML Study Group',
        description: 'Machine Learning study group for CS students',
        participants: [
          {
            user: createdUsers[1]._id,
            userName: 'Aditya Sontakke'
          },
          {
            user: createdUsers[0]._id,
            userName: 'Aayush Hardas'
          },
          {
            user: createdUsers[2]._id,
            userName: 'Anirudh Navuduri'
          }
        ],
        type: 'group',
        createdBy: createdUsers[1]._id,
        messages: [
          {
            sender: createdUsers[2]._id,
            senderName: 'Anirudh Navuduri',
            content: 'Hey everyone! Are we still meeting tomorrow to go over the ML assignment?',
            avatar: '/placeholder.svg'
          },
          {
            sender: createdUsers[1]._id,
            senderName: 'Aditya Sontakke',
            content: 'Yes! I will be there. I have prepared some notes on neural networks.',
            avatar: '/placeholder.svg'
          },
          {
            sender: createdUsers[0]._id,
            senderName: 'Aayush Hardas',
            content: 'Perfect! I am working on the data preprocessing part. Should we divide the topics?',
            avatar: '/placeholder.svg'
          }
        ],
        lastMessage: {
          content: 'Perfect! I am working on the data preprocessing part. Should we divide the topics?',
          timestamp: new Date(),
          sender: 'Aayush Hardas'
        }
      },
      {
        title: 'React Project Team',
        description: 'React.js project collaboration',
        participants: [
          {
            user: createdUsers[1]._id,
            userName: 'Aditya Sontakke'
          },
          {
            user: createdUsers[0]._id,
            userName: 'Aayush Hardas'
          },
          {
            user: createdUsers[2]._id,
            userName: 'Anirudh Navuduri'
          }
        ],
        type: 'group',
        createdBy: createdUsers[0]._id,
        messages: [
          {
            sender: createdUsers[0]._id,
            senderName: 'Aayush Hardas',
            content: 'I have pushed the latest changes to GitHub',
            avatar: '/placeholder.svg'
          }
        ],
        lastMessage: {
          content: 'I have pushed the latest changes to GitHub',
          timestamp: new Date(),
          sender: 'Aayush Hardas'
        }
      }
    ];

    const createdChats = await Chat.insertMany(chats);
    console.log('Created chats:', createdChats.length);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
