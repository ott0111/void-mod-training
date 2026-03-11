import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

const TrainingModules = ({ user }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

  const trainingContent = {
    overview: {
      title: "Program Overview",
      icon: "🎯",
      content: `
Welcome to the Void Esports Moderator Training Program!

This comprehensive training program is designed to equip you with all the necessary skills and knowledge to become an effective Void Esports moderator. Upon successful completion of this training and certification quiz, you will be eligible for moderator roles within our community.

Training Path:
1. Learn - Study all training modules carefully
2. Practice - Apply the knowledge in real scenarios
3. Complete - Pass the certification quiz

Requirements:
• Complete all training sections
• Pass the certification quiz (20/29 correct answers)
• Maintain professional conduct
• Follow all guidelines and protocols

Good luck on your journey to becoming a Void Esports moderator!
      `
    },
    ticketTypes: {
      title: "Ticket Types",
      icon: "🎫",
      content: `
TICKET TYPES

GENERAL TICKETS:
Purpose: Community support inquiries and reporting issues
Response Protocol:
• Start with professional greeting
• Ask for age verification
• Inquire about the specific issue
• Provide appropriate assistance
• Escalate to senior staff if necessary

ROSTER TICKETS:
Purpose: User applications for joining Void Esports rosters
Response Protocol:
• Verify user meets age requirements (13+)
• Ask which role they're applying for
• Provide role-specific requirements
• Direct to appropriate resources
• Document the interaction properly

Ticket Handling Guidelines:
• Always maintain professionalism
• Use proper greeting format
• Verify age before proceeding
• Document all interactions
• Escalate complex issues
• Follow up when necessary
      `
    },
    rosterCategories: {
      title: "Roster Categories & Requirements",
      icon: "👥",
      content: `
ROSTER CATEGORIES & REQUIREMENTS

CREATIVE ACADEMY / MAIN CREATIVE:
Requirements:
• Smooth/Fast mechanics
• Uniqueness in building/editing
• Creative portfolio or clips
• Ability to showcase unique style

ACADEMY ROSTER:
Requirements:
• Power Ranking: 5,000+
• No earnings requirement
• Basic gameplay skills
• Potential for growth

SEMI-PRO ROSTER:
Requirements:
• Power Ranking: 10,000-25,000
• No earnings requirement
• Strong gameplay skills
• Consistent performance

PRO ROSTER:
Requirements:
• Power Ranking: 25,000+
• $1,000+ in Official Fortnite Earnings
• Exceptional gameplay skills
• Tournament experience

VOID VFX / VOID GFX:
Requirements:
• High-Quality Work (1440p or Higher)
• Professional portfolio
• Advanced editing skills
• Creative vision

CONTENT CREATOR:
Requirements:
• 1k followers on Twitch/YouTube
• 10k followers on TikTok
• Consistent content creation
• Community engagement

STREAMER:
Requirements:
• 1,000+ Followers/Subscribers
• Stream at least 4x per week
• Average 20+ viewers
• Professional streaming setup

COACH:
Requirements:
• Proven coaching experience
• Student success stories
• Knowledge of meta strategies
• Teaching ability

VOID GRINDER+:
Requirements:
• Support creator code "Team.Void"
• Epic Games username with "Void"
• Use Discord "Void" tag
• Active community participation
      `
    },
    modCommands: {
      title: "Mod Responsibilities & Commands",
      icon: "⚡",
      content: `
MOD RESPONSIBILITIES & COMMANDS

WARN / REPORT COMMAND:
Usage: /warn @user reason
Usage: /report @user reason

Guidelines:
• Use /warn for minor rule violations
• Use /report for major or repeated infractions
• Always provide clear reason
• Document the action
• Follow up if necessary

Examples:
/warn @user Inappropriate language
/report @user Harassment

LOA (LEAVE ON APPLICATION):
Format:
User : ———-
Role : ———-
Start Time : ———-
End Time : ———-
Reason : ———-

LOA Guidelines:
• Submit LOA before absence
• Provide specific dates
• Include valid reason
• Notify senior staff
• Update upon return

MODERATOR RESPONSIBILITIES:
• Handle tickets professionally
• Maintain community standards
• Assist community members
• Document all actions
• Follow protocols consistently
• Escalate when necessary

COMMAND PROTOCOLS:
• /login and /logout for shift tracking
• /warn for minor infractions
• /report for major issues
• Proper documentation required
• Follow chain of command
      `
    },
    performanceMetrics: {
      title: "Weekly Performance Metrics",
      icon: "📊",
      content: `
WEEKLY PERFORMANCE METRICS

TICKET REQUIREMENTS:
• Minimum 20 tickets per week
• Proper documentation for all tickets
• Professional responses required
• Follow-up on unresolved issues
• Escalate complex cases

ACTIVITY REQUIREMENTS:
• 400 messages per week minimum
• Active community engagement
• Professional conduct at all times
• Staff channel participation
• Training and development

PERFORMANCE STANDARDS:
• Response time under 2 hours
• Resolution rate above 85%
• Community satisfaction positive
• Following all protocols
• Team collaboration

WEEKLY REPORTING:
• Submit performance metrics
• Document challenges faced
• Suggest improvements
• Team collaboration feedback
• Personal development goals

BELOW STANDARDS:
Performance below required standards will result in:
• Performance review
• Additional training
• Probation period
• Possible role reassignment
• Community impact assessment

EXCELLENCE CRITERIA:
• Exceeding minimum requirements
• Positive community feedback
• Team leadership
• Innovation and improvements
• Mentorship of new staff
      `
    },
    guidelines: {
      title: "Ticket Handling Guidelines",
      icon: "📋",
      content: `
TICKET HANDLING GUIDELINES

PROFESSIONAL GREETINGS:
ALWAYS use professional greetings:
• "Hello, how may I help you today?"
• "Hi there, what can I assist you with?"
• "Good [morning/afternoon/evening], how can I help?"

NEVER use informal greetings:
• "Yo"
• "Hi"
• "Bro"
• "Sup"
• "What's up"

AGE VERIFICATION:
ALWAYS ask professionally:
• "May I ask how old you are?"
• "What is your current age?"
• "Could you please confirm your age?"

NEVER ask informally:
• "How old are you kid?"
• "Age now!"
• "Tell me your age immediately"

ROLE INQUIRIES:
When users apply for roles:
• "What role are you applying for today?"
• "Which position are you interested in?"
• "What type of role are you seeking?"

PROFESSIONAL CONDUCT:
• Maintain respectful tone
• Use proper grammar and spelling
• Avoid slang and informal language
• Stay calm in difficult situations
• Represent Void Esports professionally

TICKET CLOSURE:
• Ensure all issues are resolved
• Confirm user satisfaction
• Document final resolution
• Thank user for patience
• Close ticket appropriately

ESCALATION PROTOCOL:
• Recognize when help is needed
• Contact senior staff promptly
• Provide full context
• Document escalation
• Follow up on resolution
      `
    },
    roleInstructions: {
      title: "Role-Specific Instructions",
      icon: "🎭",
      content: `
ROLE-SPECIFIC INSTRUCTIONS

CREATIVE ACADEMY / MAIN CREATIVE:
Response: "Perfect! Please send two-three clips and @Creative Department will be here shortly to review them!"

ACADEMY ROSTER:
Response: "Please link your tracker below with an image of the default dance in lobby!"

SEMI-PRO ROSTER / PRO ROSTER:
Response: "Perfect! Please send your tracker below with an image of the default dance in lobby! @operations will be here shortly to review!"

VOID VFX / VOID GFX:
Response: "Alright, please link your previous work and/or portfolio below and @GFX / VFX Lead will be here shortly to review."

CONTENT CREATOR:
Response: "Perfect! Please link your social media accounts below and @Content Department will review them shortly!"

COACH:
Response: "How many people have you coached previously? Can you link their trackers below!"

VOID GRINDER+:
Response: "Unfortunately you do not qualify for any roles, however, we can offer you Grinder+! Please do the following:
• Send a screenshot of using our support creator code "Team.Void".
• Send a screenshot of changing your Epic Games username to have "Void" in it.
• Use our Discord "Void" tag!"

BLACKLIST PROCEDURE:
Format to follow:
• User: Username of the person
• User ID: His discord ID
• Reason: Underage

Remember: Only blacklist users who are under 13 years old.
      `
    },
    closingTicket: {
      title: "Closing the Ticket",
      icon: "✅",
      content: `
CLOSING THE TICKET

FINAL STEPS:
For successful applicants:
• "Perfect! Please change your name to have "Void" in it and send a screenshot of using our code!"
• Once they send the images: "Thank you! Here are your roles! Have a nice day!"

For unsuccessful applicants:
• Provide constructive feedback
• Suggest areas for improvement
• Encourage future applications
• Maintain professional tone

ROLE ASSIGNMENT PROCESS:
1. Verify all requirements met
2. Confirm name change and code usage
3. Assign appropriate roles
4. Send welcome message
5. Document the assignment
6. Close ticket successfully

WELCOME MESSAGE TEMPLATE:
"Congratulations and welcome to Void Esports! Your roles have been assigned. Please familiarize yourself with our staff channels and guidelines. If you have any questions, don't hesitate to ask. Welcome to the team!"

IMPORTANT REMINDERS:
• Always maintain professionalism
• Double-check all requirements
• Ensure proper documentation
• Follow up with new members
• Provide ongoing support

TICKET DOCUMENTATION:
• Record all interactions
• Note any special circumstances
• Document role assignments
• Include timestamps
• Reference related tickets

QUALITY ASSURANCE:
• Review ticket handling
• Ensure consistency
• Monitor response times
• Track satisfaction rates
• Continuous improvement
      `
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const copyLOAFormat = () => {
    const loaFormat = `User : ———-
Role : ———-
Start Time : ———-
End Time : ———-
Reason : ———-`;
    
    navigator.clipboard.writeText(loaFormat);
    setCopiedSection('loa');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">Training Modules</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Complete all training modules to prepare for the certification quiz
        </p>
      </motion.div>

      <div className="space-y-6">
        {Object.entries(trainingContent).map(([key, section], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glow-card"
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => toggleSection(key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{section.icon}</span>
                  <h2 className="text-2xl font-bold gradient-text">{section.title}</h2>
                </div>
                <div className="flex items-center space-x-2">
                  {key === 'modCommands' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyLOAFormat();
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {copiedSection === 'loa' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  {expandedSection === key ? (
                    <ChevronUp className="w-5 h-5 text-void-purple-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-void-purple-400" />
                  )}
                </div>
              </div>
            </div>
            
            {expandedSection === key && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/10"
              >
                <div className="p-6">
                  <div className="prose prose-invert max-w-none">
                    {section.content.split('\n').map((paragraph, pIndex) => {
                      if (paragraph.trim() === '') return null;
                      
                      if (paragraph.includes(':')) {
                        const [title, ...content] = paragraph.split(':');
                        if (title === 'LOA Format') {
                          return (
                            <div key={pIndex} className="my-4">
                              <h4 className="text-lg font-semibold text-void-purple-400 mb-3">{title}:</h4>
                              <div className="loa-card">
                                <div className="loa-field">
                                  <span>User :</span>
                                  <span>————</span>
                                </div>
                                <div className="loa-field">
                                  <span>Role :</span>
                                  <span>————</span>
                                </div>
                                <div className="loa-field">
                                  <span>Start Time :</span>
                                  <span>————</span>
                                </div>
                                <div className="loa-field">
                                  <span>End Time :</span>
                                  <span>————</span>
                                </div>
                                <div className="loa-field">
                                  <span>Reason :</span>
                                  <span>————</span>
                                </div>
                                <button
                                  onClick={copyLOAFormat}
                                  className="mt-4 neon-button text-sm px-4 py-2"
                                >
                                  {copiedSection === 'loa' ? 'Copied!' : 'Copy Format'}
                                </button>
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <div key={pIndex} className="my-4">
                            <h4 className="text-lg font-semibold text-void-purple-400 mb-2">
                              {title}:
                            </h4>
                            <p className="text-gray-300 whitespace-pre-line">
                              {content.join(':').trim()}
                            </p>
                          </div>
                        );
                      }
                      
                      if (paragraph.startsWith('•')) {
                        return (
                          <li key={pIndex} className="text-gray-300 ml-4 mb-2">
                            {paragraph.substring(1).trim()}
                          </li>
                        );
                      }
                      
                      if (paragraph.match(/^[A-Z\s]+$/)) {
                        return (
                          <h3 key={pIndex} className="text-xl font-bold text-white mt-6 mb-4">
                            {paragraph}
                          </h3>
                        );
                      }
                      
                      return (
                        <p key={pIndex} className="text-gray-300 mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrainingModules;
