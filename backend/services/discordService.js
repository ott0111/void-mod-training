const config = require('../config');

class DiscordService {
  constructor(discordBot, database) {
    this.bot = discordBot;
    this.db = database;
  }

  async assignModeratorRoles(userId) {
    try {
      console.log(`Assigning moderator roles to user ${userId}`);
      
      // Get the role IDs from config
      const roleIds = [
        config.ROLES.TRIAL_MOD,
        config.ROLES.STAFF_ACCESS,
        config.ROLES.TICKET_SUPPORT
      ].filter(roleId => roleId); // Filter out any undefined values

      if (roleIds.length === 0) {
        throw new Error('No valid role IDs configured');
      }

      // Assign roles using the bot
      const result = await this.bot.assignRoles(userId, roleIds);
      
      // Record role assignments in database
      for (const roleId of roleIds) {
        const roleName = this.getRoleNameById(roleId);
        await this.db.recordRoleAssignment(
          await this.getUserIdByDiscordId(userId),
          roleId,
          roleName,
          'quiz_pass'
        );
      }

      // Send congratulatory message to user
      await this.sendCongratulatoryMessage(userId);

      return {
        success: true,
        assignedRoles: result.assignedRoles,
        message: `Successfully assigned ${result.assignedRoles.length} moderator roles`
      };
    } catch (error) {
      console.error('Error assigning moderator roles:', error);
      throw error;
    }
  }

  async sendCongratulatoryMessage(userId) {
    const message = `
🎉 **Congratulations!** 🎉

You have successfully passed the Void Esports Moderator Training!

**Roles Assigned:**
• Trial Mod
• Staff Access
• Ticket Support

**Next Steps:**
1. Familiarize yourself with the staff channels
2. Review the moderator guidelines again
3. Start with supervised ticket handling
4. Ask senior staff for guidance when needed

**Important:**
- Maintain professionalism in all interactions
- Follow the protocols you learned in training
- Document your actions properly
- Don't hesitate to ask for help

Welcome to the Void Esports moderation team! 🚀
    `;

    const success = await this.bot.sendMessageToUser(userId, message);
    if (!success) {
      console.warn(`Failed to send congratulatory message to user ${userId}`);
    }
  }

  async sendFailureMessage(userId, score, totalQuestions) {
    const message = `
❌ **Quiz Results** ❌

Unfortunately, you did not pass the moderator training quiz.

**Your Score:** ${score}/${totalQuestions}
**Required to Pass:** ${config.QUIZ_PASSING_SCORE}/${config.QUIZ_TOTAL_QUESTIONS}

**What happens now:**
- You can retake the quiz after 24 hours
- Review the training materials carefully
- Pay special attention to:
  • Ticket handling procedures
  • Role requirements
  • Performance metrics
  • Professional communication

**Study Tips:**
- Review all training sections thoroughly
- Take notes on important protocols
- Understand the different roster categories
- Memorize the required commands

You can try again tomorrow. Good luck! 📚
    `;

    const success = await this.bot.sendMessageToUser(userId, message);
    if (!success) {
      console.warn(`Failed to send failure message to user ${userId}`);
    }
  }

  async validateUserInGuild(userId) {
    try {
      const member = await this.bot.getGuildMember(userId);
      return member !== null;
    } catch (error) {
      console.error('Error validating user in guild:', error);
      return false;
    }
  }

  async getUserRoles(userId) {
    try {
      const member = await this.bot.getGuildMember(userId);
      if (!member) {
        return [];
      }
      return member.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        position: role.position
      }));
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  async hasRequiredRoles(userId) {
    const userRoles = await this.getUserRoles(userId);
    const requiredRoleIds = [
      config.ROLES.TRIAL_MOD,
      config.ROLES.STAFF_ACCESS,
      config.ROLES.TICKET_SUPPORT
    ].filter(roleId => roleId);

    return requiredRoleIds.some(roleId => 
      userRoles.some(userRole => userRole.id === roleId)
    );
  }

  async getUserIdByDiscordId(discordId) {
    try {
      const user = await this.db.getUserByDiscordId(discordId);
      return user ? user.id : null;
    } catch (error) {
      console.error('Error getting user ID by Discord ID:', error);
      return null;
    }
  }

  getRoleNameById(roleId) {
    const roleNames = {
      [config.ROLES.TRIAL_MOD]: 'Trial Mod',
      [config.ROLES.STAFF_ACCESS]: 'Staff Access',
      [config.ROLES.TICKET_SUPPORT]: 'Ticket Support'
    };
    return roleNames[roleId] || 'Unknown Role';
  }

  async notifySeniorStaff(newUser, quizScore) {
    // This could send a notification to a staff channel
    // Implementation depends on your Discord server setup
    const message = `
📋 **New Moderator Certified**

**User:** <@${newUser.discord_id}>
**Quiz Score:** ${quizScore}/${config.QUIZ_TOTAL_QUESTIONS}
**Certification Date:** ${new Date().toLocaleString()}

Please welcome the new moderator and provide guidance as needed.
    `;

    // You would need to configure a staff channel ID for this
    // await this.bot.sendToStaffChannel(message);
    console.log('New moderator certified:', newUser.discord_id, 'Score:', quizScore);
  }

  async revokeModeratorRoles(userId) {
    try {
      console.log(`Revoking moderator roles from user ${userId}`);
      
      const roleIds = [
        config.ROLES.TRIAL_MOD,
        config.ROLES.STAFF_ACCESS,
        config.ROLES.TICKET_SUPPORT
      ].filter(roleId => roleId);

      const result = await this.bot.removeRoles(userId, roleIds);
      
      return {
        success: true,
        removedRoles: result.removedRoles,
        message: `Successfully removed ${result.removedRoles.length} moderator roles`
      };
    } catch (error) {
      console.error('Error revoking moderator roles:', error);
      throw error;
    }
  }

  async isUserInGuild(userId) {
    try {
      const member = await this.bot.getGuildMember(userId);
      return member !== null;
    } catch (error) {
      return false;
    }
  }

  async getUserInfo(userId) {
    try {
      const member = await this.bot.getGuildMember(userId);
      if (!member) {
        return null;
      }

      return {
        id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator,
        avatar: member.user.avatarURL(),
        joinedAt: member.joinedAt,
        roles: member.roles.cache.map(role => ({
          id: role.id,
          name: role.name,
          position: role.position
        }))
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }
}

module.exports = DiscordService;
