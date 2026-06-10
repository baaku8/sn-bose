

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    select: false // Prevents the password from being returned in API responses by default
  },
  profileImage: {
    type: String,
    default: '' // Can be updated with an AWS S3 or Cloudinary URL later
  },
  dob: {
    type: Date // Stored as a standard Date object (e.g., '2003-05-15')
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  college: {
    type: String,
    trim: true,
    default: ''
  },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    leetcode: { type: String, default: '' }
  },
  isAvailable: {
    type: Boolean,
    default: true // Users are actively looking by default upon sign up
  },
  previousWorks: [{
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project', // Links this ID to the 'Project' database collection
      required: true
    },
    active: {
      type: Boolean,
      default: false // e.g., false = completed project, true = currently working on it
    }
  }]
}, {
  timestamps: true // Automatically manages the 'createdAt' and 'updatedAt' fields
});

// Compound Index: Optimizes the matchmaking search engine
// This makes queries like "Find available users who know React" lightning fast
userSchema.index({ isAvailable: 1, skills: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);

