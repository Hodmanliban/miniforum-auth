// src/controllers/updatePrivacyController.js
// Handles updating user privacy settings

import User from '../models/User.js';

export const updatePrivacy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isPrivate } = req.body;

    if (typeof isPrivate !== 'boolean') {
      return res.status(400).json({ message: 'isPrivate must be a boolean.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isPrivate },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Privacy setting updated.',
      user: {
        id: user._id,
        isPrivate: user.isPrivate,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export default updatePrivacy;