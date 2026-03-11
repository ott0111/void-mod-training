const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config');

class DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
      ]
    });
    
    this.isLoggedIn = false;
    this.commands = new Map();
  }

  async start() {
    try {
      console.log('Starting Discord bot...');
      
      // Login the bot
      await this.client.login(config.DISCORD_BOT_TOKEN);
      this.isLoggedIn = true;
      
      console.log(`Bot logged in as ${this.client.user.tag}`);
      
      // Register slash commands
      await this.registerCommands();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('Discord bot started successfully');
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
      throw error;
    }
  }

  async registerCommands() {
    const commands = [
      {
        name: 'verify',
        description: 'Verify your moderator training completion',
        options: [
          {
            name: 'discord-id',
            description: 'Your Discord user ID',
            type: 3, // STRING
            required: true
          }
        ]
      },
      {
        name: 'quiz-status',
        description: 'Check your quiz completion status'
      },
      {
        name: 'mod-help',
        description: 'Get help with moderator commands'
      }
    ];

    const rest = new REST({ version: '10' }).setToken(config.DISCORD_BOT_TOKEN);

    try {
      console.log('Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID),
        { body: commands }
      );

      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  }

  setupEventListeners() {
    this.client.on('ready', () => {
      console.log(`Bot is ready! Logged in as ${this.client.user.tag}`);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const { commandName } = interaction;

      try {
        switch (commandName) {
          case 'verify':
            await this.handleVerifyCommand(interaction);
            break;
          case 'quiz-status':
            await this.handleQuizStatusCommand(interaction);
            break;
          case 'mod-help':
            await this.handleModHelpCommand(interaction);
            break;
        }
      } catch (error) {
        console.error(`Error handling command ${commandName}:`, error);
        await interaction.reply({
          content: 'There was an error executing this command.',
          ephemeral: true
        });
      }
    });

    this.client.on('error', (error) => {
      console.error('Discord bot error:', error);
    });

    this.client.on('disconnect', () => {
      console.log('Discord bot disconnected');
      this.isLoggedIn = false;
    });
  }

  async handleVerifyCommand(interaction) {
    const discordId = interaction.options.getString('discord-id');
    
    try {
      // This would typically integrate with your backend to verify quiz completion
      // For now, we'll just acknowledge the command
      await interaction.reply({
        content: `Verification request received for Discord ID: ${discordId}. Please complete the quiz on the training website first.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error in verify command:', error);
      await interaction.reply({
        content: 'Error processing verification request.',
        ephemeral: true
      });
    }
  }

  async handleQuizStatusCommand(interaction) {
    try {
      const userId = interaction.user.id;
      
      // This would typically check the database for quiz status
      await interaction.reply({
        content: `Quiz status for <@${userId}>: Please visit the training website to check your quiz status.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error in quiz-status command:', error);
      await interaction.reply({
        content: 'Error checking quiz status.',
        ephemeral: true
      });
    }
  }

  async handleModHelpCommand(interaction) {
    const helpMessage = `
**Void Esports Moderator Commands Help**

**Slash Commands:**
• \`/verify <discord-id>\` - Verify your training completion
• \`/quiz-status\` - Check your quiz completion status
• \`/mod-help\` - Show this help message

**Training Process:**
1. Login with Discord on the training website
2. Complete the moderator certification quiz (20/29 to pass)
3. Receive automatic role assignment if you pass

**Required Roles (if you pass):**
• Trial Mod
• Staff Access  
• Ticket Support

**Need Additional Help:**
Contact senior staff or visit the training website.
    `;

    await interaction.reply({
      content: helpMessage,
      ephemeral: true
    });
  }

  async assignRoles(userId, roleIds) {
    if (!this.isLoggedIn) {
      throw new Error('Discord bot is not logged in');
    }

    try {
      const guild = this.client.guilds.cache.get(config.DISCORD_GUILD_ID);
      if (!guild) {
        throw new Error('Guild not found');
      }

      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) {
        throw new Error('Member not found in guild');
      }

      const assignedRoles = [];
      
      for (const roleId of roleIds) {
        try {
          await member.roles.add(roleId);
          assignedRoles.push(roleId);
          console.log(`Assigned role ${roleId} to user ${userId}`);
        } catch (error) {
          console.error(`Failed to assign role ${roleId} to user ${userId}:`, error);
        }
      }

      return {
        success: true,
        assignedRoles,
        totalRoles: roleIds.length
      };
    } catch (error) {
      console.error('Error assigning roles:', error);
      throw error;
    }
  }

  async removeRoles(userId, roleIds) {
    if (!this.isLoggedIn) {
      throw new Error('Discord bot is not logged in');
    }

    try {
      const guild = this.client.guilds.cache.get(config.DISCORD_GUILD_ID);
      if (!guild) {
        throw new Error('Guild not found');
      }

      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) {
        throw new Error('Member not found in guild');
      }

      const removedRoles = [];
      
      for (const roleId of roleIds) {
        try {
          await member.roles.remove(roleId);
          removedRoles.push(roleId);
          console.log(`Removed role ${roleId} from user ${userId}`);
        } catch (error) {
          console.error(`Failed to remove role ${roleId} from user ${userId}:`, error);
        }
      }

      return {
        success: true,
        removedRoles,
        totalRoles: roleIds.length
      };
    } catch (error) {
      console.error('Error removing roles:', error);
      throw error;
    }
  }

  async getGuildMember(userId) {
    if (!this.isLoggedIn) {
      throw new Error('Discord bot is not logged in');
    }

    try {
      const guild = this.client.guilds.cache.get(config.DISCORD_GUILD_ID);
      if (!guild) {
        throw new Error('Guild not found');
      }

      const member = await guild.members.fetch(userId).catch(() => null);
      return member;
    } catch (error) {
      console.error('Error fetching guild member:', error);
      throw error;
    }
  }

  async sendMessageToUser(userId, message) {
    try {
      const user = await this.client.users.fetch(userId);
      await user.send(message);
      return true;
    } catch (error) {
      console.error('Error sending DM to user:', error);
      return false;
    }
  }

  async getGuildRoles() {
    if (!this.isLoggedIn) {
      throw new Error('Discord bot is not logged in');
    }

    try {
      const guild = this.client.guilds.cache.get(config.DISCORD_GUILD_ID);
      if (!guild) {
        throw new Error('Guild not found');
      }

      return guild.roles.cache;
    } catch (error) {
      console.error('Error fetching guild roles:', error);
      throw error;
    }
  }

  shutdown() {
    if (this.isLoggedIn) {
      this.client.destroy();
      this.isLoggedIn = false;
      console.log('Discord bot shut down');
    }
  }
}

module.exports = DiscordBot;
