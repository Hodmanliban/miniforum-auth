import mongoose from "mongoose";
import bcrypt from "bcrypt";

const consentLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['marketing', 'analytics'],
        required: true
    },
    action: {
        type: String,
        enum: ['granted', 'withdrawn'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    userAgent: String
}, { _id: false });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    // ✅ NYA FÄLT FÖR PROFILE
    isPrivate: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        maxLength: 150,
        default: ""
    },
    profilePicture: {
        type: String,
        default: ""
    },
    // ...existing fields...
    consents: {
        marketing: {
            type: Boolean,
            default: false
        },
        analytics: {
            type: Boolean,
            default: false
        },
        required: {
            type: Boolean,
            default: true
        }
    },
    consentLogs: [consentLogSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
});

// ...existing methods...

userSchema.methods.setPassword = async function (password) {
    const saltRounds = 12;
    this.passwordHash = await bcrypt.hash(password, saltRounds);
};

userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        email: this.email,
        name: this.name,
        bio: this.bio,                    // ✅ LÄGG TILL
        profilePicture: this.profilePicture, // ✅ LÄGG TILL
        isPrivate: this.isPrivate,        // ✅ LÄGG TILL
        consents: this.consents,
        consentLogs: this.consentLogs,
        createdAt: this.createdAt,
        lastLoginAt: this.lastLoginAt
    };
};

const User = mongoose.model("User", userSchema);

export default User;