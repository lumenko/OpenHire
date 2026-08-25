// models/Resume.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    region: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    countryCode: { type: String, trim: true, uppercase: true, maxlength: 2 }
}, { _id: false });

const WorkSchema = new mongoose.Schema({
    company: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    startDate: { type: String, trim: true }, // Format: YYYY-MM
    endDate: { type: String, trim: true },   // Format: YYYY-MM or 'Present'
    isCurrent: { type: Boolean, default: false },
    summary: { type: String, trim: true },
    highlights: [{ type: String, trim: true }]
});

const EducationSchema = new mongoose.Schema({
    institution: { type: String, required: true, trim: true },
    area: { type: String, trim: true },       // e.g., "Computer Science"
    studyType: { type: String, trim: true },  // e.g., "B.S.", "Master"
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    score: { type: String, trim: true },      // e.g., "GPA 3.8/4.0"
    courses: [{ type: String, trim: true }]
});

const SkillSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }, // e.g., "Node.js"
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master', ''],
        default: ''
    },
    keywords: [{ type: String, trim: true }]
});

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
    keywords: [{ type: String, trim: true }],
    url: { type: String, trim: true }
});

const CertificationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    issuer: { type: String, trim: true },
    date: { type: String, trim: true },
    url: { type: String, trim: true }
});

const ResumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        default: 'Untitled CV',
        trim: true
    },
    basics: {
        name: { type: String, trim: true, default: '' },
        label: { type: String, trim: true, default: '' }, // e.g., Senior Backend Engineer
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        url: { type: String, trim: true },
        summary: { type: String, trim: true },
        location: LocationSchema,
        profiles: [{
            network: { type: String, trim: true }, // e.g., LinkedIn, GitHub
            username: { type: String, trim: true },
            url: { type: String, trim: true }
        }]
    },
    work: [WorkSchema],
    education: [EducationSchema],
    skills: [SkillSchema],
    projects: [ProjectSchema],
    certifications: [CertificationSchema],
    languages: [{
        language: { type: String, trim: true },
        fluency: { type: String, trim: true }
    }],
    template: {
        type: String,
        default: 'modern',
        enum: ['modern', 'minimal', 'classic', 'executive']
    }
}, {
    timestamps: true
});

// Compound index for user query performance
ResumeSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Resume', ResumeSchema);