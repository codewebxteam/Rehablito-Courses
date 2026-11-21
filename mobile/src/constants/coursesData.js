/**
 * Rehablito Mobile Academy - Courses Database
 * Complete Curriculum, Lessons, Video IDs & Study Materials for all 6 Courses
 */

export const COURSES_DATABASE = {
  'autism-adhd': {
    id: 'autism-adhd',
    title: 'Autism / ADHD Complete Therapy Program',
    category: 'Autism / ADHD',
    themeColor: '#16a34a',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/AutismCard1.webp',
    mainVideoId: 'aqz-KE-bpKQ',
    lecturesCount: 22,
    language: 'Hindi',
    price: '₹1,299',
    originalPrice: '₹3,999',
    discount: '67% OFF',
    savings: 'Save ₹2,700',
    description:
      'A comprehensive therapy & guidance program designed by certified pediatric specialists to empower parents with sensory regulation techniques, communication boosters, and positive behavioral strategies at home.',
    instructor: {
      name: 'Rehablito Clinical Team',
      role: 'Certified Pediatric Rehabilitation Specialists',
      experience: 'Senior Clinical Mentors',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      bio: 'Leading pediatric neurodevelopmental clinicians specializing in sensory integration, speech stimulation, and holistic family guidance.',
    },
    studyMaterial: {
      title: 'Autism & ADHD Practical Parent Workbook',
      subtitle: 'Download sensory diet templates, visual routine charts & progress logs.',
      pages: '45 Pages PDF',
      fileSize: '8.4 MB',
    },
    whatYouWillLearn: [
      'Identify sensory triggers and build customized calming sensory diets at home.',
      'Implement visual scheduling & routines to reduce anxiety and transition friction.',
      'Evidence-based communication strategies for non-verbal and verbal children.',
      'Proactive behaviour strategies to prevent meltdowns and encourage co-regulation.',
      'Fine & gross motor exercises for posture, balance, and coordination.',
      'School readiness, teacher collaboration guidelines, and IEP planning tips.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Foundations of Neurodevelopment & Assessment',
        lessons: [
          { id: 'a1', title: 'Understanding Autism vs ADHD Spectrum Traits', duration: '12:40', isFree: true, videoId: 'aqz-KE-bpKQ' },
          { id: 'a2', title: 'Brain Development & Sensory Processing Basics', duration: '14:20', isFree: true, videoId: 'sBws8MSXN7A' },
          { id: 'a3', title: 'Setting Realistic Developmental Milestones', duration: '09:50', isFree: false, videoId: '1f_33Y4c4b0' },
          { id: 'a4', title: 'Parent Mindset & Daily Observation Journaling', duration: '11:15', isFree: false, videoId: 'aqz-KE-bpKQ' },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Sensory Regulation & Calming Protocols',
        lessons: [
          { id: 'a5', title: 'Sensory Overload vs Tantrum: Spotting the Difference', duration: '15:10', isFree: true, videoId: 'sBws8MSXN7A' },
          { id: 'a6', title: 'Designing a Daily Sensory Diet at Home', duration: '18:45', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { id: 'a7', title: 'Deep Pressure, Weighted Therapy & Vestibular Activities', duration: '13:30', isFree: false, videoId: '1f_33Y4c4b0' },
          { id: 'a8', title: 'Creating a Low-Sensory Safe Corner in Your Bedroom', duration: '10:05', isFree: false, videoId: 'sBws8MSXN7A' },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Communication Boosters & Social Engagement',
        lessons: [
          { id: 'a9', title: 'Non-Verbal Gestures & Picture Exchange (PECS)', duration: '16:00', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { id: 'a10', title: 'Joint Attention & Eye Contact Play Techniques', duration: '14:15', isFree: false, videoId: 'sBws8MSXN7A' },
          { id: 'a11', title: 'Encouraging First Words & Sentence Expansion', duration: '17:20', isFree: false, videoId: '1f_33Y4c4b0' },
          { id: 'a12', title: 'Peer Play & Turn-Taking Activities at Home', duration: '12:35', isFree: false, videoId: 'aqz-KE-bpKQ' },
        ],
      },
      {
        id: 4,
        title: 'Module 4: Behavior Management & Emotional Regulation',
        lessons: [
          { id: 'a13', title: 'Positive Reinforcement Systems That Actually Work', duration: '13:50', isFree: true, videoId: '1f_33Y4c4b0' },
          { id: 'a14', title: 'De-escalation Steps During Meltdowns', duration: '15:40', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { id: 'a15', title: 'Handling Aggression & Self-Soothing Habits', duration: '11:25', isFree: false, videoId: 'sBws8MSXN7A' },
          { id: 'a16', title: 'Reward Charts & Token Economies', duration: '08:50', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
      {
        id: 5,
        title: 'Module 5: Daily Living Skills, School & Beyond',
        lessons: [
          { id: 'a17', title: 'Toileting & Feeding Sensitivity Strategies', duration: '16:15', isFree: false, videoId: 'sBws8MSXN7A' },
          { id: 'a18', title: 'Morning & Bedtime Routines Without Power Struggles', duration: '14:00', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { id: 'a19', title: 'Classroom Accommodations & Teacher Handover Checklist', duration: '12:10', isFree: false, videoId: '1f_33Y4c4b0' },
          { id: 'a20', title: 'Summary, Milestone Tracker & Final Certification', duration: '09:30', isFree: false, videoId: 'sBws8MSXN7A' },
        ],
      },
    ],
  },

  'speech-therapy': {
    id: 'speech-therapy',
    title: 'Pediatric Speech & Language Masterclass',
    category: 'Speech Therapy',
    themeColor: '#0284c7',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/SpeechCard2.webp',
    mainVideoId: 'sBws8MSXN7A',
    lecturesCount: 18,
    language: 'Hindi',
    price: '₹1,299',
    originalPrice: '₹3,499',
    discount: '63% OFF',
    savings: 'Save ₹2,200',
    description:
      'Master clinical articulation routines, oral motor drills, stammering correction, and conversational speech boosters for kids aged 1.5 to 10 years.',
    instructor: {
      name: 'Dr. Neha Verma (SLP)',
      role: 'Chief Speech-Language Pathologist',
      experience: '12+ Years Clinical Practice',
      avatar: 'https://images.unsplash.com/photo-1594824813572-8f1ba9a39a79?w=150&auto=format&fit=crop&q=80',
      bio: 'Renowned pediatric speech therapist dedicated to early articulation correction, fluency therapy, and receptive-expressive language development.',
    },
    studyMaterial: {
      title: 'Speech Sounds & Oral Motor Practice Flashcards',
      subtitle: 'Printable phoneme decks, sound-ladder charts & speech diary.',
      pages: '38 Pages PDF',
      fileSize: '6.2 MB',
    },
    whatYouWillLearn: [
      'Pronunciation correction for R, S, L, K, G sounds step by step.',
      'Oral motor strengthening exercises (tongue, lips, cheeks, jaw).',
      'Fluency routines to reduce stammering and speech hesitation.',
      'Expressive vocabulary expansion routines for late-talkers.',
      'Parent-child interactive speech games for everyday routines.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Language Milestones & Articulation Foundations',
        lessons: [
          { id: 's1', title: 'Speech Delay vs Language Disorder: Red Flags', duration: '11:30', isFree: true, videoId: 'sBws8MSXN7A' },
          { id: 's2', title: 'Oral Motor Anatomy & Speech Sound Hierarchy', duration: '13:45', isFree: true, videoId: 'aqz-KE-bpKQ' },
          { id: 's3', title: 'Daily Speech Screening Checklist for Parents', duration: '08:20', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Oral Placement Therapy & Tongue Exercises',
        lessons: [
          { id: 's4', title: 'Lip Closure, Straw Drinking & Horn Blowing Drills', duration: '14:50', isFree: true, videoId: '1f_33Y4c4b0' },
          { id: 's5', title: 'Tongue Tip Elevation Exercises for Clear Sounds', duration: '16:10', isFree: false, videoId: 'sBws8MSXN7A' },
          { id: 's6', title: 'Jaw Grading & Chewing Therapy at Home', duration: '12:00', isFree: false, videoId: 'aqz-KE-bpKQ' },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Articulation Correction (Phoneme Drills)',
        lessons: [
          { id: 's7', title: 'Fixing /K/ and /G/ Throat Sounds (Velar Fronting)', duration: '15:20', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { id: 's8', title: 'Clear /R/ and /L/ Tongue Roll Techniques', duration: '17:40', isFree: false, videoId: 'sBws8MSXN7A' },
          { id: 's9', title: 'Correcting Lisping & /S/ Distortion', duration: '13:15', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
      {
        id: 4,
        title: 'Module 4: Stammering, Fluency & Confidence Building',
        lessons: [
          { id: 's10', title: 'Diaphragmatic Breathing for Fluent Speech', duration: '12:45', isFree: false, videoId: 'sBws8MSXN7A' },
          { id: 's11', title: 'Gentle Onset & Easy Prolongation Strategies', duration: '14:30', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { id: 's12', title: 'Overcoming Speaking Anxiety in Public or School', duration: '10:50', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
    ],
  },

  'occupational-therapy': {
    id: 'occupational-therapy',
    title: 'Pediatric Occupational Therapy & Sensory Integration',
    category: 'Occupational Therapy',
    themeColor: '#ea580c',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/OccuptaitonalCard3.webp',
    mainVideoId: '1f_33Y4c4b0',
    lecturesCount: 16,
    language: 'Hindi',
    price: '₹1,299',
    originalPrice: '₹3,499',
    discount: '63% OFF',
    savings: 'Save ₹2,200',
    description:
      'Build motor coordination, sitting tolerance, pencil grip, bilateral integration, and independent daily living skills using clinical OT exercises.',
    instructor: {
      name: 'Pooja Sharma (Senior OT)',
      role: 'Consultant Pediatric Occupational Therapist',
      experience: '10+ Years Experience',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bio: 'Expert clinical OT working on sensory processing, vestibular regulation, handwriting biomechanics, and pediatric functional independence.',
    },
    studyMaterial: {
      title: 'Pediatric OT Home Activity Guide & Grip Kit',
      subtitle: 'Illustrated exercise routines, pencil grip worksheets & sensory diet checklist.',
      pages: '40 Pages PDF',
      fileSize: '7.8 MB',
    },
    whatYouWillLearn: [
      'Pencil grip correction & handwriting endurance without pain.',
      'Sitting tolerance improvement from 5 mins to 30+ mins.',
      'Vestibular & proprioceptive activities for restless, hyperactive kids.',
      'Bilateral hand coordination & fine motor scissors/buttoning skills.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Sensory Integration & Motor Milestones',
        lessons: [
          { id: 'o1', title: 'Sensory Profiles: Seekers vs Avoiders', duration: '13:20', isFree: true, videoId: '1f_33Y4c4b0' },
          { id: 'o2', title: 'Vestibular & Proprioception: The Hidden Senses', duration: '15:10', isFree: true, videoId: 'aqz-KE-bpKQ' },
          { id: 'o3', title: 'Core Muscle Tone & Postural Control Drills', duration: '11:40', isFree: false, videoId: 'sBws8MSXN7A' },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Sitting Tolerance & Focus Enhancement',
        lessons: [
          { id: 'o4', title: 'Ergonomic Desk & Chair Setup for Hyperactive Kids', duration: '10:15', isFree: true, videoId: 'sBws8MSXN7A' },
          { id: 'o5', title: 'Heavy Work Activities to Ground Restless Energy', duration: '14:30', isFree: false, videoId: '1f_33Y4c4b0' },
          { id: 'o6', title: 'Gradual Sitting Span Extension Protocols', duration: '12:00', isFree: false, videoId: 'aqz-KE-bpKQ' },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Fine Motor & Pencil Grip Development',
        lessons: [
          { id: 'o7', title: 'Tripod Grip Formation with Everyday Clothespins', duration: '13:50', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { id: 'o8', title: 'Hand Dominance & Bilateral Scissor Skills', duration: '16:20', isFree: false, videoId: 'sBws8MSXN7A' },
          { id: 'o9', title: 'Handwriting Biomechanics & Speed Exercises', duration: '14:10', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
    ],
  },

  'behaviour-therapy': {
    id: 'behaviour-therapy',
    title: 'Pediatric Applied Behaviour & Emotion Coaching',
    category: 'Behaviour Therapy',
    themeColor: '#7c3aed',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/BehaviourCard4.webp',
    mainVideoId: 'aqz-KE-bpKQ',
    lecturesCount: 14,
    language: 'Hindi',
    price: '₹1,299',
    originalPrice: '₹3,499',
    discount: '63% OFF',
    savings: 'Save ₹2,200',
    description:
      'Transform stubbornness, anger tantrums, screaming, and hyperactivity into positive cooperation and emotional self-regulation.',
    instructor: {
      name: 'Clinical Child Psychologist',
      role: 'Certified Behaviour Therapist',
      experience: '9+ Years Experience',
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
      bio: 'Specialist in pediatric behavioral modification, positive discipline, and parent emotional co-regulation.',
    },
    studyMaterial: {
      title: 'Positive Discipline & Emotion Regulation Guide',
      subtitle: 'Behavior logs, visual token charts & cooldown routine cards.',
      pages: '32 Pages PDF',
      fileSize: '5.5 MB',
    },
    whatYouWillLearn: [
      'The ABCs of behavior: Antecedent, Behavior, Consequence.',
      'Stop screaming, biting, throwing, and aggressive tantrums safely.',
      'Set gentle, unbreakable boundaries without yelling or guilt.',
      'Bedtime, screen-time, and mealtime transitions with zero resistance.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: The Psychology of Child Tantrums',
        lessons: [
          { id: 'b1', title: 'Why Kids Tantrum: Sensory vs Manipulative Crying', duration: '12:15', isFree: true, videoId: 'aqz-KE-bpKQ' },
          { id: 'b2', title: 'Parent Calmness: Co-Regulation Before De-escalation', duration: '14:00', isFree: true, videoId: 'sBws8MSXN7A' },
          { id: 'b3', title: 'The 4 Functions of Every Child Behavior', duration: '11:20', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Practical Interventions for Defiant Habits',
        lessons: [
          { id: 'b4', title: 'Handling Public Meltdowns with Grace & Safety', duration: '15:30', isFree: false, videoId: '1f_33Y4c4b0' },
          { id: 'b5', title: 'Extinction Bursts: What to Expect When Saying No', duration: '13:40', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { id: 'b6', title: 'Designing an Effective Token Economy at Home', duration: '10:50', isFree: false, videoId: 'sBws8MSXN7A' },
        ],
      },
    ],
  },

  'special-education': {
    id: 'special-education',
    title: 'Special Education & Academic Readiness',
    category: 'Special Education',
    themeColor: '#d97706',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/SpecialEducationCard5.webp',
    mainVideoId: 'sBws8MSXN7A',
    lecturesCount: 15,
    language: 'Hindi',
    price: '₹1,299',
    originalPrice: '₹3,499',
    discount: '63% OFF',
    savings: 'Save ₹2,200',
    description:
      'Personalized early academic strategies for reading, math concepts, memory boosting, phonics, and individualized educational progress.',
    instructor: {
      name: 'Special Educator Mentors',
      role: 'Certified Inclusive Education Specialists',
      experience: '8+ Years Practice',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      bio: 'Leading special educators crafting structured visual teaching tools for diverse learning styles.',
    },
    studyMaterial: {
      title: 'Special Education Visual Phonics & Number Flashcards',
      subtitle: 'Printable multisensory worksheets & learning tracker.',
      pages: '35 Pages PDF',
      fileSize: '6.9 MB',
    },
    whatYouWillLearn: [
      'Multisensory reading and phonics methods for slow learners.',
      'Number sense, counting, and pattern recognition without stress.',
      'Memory enhancement routines and visual memory games.',
      'School accommodation protocols and IEP alignment.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Multisensory Learning Strategies',
        lessons: [
          { id: 'se1', title: 'Visual, Auditory & Kinesthetic Learning Styles', duration: '11:45', isFree: true, videoId: 'sBws8MSXN7A' },
          { id: 'se2', title: 'Phonics with Tactile Sandpaper Letters', duration: '13:10', isFree: true, videoId: 'aqz-KE-bpKQ' },
          { id: 'se3', title: 'Overcoming Letter Reversals (b vs d, p vs q)', duration: '12:00', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
    ],
  },

  'pediatric-rehab': {
    id: 'pediatric-rehab',
    title: 'Pediatric Physical Rehab & Gross Motor Skills',
    category: 'Pediatric Rehabilitation',
    themeColor: '#0d9488',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/RehabCard6.webp',
    mainVideoId: '1f_33Y4c4b0',
    lecturesCount: 14,
    language: 'Hindi',
    price: '₹1,299',
    originalPrice: '₹3,499',
    discount: '63% OFF',
    savings: 'Save ₹2,200',
    description:
      'Support gross motor milestones, walking gait, toe-walking correction, balance, core stability, and pediatric physical rehabilitation.',
    instructor: {
      name: 'Pediatric Physiotherapy Team',
      role: 'Certified Pediatric Physical Therapists',
      experience: '11+ Years Clinical Care',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      bio: 'Specialized in pediatric developmental posture, gait biomechanics, cerebral palsy, and muscle tone management.',
    },
    studyMaterial: {
      title: 'Gross Motor Milestone & Balance Exercises Handbook',
      subtitle: 'Step-by-step photographic posture drills & stretching guide.',
      pages: '30 Pages PDF',
      fileSize: '5.8 MB',
    },
    whatYouWillLearn: [
      'Gait correction for persistent toe-walking and flat feet.',
      'Core strength, balance board, and coordination games at home.',
      'Safe stretching protocols for tight calf muscles and hamstrings.',
      'Milestone stimulation: crawling, climbing, jumping, and running.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Posture, Gait & Balance Fundamentals',
        lessons: [
          { id: 'pr1', title: 'Toe-Walking: Sensory vs Muscle Tightness Causes', duration: '14:20', isFree: true, videoId: '1f_33Y4c4b0' },
          { id: 'pr2', title: 'Balance Board & Trampoline Home Drills', duration: '13:00', isFree: true, videoId: 'sBws8MSXN7A' },
          { id: 'pr3', title: 'Calf & Hamstring Gentle Stretching Routines', duration: '11:15', isFree: false, videoId: 'aqz-KE-bpKQ' },
        ],
      },
    ],
  },
};
