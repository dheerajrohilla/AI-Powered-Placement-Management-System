import crypto from 'crypto';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import TPO from '../models/TPO.js';
import jwt from 'jsonwebtoken';
import { sendPasswordResetOtpEmail } from '../services/emailService.js';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, additionalData } = req.body;

    const allowedRoles = ['student', 'company'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: 'Public registration is only available for student and company roles. Admin and TPO accounts must be provisioned by the system administrator.'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if student roll number exists
    if (role === 'student' && additionalData?.rollNumber) {
      const rollExists = await Student.findOne({ rollNumber: additionalData.rollNumber });
      if (rollExists) {
        return res.status(400).json({ error: 'A student with this Roll Number already exists' });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Create role-specific data with cleanup on failure
    try {
      if (role === 'student') {
        await Student.create({
          userId: user._id,
          rollNumber: additionalData?.rollNumber || `ROLL-${Date.now()}`,
          department: additionalData?.department || 'General',
          batch: additionalData?.batch || new Date().getFullYear().toString(),
          cgpa: additionalData?.cgpa != null ? Number(additionalData.cgpa) : 0,
          skills: Array.isArray(additionalData?.skills) ? additionalData.skills : [],
          bio: additionalData?.bio || ''
        });
      } else if (role === 'company') {
        await Company.create({
          userId: user._id,
          companyName: additionalData?.companyName || name,
          hrName: additionalData?.hrName || name,
          hrEmail: additionalData?.hrEmail || email,
          hrPhone: additionalData?.hrPhone || '',
          industry: additionalData?.industry || '',
          location: additionalData?.location || '',
          website: additionalData?.website || '',
          description: additionalData?.description || ''
        });
      } else if (role === 'tpo') {
        await TPO.create({
          userId: user._id,
          employeeId: additionalData?.employeeId || `EMP-${Date.now()}`,
          department: additionalData?.department || 'Training & Placement Office',
          designation: additionalData?.designation || 'Training & Placement Officer',
          phone: additionalData?.phone || ''
        });
      }
    } catch (profileErr) {
      await User.findByIdAndDelete(user._id);
      throw profileErr;
    }

    // Generate token
    const token = signToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      const keyName = Object.keys(error.keyValue || {})[0] || 'field';
      return res.status(400).json({ error: `An account with that ${keyName} already exists.` });
    }
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact system administrator.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = signToken(user._id, user.role);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide your email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Always respond with identical safe message to prevent email enumeration
    const genericResponse = {
      message: 'If an account exists, a 6-digit verification code and reset instructions have been sent to your registered email.'
    };

    if (!user) {
      return res.json(genericResponse);
    }

    // Generate secure 6-digit numeric OTP and 32-byte hex token
    const otp = crypto.randomInt(100000, 999999).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetOtp = crypto.createHash('sha256').update(otp).digest('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/login?mode=reset&email=${encodeURIComponent(user.email)}&token=${resetToken}`;

    // Dispatch dynamic HTML email with OTP
    try {
      await sendPasswordResetOtpEmail({
        to: user.email,
        name: user.name || 'Student / Member',
        otp,
        expiresInMinutes: 15,
        resetUrl
      });
    } catch (emailErr) {
      console.error('[AUTH WARNING] Email dispatch error in forgotPassword:', emailErr.message);
    }

    res.json(genericResponse);
  } catch (error) {
    console.error('[AUTH ERROR] forgotPassword failure:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');

    const user = await User.findOne({
      email: cleanEmail,
      passwordResetOtp: hashedOtp,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetOtp +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired 6-digit OTP code.' });
    }

    res.json({ valid: true, message: 'OTP verified successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, otp, password } = req.body;

    if (!email || (!token && !otp) || !password) {
      return res.status(400).json({ error: 'Email, verification code/token, and new password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const query = {
      email: cleanEmail,
      passwordResetExpires: { $gt: Date.now() }
    };

    if (otp) {
      query.passwordResetOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    } else if (token) {
      query.passwordResetToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
    }

    const user = await User.findOne(query).select('+passwordResetToken +passwordResetOtp +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification code / reset token.' });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetOtp = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful! You can now sign in with your new password.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

