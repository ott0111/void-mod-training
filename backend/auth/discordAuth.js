const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('../config');

function initializeDiscordAuth(database) {
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await database.get('SELECT * FROM users WHERE id = ?', [id]);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Discord OAuth Strategy
  passport.use(new DiscordStrategy({
    clientID: config.DISCORD_CLIENT_ID,
    clientSecret: config.DISCORD_CLIENT_SECRET,
    callbackURL: config.DISCORD_REDIRECT_URI,
    scope: ['identify', 'guilds.join']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists in database
      let user = await database.getUserByDiscordId(profile.id);

      if (!user) {
        // Create new user
        await database.createUser({
          id: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          avatar: profile.avatar,
          accessToken: accessToken,
          refreshToken: refreshToken
        });

        user = await database.getUserByDiscordId(profile.id);
      } else {
        // Update user tokens and last login
        await database.run(`
          UPDATE users 
          SET access_token = ?, refresh_token = ?, last_login = CURRENT_TIMESTAMP
          WHERE discord_id = ?
        `, [accessToken, refreshToken, profile.id]);

        // Update user info if changed
        await database.run(`
          UPDATE users 
          SET discord_username = ?, discord_discriminator = ?, discord_avatar = ?
          WHERE discord_id = ?
        `, [profile.username, profile.discriminator, profile.avatar, profile.id]);

        user = await database.getUserByDiscordId(profile.id);
      }

      // Add Discord profile info to user object
      user.profile = profile;
      done(null, user);
    } catch (error) {
      console.error('Error in Discord strategy:', error);
      done(error, null);
    }
  }));

  return passport;
}

module.exports = initializeDiscordAuth;
