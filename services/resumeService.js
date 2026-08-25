/** @type {import('mongoose').Model<any>} */
const Resume = require('../models/Resume');

class ResumeService {
    async getResumeById(resumeId, userId) {
        return await Resume.findOne({ _id: resumeId, userId }).lean();
    }

    async createDefaultResume(userId, title = 'New Resume') {
        return await Resume.create({
            userId,
            title,
            basics: { name: '', label: '', email: '' }
        });
    }

    // Merges partial updates coming directly from Qwen 2.5 streaming parser
    async updateResumeSection(resumeId, userId, section, data) {
        const updatePath = section === 'basics' ? 'basics' : section;

        return await Resume.findOneAndUpdate(
            { _id: resumeId, userId },
            { $set: { [updatePath]: data } },
            { new: true, runValidators: true }
        );
    }

    async appendArrayItem(resumeId, userId, section, item) {
        return await Resume.findOneAndUpdate(
            { _id: resumeId, userId },
            { $push: { [section]: item } },
            { new: true, runValidators: true }
        );
    }
}

module.exports = new ResumeService();