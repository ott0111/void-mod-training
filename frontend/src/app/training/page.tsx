'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Clock, Copy, Check, ArrowLeft, Menu, X } from 'lucide-react'
import Link from 'next/link'

interface TrainingModule {
  id: string
  title: string
  content: string[]
  order: number
  estimatedReadTime: number
  category: string
}

const trainingModules: TrainingModule[] = [
  {
    id: 'ticket-types',
    title: 'Ticket Types',
    order: 1,
    estimatedReadTime: 15,
    category: 'Essentials',
    content: [
      '**Player Report**',
      'Reports submitted by players regarding other players\' behavior, cheating, or rule violations.',
      '',
      '**Staff Report**',
      'Reports about staff members\' conduct or performance issues.',
      '',
      '**Bug Report**',
      'Technical issues, glitches, or exploits discovered in the system.',
      '',
      '**Appeal**',
      'Requests to review and overturn previous moderation decisions.',
      '',
      '**Question**',
      'General inquiries from users seeking information or guidance.',
      '',
      '**General Support**',
      'Broad range of user assistance requests not fitting other categories.',
      '',
      '**Tournament Issue**',
      'Problems specifically related to tournament operations and management.',
      '',
      '**Cheating Report**',
      'Specific allegations of cheating or unfair gameplay advantages.'
    ]
  },
  {
    id: 'roster-categories',
    title: 'Roster Categories & Requirements',
    order: 2,
    estimatedReadTime: 20,
    category: 'Structure',
    content: [
      '**Main Roster**',
      'Core team members with full participation privileges. Must complete tryouts and maintain active status.',
      '',
      '**Sub Roster**',
      'Backup players ready to fill in when needed. Required to attend practices and be available for matches.',
      '',
      '**Trial Roster**',
      'New members undergoing evaluation period. Must demonstrate skill and commitment over 2-4 weeks.',
      '',
      '**Reserve Roster**',
      'Inactive members taking temporary breaks. Maintain limited access to community resources.',
      '',
      '**Alumni**',
      'Former members who have graduated or retired. Honorary status with community access.',
      '',
      '**Requirements for Main Roster:**',
      '• Minimum 16 years of age',
      '• Completion of tryout process',
      '• Staff approval and recommendation',
      '• Active participation in practices',
      '• Adherence to code of conduct',
      '• Regular attendance requirements'
    ]
  },
  {
    id: 'mod-responsibilities',
    title: 'Mod Responsibilities & Commands',
    order: 3,
    estimatedReadTime: 25,
    category: 'Operations',
    content: [
      '**Core Responsibilities:**',
      '• Monitor chat and voice channels for rule violations',
      '• Respond to user reports and tickets promptly',
      '• Enforce community guidelines fairly and consistently',
      '• Document all moderation actions with detailed notes',
      '• Assist new users with platform navigation',
      '• Participate in staff meetings and training sessions',
      '',
      '**Essential Commands:**',
      '',
      '!warn [user] [reason]',
      'Issues a formal warning to the specified user',
      '',
      '!mute [user] [duration] [reason]',
      'Temporarily restricts user\'s communication privileges',
      '',
      '!kick [user] [reason]',
      'Removes user from server temporarily',
      '',
      '!ban [user] [duration] [reason]',
      'Permanently or temporarily removes user access',
      '',
      '!history [user]',
      'Displays user\'s previous infractions and moderation history',
      '',
      '!ticket [id]',
      'Accesses specific ticket details and status',
      '',
      '!close [ticket-id] [resolution]',
      'Marks ticket as resolved with detailed explanation'
    ]
  },
  {
    id: 'performance-metrics',
    title: 'Weekly Performance Metrics',
    order: 4,
    estimatedReadTime: 10,
    category: 'Evaluation',
    content: [
      '**Tickets Handled**',
      'Total number of tickets processed and resolved during the week',
      '',
      '**Average Response Time**',
      'Time elapsed between ticket creation and first moderator response',
      '',
      '**Customer Satisfaction**',
      'User feedback ratings on ticket resolution quality (1-5 scale)',
      '',
      '**Escalation Rate**',
      'Percentage of tickets requiring senior staff intervention',
      '',
      '**Accuracy Score**',
      'Percentage of correct decisions based on policy adherence',
      '',
      '**Performance Standards:**',
      '• Minimum 20 tickets handled per week',
      '• Response time under 30 minutes average',
      '• 4.0+ customer satisfaction rating',
      '• Less than 10% escalation rate',
      '• 95%+ accuracy in decision making'
    ]
  },
  {
    id: 'ticket-guidelines',
    title: 'Ticket Handling Guidelines',
    order: 5,
    estimatedReadTime: 30,
    category: 'Procedures',
    content: [
      '**Initial Response Protocol:**',
      '1. Acknowledge receipt within 30 minutes',
      '2. Verify user identity and permissions',
      '3. Assess ticket priority and category',
      '4. Gather all relevant information and evidence',
      '5. Set clear expectations for resolution timeline',
      '',
      '**Investigation Process:**',
      '1. Review all available evidence thoroughly',
      '2. Check user history and previous interactions',
      '3. Consult relevant policies and guidelines',
      '4. Consider context and mitigating factors',
      '5. Document findings with detailed notes',
      '',
      '**Resolution Standards:**',
      '• Apply rules consistently across all users',
      '• Provide clear explanations for decisions',
      '• Offer guidance for future compliance',
      '• Follow escalation procedures when necessary',
      '• Maintain professional and respectful communication',
      '',
      '**Documentation Requirements:**',
      '• Timestamp all actions and communications',
      '• Include specific rule references',
      '• Note any witnesses or evidence reviewed',
      '• Record user reactions and follow-up needs'
    ]
  },
  {
    id: 'general-guidelines',
    title: 'General Guidelines',
    order: 6,
    estimatedReadTime: 20,
    category: 'Policies',
    content: [
      '**Professional Conduct:**',
      '• Maintain impartiality in all situations',
      '• Avoid personal bias or favoritism',
      '• Communicate clearly and professionally',
      '• Respect user privacy and confidentiality',
      '• Lead by example in community behavior',
      '',
      '**Decision Making:**',
      '• Base decisions on evidence and policy',
      '• Consider intent alongside impact',
      '• Apply graduated responses when appropriate',
      '• Document reasoning for all major decisions',
      '• Seek guidance when uncertain about protocol',
      '',
      '**Communication Standards:**',
      '• Use clear, concise language',
      '• Avoid jargon or technical terms when possible',
      '• Maintain calm demeanor during conflicts',
      '• Provide specific examples when explaining rules',
      '• Follow up on unresolved issues promptly',
      '',
      '**Conflict Resolution:**',
      '• Listen to all parties involved',
      '• Identify root causes of disputes',
      '• Facilitate constructive dialogue',
      '• Mediate rather than dictate when possible',
      '• Escalate when situations become unmanageable'
    ]
  },
  {
    id: 'role-instructions',
    title: 'Role-Specific Instructions',
    order: 7,
    estimatedReadTime: 25,
    category: 'Specialization',
    content: [
      '**Trial Moderator Responsibilities:**',
      '• Shadow senior moderators during shifts',
      '• Handle low-priority tickets under supervision',
      '• Learn and internalize all community policies',
      '• Participate in training sessions and workshops',
      '• Submit weekly activity reports to supervisors',
      '',
      '**Full Moderator Duties:**',
      '• Independent handling of all ticket types',
      '• Mentor trial moderators and new staff',
      '• Participate in policy development discussions',
      '• Assist in community event moderation',
      '• Contribute to training material updates',
      '',
      '**Senior Moderator Role:**',
      '• Review and approve major moderation actions',
      '• Handle escalated tickets and appeals',
      '• Conduct performance evaluations for junior staff',
      '• Coordinate scheduling and shift coverage',
      '• Serve as liaison with community leadership',
      '',
      '**Administrative Support:**',
      '• Maintain moderation logs and statistics',
      '• Update policy documentation as needed',
      '• Generate weekly and monthly performance reports',
      '• Assist in technical troubleshooting for users',
      '• Coordinate with other departments on cross-functional issues'
    ]
  },
  {
    id: 'closing-tickets',
    title: 'Closing the Ticket',
    order: 8,
    estimatedReadTime: 15,
    category: 'Procedures',
    content: [
      '**Pre-Closure Checklist:**',
      '1. Verify all user concerns have been addressed',
      '2. Confirm resolution meets quality standards',
      '3. Document all actions taken and decisions made',
      '4. Check for follow-up requirements or future needs',
      '5. Ensure proper categorization and tagging',
      '',
      '**Closure Documentation Requirements:**',
      '• Summary of the original issue or report',
      '• Detailed description of investigation process',
      '• Evidence reviewed and conclusions drawn',
      '• Specific actions taken and reasons for decisions',
      '• Resources provided or references shared',
      '• Expected outcomes or next steps, if applicable',
      '',
      '**Communication with User:**',
      '• Thank user for their patience and cooperation',
      '• Provide clear explanation of resolution',
      '• Share relevant resources or educational materials',
      '• Offer additional assistance if needed',
      '• Explain appeal process if applicable',
      '',
      '**Final Review Process:**',
      '• Double-check all information for accuracy',
      '• Verify compliance with established policies',
      '• Ensure professional tone throughout documentation',
      '• Confirm ticket is properly categorized and tagged',
      '• Set appropriate follow-up reminders if necessary'
    ]
  }
]

