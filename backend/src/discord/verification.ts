import axios from 'axios';
import { DiscordVerificationRequest, DiscordVerificationResponse } from '../../../shared/types';

export class DiscordVerificationService {
  private botToken: string;
  private guildId: string;

  constructor() {
    this.botToken = process.env.DISCORD_BOT_TOKEN || '';
    this.guildId = process.env.DISCORD_GUILD_ID || '';
    
    if (!this.botToken || !this.guildId) {
      console.warn('Discord bot token or guild ID not configured');
    }
  }

  /**
   * Verify if a user is a member of the Discord server
   */
  async verifyUserMembership(request: DiscordVerificationRequest): Promise<DiscordVerificationResponse> {
    try {
      if (!this.botToken || !this.guildId) {
        return {
          success: false,
          isMember: false,
          message: 'Discord verification service not configured',
        };
      }

      // First, validate the Discord User ID format
      if (!this.isValidDiscordUserId(request.discordUserId)) {
        return {
          success: false,
          isMember: false,
          message: 'Invalid Discord User ID format',
        };
      }

      // Check if user is in the guild
      const isMember = await this.checkGuildMembership(request.discordUserId);
      
      if (!isMember) {
        return {
          success: true,
          isMember: false,
          message: 'You must be a member of the Void Discord server to access this certification.',
        };
      }

      // Get user information from Discord API
      const userInfo = await this.getUserInfo(request.discordUserId);
      
      if (!userInfo) {
        return {
          success: false,
          isMember: false,
          message: 'Unable to retrieve user information from Discord',
        };
      }

      // Verify the username matches (case-insensitive)
      if (userInfo.username.toLowerCase() !== request.discordUsername.toLowerCase()) {
        return {
          success: false,
          isMember: false,
          message: 'Discord username does not match our records',
        };
      }

      return {
        success: true,
        isMember: true,
        message: 'User verified successfully',
        user: {
          id: userInfo.id,
          discordUserId: userInfo.id,
          discordUsername: `${userInfo.username}${userInfo.discriminator !== '0' ? `#${userInfo.discriminator}` : ''}`,
          isVerified: true,
          isCertified: false,
          role: 'trainee',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

    } catch (error) {
      console.error('Discord verification error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            success: false,
            isMember: false,
            message: 'User not found in Discord',
          };
        } else if (error.response?.status === 401) {
          return {
            success: false,
            isMember: false,
            message: 'Discord bot authentication failed',
          };
        } else if (error.response?.status === 403) {
          return {
            success: false,
            isMember: false,
            message: 'Bot lacks required permissions',
          };
        }
      }

      return {
        success: false,
        isMember: false,
        message: 'An error occurred during Discord verification',
      };
    }
  }

  /**
   * Check if a user is a member of the guild
   */
  private async checkGuildMembership(userId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `https://discord.com/api/v10/guilds/${this.guildId}/members/${userId}`,
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // User is not in the guild
        return false;
      }
      throw error;
    }
  }

  /**
   * Get user information from Discord API
   */
  private async getUserInfo(userId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://discord.com/api/v10/users/${userId}`,
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  /**
   * Validate Discord User ID format
   */
  private isValidDiscordUserId(userId: string): boolean {
    // Discord User IDs are snowflake IDs (17-19 digit numbers)
    const snowflakeRegex = /^\d{17,19}$/;
    return snowflakeRegex.test(userId);
  }

  /**
   * Assign a role to a user (for future use after certification)
   */
  async assignRole(userId: string, roleId: string): Promise<boolean> {
    try {
      if (!this.botToken || !this.guildId) {
        return false;
      }

      const response = await axios.put(
        `https://discord.com/api/v10/guilds/${this.guildId}/members/${userId}/roles/${roleId}`,
        {},
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.status === 204;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  /**
   * Remove a role from a user
   */
  async removeRole(userId: string, roleId: string): Promise<boolean> {
    try {
      if (!this.botToken || !this.guildId) {
        return false;
      }

      const response = await axios.delete(
        `https://discord.com/api/v10/guilds/${this.guildId}/members/${userId}/roles/${roleId}`,
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.status === 204;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  /**
   * Get user's current roles in the guild
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      if (!this.botToken || !this.guildId) {
        return [];
      }

      const response = await axios.get(
        `https://discord.com/api/v10/guilds/${this.guildId}/members/${userId}`,
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.roles || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }
}

export default new DiscordVerificationService();
