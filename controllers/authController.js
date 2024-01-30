const User = require("../models/userModels");
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const sendEmail = require('../controllers/emailController')
const crypto = require('crypto');


const createUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, mobile, password, role } = req.body;

  try {
    // Check if the role is valid and authorized for registration
    if (role && !['user', 'moderator'].includes(role)) {
      throw new Error('Invalid role for registration');
    }

    const findUser = await User.findOne({ email });

    if (!findUser) {
      // Only set the role if it's provided and valid, otherwise use the default "user" role
      const newUser = await User.create({ firstname, lastname, email, mobile, password, role: role || 'user' });
      res.json(newUser);
    } else {
      throw new Error('User Already Exists');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Login a user
const Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  const foundUser = await User.findOne({ email: email }).exec();
  if (!foundUser || foundUser.isBlocked) return res.sendStatus(401); //Unauthorized 

  // Evaluate password 
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    // Create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser._id,
          email: foundUser.email,
          role: foundUser.role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' } // Change the expiration time to a more reasonable value
    );
  
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Save the refreshToken in the user's document (you may want to change how you store multiple refresh tokens)
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Creates Secure Cookie with refresh token
    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

    // Send authorization roles and access token to user
    res.json({ role:foundUser.role,accessToken });
  } else {
    res.sendStatus(401);
  }
};
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  const foundUser = await User.findOne({ email: email }).exec();
  if (!foundUser || foundUser.isBlocked) return res.sendStatus(401); // Unauthorized

  // Evaluate password 
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    if (foundUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access forbidden. User is not an admin.' });
    }

    // Create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser._id,
          email: foundUser.email,
          role: foundUser.role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' } // Change the expiration time to a more reasonable value
    );
  
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Save the refreshToken in the user's document (you may want to change how you store multiple refresh tokens)
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Creates Secure Cookie with refresh token
    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

    // Send authorization roles and access token to user
    res.json({ role: foundUser.role, accessToken });
  } else {
    res.sendStatus(401);
  }
};


const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // Assuming you've set the user ID in req.user from the JWT

  try {
    // Find the user by ID
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the provided current password matches the stored password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//Forgot password


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate a password reset token and its expiration time
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour (3600000 milliseconds)

    // Save the reset token and its expiration time in the user's document
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Send the password reset email to the user
    const resetUrl = `https://your-frontend-url/reset-password?token=${resetToken}`;
    const emailData = {
      to: email,
      subject: 'Password Reset Request',
      text: `Please click on the following link to reset your password: ${resetUrl}`,
    };

    await sendEmail(emailData);

    res.status(200).json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ error: 'Error sending password reset email.' });
  }
};
//reset password
const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const {token} = req.params
  try {
    // Find the user with the provided reset token and ensure it's not expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password with the hashed new password
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error resetting password.' });
  }
};

// refresh token
const RefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); //Forbidden 
  // evaluate jwt 
  jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
          if (err || foundUser.email !== decoded.email) return res.sendStatus(403);
          const accessToken = jwt.sign(
              {
                  "UserInfo": {
                    id: foundUser._id,
                    email: foundUser.email,
                    role: foundUser.role,
                  }
              },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: '15m' }
          );
          res.json({ role:foundUser.role, accessToken })
      }
  );
}
// logout
const Logout = async (req, res) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
      return res.sendStatus(204);
  }
  // Delete refreshToken in db
try {
  foundUser.refreshToken = '';
  const result = await foundUser.save();
  console.log(result);
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.status(200).json({ message: "Logged out successfully." });
} catch (error) {
  return res.status(500).json({ error: error.message });
}
  
}

module.exports = {
  createUser,
  Login,
  adminLogin,
  changePassword,
  forgotPassword,
  resetPassword,
  RefreshToken,
  Logout
};