export default function TrainingPage() {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [copiedLOA, setCopiedLOA] = useState(false)

  const copyLOAFormat = () => {
    const loaFormat = `User : ———-
Role : ———-
Start Time : ———-
End Time : ———-
Reason : ————`
    
    navigator.clipboard.writeText(loaFormat)
    setCopiedLOA(true)
    setTimeout(() => setCopiedLOA(false), 2000)
  }

  if (selectedModule) {
    return (
      <div className="min-h-screen px-4 py-20">
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        <motion.div 
          className="relative z-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <motion.div 
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <button
              onClick={() => setSelectedModule(null)}
              className="p-2 glass-card rounded-xl hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-void-purple-300" />
            </button>
            
            <div>
              <div className="flex items-center gap-3 text-sm text-void-purple-400 mb-2">
                <span className="px-2 py-1 bg-white/10 rounded-lg">
                  {selectedModule.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedModule.estimatedReadTime} min read
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gradient">
                {selectedModule.title}
              </h1>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div 
            className="gradient-border p-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="glass-card p-8">
              <div className="prose prose-invert max-w-none">
                {selectedModule.content.map((paragraph, index) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h3 key={index} className="text-xl font-semibold text-void-purple-100 mt-6 mb-3">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    )
                  } else if (paragraph.startsWith('•')) {
                    return (
                      <li key={index} className="text-void-purple-200 ml-6 mb-2">
                        {paragraph.substring(1).trim()}
                      </li>
                    )
                  } else if (paragraph.startsWith('!')) {
                    return (
                      <div key={index} className="bg-void-purple-500/10 border border-void-purple-500/30 rounded-lg p-4 mb-4 font-mono text-void-purple-100">
                        {paragraph}
                      </div>
                    )
                  } else if (paragraph.trim() === '') {
                    return <br key={index} />
                  } else {
                    return (
                      <p key={index} className="text-void-purple-200 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    )
                  }
                })}
              </div>
            </div>
          </motion.div>

          {/* LOA Format Card */}
          {selectedModule.id === 'general-guidelines' && (
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="gradient-border p-1">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-void-purple-100">
                      LOA Format
                    </h3>
                    <button
                      onClick={copyLOAFormat}
                      className="p-2 glass-card rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copiedLOA ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-void-purple-300" />
                      )}
                    </button>
                  </div>
                  
                  <div className="bg-void-purple-500/10 border border-void-purple-500/30 rounded-lg p-4 font-mono text-void-purple-100">
                    <pre className="whitespace-pre-wrap">
{`User : ———-
Role : ———-
Start Time : ———-
End Time : ———-
Reason : ————`}
                    </pre>
                  </div>
                  
                  <p className="text-void-purple-300 text-sm mt-3">
                    Click the copy button to copy this format for your LOA submissions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div 
            className="flex justify-between items-center mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button
              onClick={() => {
                const currentIndex = trainingModules.findIndex(m => m.id === selectedModule.id)
                if (currentIndex > 0) {
                  setSelectedModule(trainingModules[currentIndex - 1])
                }
              }}
              disabled={trainingModules.findIndex(m => m.id === selectedModule.id) === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Module
            </button>

            <Link href="/verification" className="btn-primary">
              Take Certification Quiz
            </Link>

            <button
              onClick={() => {
                const currentIndex = trainingModules.findIndex(m => m.id === selectedModule.id)
                if (currentIndex < trainingModules.length - 1) {
                  setSelectedModule(trainingModules[currentIndex + 1])
                }
              }}
              disabled={trainingModules.findIndex(m => m.id === selectedModule.id) === trainingModules.length - 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Module
            </button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-20">
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      <motion.div 
        className="relative z-10 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-void-purple-500 to-void-purple-600 rounded-2xl mb-6 shadow-void-glow">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Moderator Training
          </h1>
          
          <p className="text-xl text-void-purple-200 leading-relaxed max-w-3xl mx-auto">
            Master the essential skills and knowledge required to become an effective Void moderator. 
            Complete all modules to prepare for the certification exam.
          </p>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {trainingModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedModule(module)}
              className="cursor-pointer"
            >
              <div className="gradient-border p-1 h-full">
                <div className="glass-card p-6 h-full glass-card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-void-purple-500 to-void-purple-600 rounded-xl flex items-center justify-center shadow-void-glow">
                      <span className="text-white font-bold">
                        {module.order}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-void-purple-400">
                      <Clock className="w-4 h-4" />
                      {module.estimatedReadTime}m
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs text-void-purple-300">
                      {module.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-void-purple-100 mb-3">
                    {module.title}
                  </h3>
                  
                  <p className="text-void-purple-300 text-sm leading-relaxed">
                    {module.content[0]?.replace(/\*\*/g, '').substring(0, 100)}...
                  </p>
                  
                  <div className="flex items-center gap-2 mt-4 text-void-purple-400">
                    <span className="text-sm">Start module</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <p className="text-void-purple-200 mb-6">
            Ready to test your knowledge?
          </p>
          
          <Link href="/verification" className="btn-primary">
            <span className="flex items-center gap-2">
              Take Certification Quiz
              <ChevronRight className="w-5 h-5" />
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
