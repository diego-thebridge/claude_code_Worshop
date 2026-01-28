// users.controller.js
// HTTP handlers for user-related endpoints

const userService = require('../services/users.service');

class UsersController {
  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove sensitive fields
      const { password_hash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  }

  async getAllUsers(req, res) {
    try {
      // 🐛 INTENTIONAL VULNERABILITY: Missing authorization check
      // This endpoint should verify the requesting user is an admin
      // Currently anyone authenticated can list all users

      const users = await userService.getAllUsers();

      // Remove passwords
      const safeUsers = users.map(user => {
        const { password_hash, ...safeUser } = user;
        return safeUser;
      });

      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  // 🐛 INTENTIONAL VULNERABILITY: No input validation
  async updateProfile(req, res) {
    try {
      const { email, name, phone } = req.body;

      // BAD: No validation on user input
      // Email could be invalid, name could be empty, phone could be malformed
      // Also no sanitization against XSS or injection

      const updatedUser = await userService.updateUser(req.userId, {
        email,
        name,
        phone
      });

      const { password_hash, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // FIX (for reference, don't use in workshop):
  /*
  async updateProfile(req, res) {
    try {
      const { email, name, phone } = req.body;

      // Validate input
      if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters' });
      }

      if (phone && !phone.match(/^\+?[\d\s-()]+$/)) {
        return res.status(400).json({ error: 'Invalid phone number' });
      }

      // Sanitize input
      const sanitizedData = {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone ? phone.trim() : null
      };

      const updatedUser = await userService.updateUser(req.userId, sanitizedData);

      const { password_hash, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
  */

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Verify user is admin or deleting their own account
      if (req.user.role !== 'admin' && req.userId !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}

module.exports = new UsersController();
