#!/usr/bin/env node

const Database = require('./database');
const config = require('./config');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class SetupWizard {
  constructor() {
    this.database = null;
  }

  async run() {
    console.log(`
🚀 Void Mod Training Backend Setup Wizard
==========================================

This wizard will help you:
1. Set up the database
2. Verify configuration
3. Test Discord connection
4. Create initial quiz questions

Let's get started!
    `);

    try {
      await this.setupDatabase();
      await this.verifyConfiguration();
      await this.testDiscordConnection();
      await this.createSampleQuestions();
      
      console.log(`
✅ Setup completed successfully!

Next steps:
1. Copy .env.example to .env
2. Fill in your Discord credentials
3. Start the server with: npm start
4. Visit http://localhost:3000/health to verify

🎯 Your Void Mod Training system is ready!
      `);
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      rl.close();
    }
  }

  async setupDatabase() {
    console.log('\n📊 Setting up database...');
    
    this.database = new Database();
    await this.database.initialize();
    
    console.log('✅ Database initialized successfully');
  }

  async verifyConfiguration() {
    console.log('\n⚙️  Verifying configuration...');
    
    const requiredEnvVars = [
      'DISCORD_BOT_TOKEN',
      'DISCORD_CLIENT_ID', 
      'DISCORD_CLIENT_SECRET',
      'DISCORD_GUILD_ID',
      'ROLE_TRIAL_MOD_ID',
      'ROLE_STAFF_ACCESS_ID',
      'ROLE_TICKET_SUPPORT_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('⚠️  Missing environment variables:');
      missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
      console.log('\n💡 Make sure to copy .env.example to .env and fill in the values');
    } else {
      console.log('✅ All required environment variables are set');
    }

    // Check optional Google Forms setup
    if (process.env.GOOGLE_SHEET_ID) {
      console.log('✅ Google Forms integration detected');
    } else {
      console.log('ℹ️  Google Forms integration not configured (optional)');
    }
  }

  async testDiscordConnection() {
    console.log('\n🤖 Testing Discord connection...');
    
    if (!process.env.DISCORD_BOT_TOKEN) {
      console.log('⚠️  Discord bot token not set - skipping connection test');
      return;
    }

    try {
      const DiscordBot = require('./discordBot');
      const bot = new DiscordBot();
      
      console.log('🔄 Connecting to Discord...');
      await bot.start();
      
      console.log('✅ Discord bot connected successfully');
      
      // Test guild access
      const guild = bot.client.guilds.cache.get(config.DISCORD_GUILD_ID);
      if (guild) {
        console.log(`✅ Connected to guild: ${guild.name}`);
        
        // Test role access
        const roles = await bot.getGuildRoles();
        const configuredRoles = [
          config.ROLES.TRIAL_MOD,
          config.ROLES.STAFF_ACCESS,
          config.ROLES.TICKET_SUPPORT
        ].filter(id => id);
        
        console.log(`✅ Found ${roles.size} roles in guild`);
        
        const foundRoles = configuredRoles.filter(roleId => 
          roles.has(roleId)
        );
        
        if (foundRoles.length === configuredRoles.length) {
          console.log('✅ All configured role IDs found');
        } else {
          console.log(`⚠️  Only ${foundRoles.length}/${configuredRoles.length} configured role IDs found`);
        }
      } else {
        console.log('❌ Guild not found - check DISCORD_GUILD_ID');
      }
      
      bot.shutdown();
    } catch (error) {
      console.log('❌ Discord connection failed:', error.message);
      console.log('💡 Check your bot token and ensure the bot is invited to the server');
    }
  }

  async createSampleQuestions() {
    console.log('\n📝 Verifying quiz questions...');
    
    try {
      const questionCount = await this.database.get('SELECT COUNT(*) as count FROM quiz_questions');
      
      if (questionCount.count > 0) {
        console.log(`✅ Found ${questionCount.count} quiz questions in database`);
        
        // Show category breakdown
        const categories = await this.database.all(`
          SELECT category, COUNT(*) as count 
          FROM quiz_questions 
          GROUP BY category 
          ORDER BY count DESC
        `);
        
        console.log('📊 Questions by category:');
        categories.forEach(cat => {
          console.log(`   ${cat.category}: ${cat.count} questions`);
        });
      } else {
        console.log('❌ No quiz questions found - this should not happen!');
      }
    } catch (error) {
      console.log('❌ Error checking quiz questions:', error.message);
    }
  }

  async prompt(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}

// Run setup if called directly
if (require.main === module) {
  const wizard = new SetupWizard();
  wizard.run();
}

module.exports = SetupWizard;
