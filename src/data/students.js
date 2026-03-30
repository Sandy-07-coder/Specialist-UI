export const studentsData = [
  { 
    id: "1", name: "Ethan Williams", age: 8, diagnosis: "Autism Spectrum Disorder", mood: "Happy", taskCompletion: "85%",
    image: "https://i.pravatar.cc/150?u=1", support_level: "High", assigned_specialists: ["Dr. Sarah Lee", "Mark Spencer (OT)"],
    specialist_notes: "Ethan has shown incredible progress this week. He responded well to visual schedules. Keep encouraging verbal requests.",
    mood_history: [ { mood: "Happy", value: 40, fill: "var(--color-happy)" }, { mood: "Sad", value: 10, fill: "var(--color-sad)" }, { mood: "Overwhelmed", value: 15, fill: "var(--color-overwhelmed)" }, { mood: "Angry", value: 5, fill: "var(--color-angry)" }, { mood: "Tired", value: 20, fill: "var(--color-tired)" }, { mood: "Anxious", value: 10, fill: "var(--color-anxious)" } ],
    task_history: [ { day: "Mon", tasks: 4 }, { day: "Tue", tasks: 5 }, { day: "Wed", tasks: 3 }, { day: "Thu", tasks: 6 }, { day: "Fri", tasks: 5 }, { day: "Sat", tasks: 2 }, { day: "Sun", tasks: 4 } ],
    progress_metrics: [ { subject: "Communication", score: 85 }, { subject: "Social Skills", score: 60 }, { subject: "Focus", score: 75 }, { subject: "Motor Skills", score: 65 }, { subject: "Behavior", score: 80 } ],
    tasks: [
      { id: "t1", title: "Morning Routine", description: "Complete the morning routine using visual schedule boards.", status: "Completed", assignedDate: "Mar 18, 2026" },
      { id: "t2", title: "Speech Practice", description: "Practice saying 5 new vocabulary words with the SLP.", status: "In Progress", assignedDate: "Mar 20, 2026" }
    ]
  },
  { 
    id: "2", name: "Sophia Martinez", age: 10, diagnosis: "ADHD", mood: "Anxious", taskCompletion: "42%",
    image: "https://i.pravatar.cc/150?u=2", support_level: "Medium", assigned_specialists: ["Dr. Emma Cole"],
    specialist_notes: "Sophia is struggling with focus during longer tasks. Recommend breaking tasks down into 5-minute increments.",
    mood_history: [ { mood: "Happy", value: 20, fill: "var(--color-happy)" }, { mood: "Sad", value: 15, fill: "var(--color-sad)" }, { mood: "Overwhelmed", value: 25, fill: "var(--color-overwhelmed)" }, { mood: "Angry", value: 10, fill: "var(--color-angry)" }, { mood: "Tired", value: 10, fill: "var(--color-tired)" }, { mood: "Anxious", value: 20, fill: "var(--color-anxious)" } ],
    task_history: [ { day: "Mon", tasks: 2 }, { day: "Tue", tasks: 1 }, { day: "Wed", tasks: 3 }, { day: "Thu", tasks: 2 }, { day: "Fri", tasks: 2 }, { day: "Sat", tasks: 1 }, { day: "Sun", tasks: 0 } ],
    progress_metrics: [ { subject: "Communication", score: 90 }, { subject: "Social Skills", score: 85 }, { subject: "Focus", score: 40 }, { subject: "Motor Skills", score: 95 }, { subject: "Behavior", score: 60 } ],
    tasks: [
      { id: "t3", title: "Math Worksheet", description: "Complete the 10-question math worksheet in 5-minute chunks.", status: "Completed" },
      { id: "t4", title: "Reading Time", description: "Read one chapter of a book without distractions.", status: "In Progress" }
    ]
  },
  { 
    id: "3", name: "Liam Johnson", age: 7, diagnosis: "ASD Level 2", mood: "Calm", taskCompletion: "90%",
    image: "https://i.pravatar.cc/150?u=3", support_level: "High", assigned_specialists: ["Dr. Sarah Lee", "Jane Doe (SLP)"],
    specialist_notes: "Liam is doing phenomenal with his AAC device. He initiated 5 conversations today.",
    mood_history: [ { mood: "Happy", value: 60, fill: "var(--color-happy)" }, { mood: "Sad", value: 5, fill: "var(--color-sad)" }, { mood: "Overwhelmed", value: 10, fill: "var(--color-overwhelmed)" }, { mood: "Angry", value: 0, fill: "var(--color-angry)" }, { mood: "Tired", value: 15, fill: "var(--color-tired)" }, { mood: "Anxious", value: 10, fill: "var(--color-anxious)" } ],
    task_history: [ { day: "Mon", tasks: 5 }, { day: "Tue", tasks: 6 }, { day: "Wed", tasks: 6 }, { day: "Thu", tasks: 5 }, { day: "Fri", tasks: 6 }, { day: "Sat", tasks: 3 }, { day: "Sun", tasks: 4 } ],
    progress_metrics: [ { subject: "Communication", score: 70 }, { subject: "Social Skills", score: 50 }, { subject: "Focus", score: 85 }, { subject: "Motor Skills", score: 55 }, { subject: "Behavior", score: 90 } ],
    tasks: [
      { id: "t5", title: "AAC Conversation", description: "Initiate at least 3 conversations using the AAC device.", status: "Completed" },
      { id: "t6", title: "Puzzle Completion", description: "Complete the 20-piece puzzle during break time.", status: "Completed" }
    ]
  },
  { 
    id: "4", name: "Isabella Davis", age: 9, diagnosis: "Dyslexia", mood: "Frustrated", taskCompletion: "30%",
    image: "https://i.pravatar.cc/150?u=4", support_level: "Low", assigned_specialists: ["Robert Black (Tutor)"],
    specialist_notes: "Reading comprehension tasks are causing frustration. We will try audio-assisted reading next session.",
    mood_history: [ { mood: "Happy", value: 15, fill: "var(--color-happy)" }, { mood: "Sad", value: 20, fill: "var(--color-sad)" }, { mood: "Overwhelmed", value: 25, fill: "var(--color-overwhelmed)" }, { mood: "Angry", value: 15, fill: "var(--color-angry)" }, { mood: "Tired", value: 15, fill: "var(--color-tired)" }, { mood: "Anxious", value: 10, fill: "var(--color-anxious)" } ],
    task_history: [ { day: "Mon", tasks: 1 }, { day: "Tue", tasks: 2 }, { day: "Wed", tasks: 1 }, { day: "Thu", tasks: 2 }, { day: "Fri", tasks: 1 }, { day: "Sat", tasks: 0 }, { day: "Sun", tasks: 0 } ],
    progress_metrics: [ { subject: "Communication", score: 95 }, { subject: "Social Skills", score: 90 }, { subject: "Focus", score: 70 }, { subject: "Reading", score: 35 }, { subject: "Behavior", score: 80 } ],
    tasks: [
      { id: "t7", title: "Audio Reading", description: "Listen to 15 minutes of the assigned audiobook while following along.", status: "In Progress" },
      { id: "t8", title: "Spelling Game", description: "Play the interactive spelling game for 10 minutes.", status: "Pending" }
    ]
  },
  { 
    id: "5", name: "Noah Garcia", age: 11, diagnosis: "ADHD, ASD", mood: "Energetic", taskCompletion: "75%",
    image: "https://i.pravatar.cc/150?u=5", support_level: "Medium", assigned_specialists: ["Dr. Emma Cole", "Lisa Ray (PT)"],
    specialist_notes: "Noah has high energy. Sensory breaks are working perfectly to keep him on track.",
    mood_history: [ { mood: "Happy", value: 50, fill: "var(--color-happy)" }, { mood: "Sad", value: 5, fill: "var(--color-sad)" }, { mood: "Overwhelmed", value: 10, fill: "var(--color-overwhelmed)" }, { mood: "Angry", value: 5, fill: "var(--color-angry)" }, { mood: "Tired", value: 10, fill: "var(--color-tired)" }, { mood: "Anxious", value: 20, fill: "var(--color-anxious)" } ],
    task_history: [ { day: "Mon", tasks: 4 }, { day: "Tue", tasks: 4 }, { day: "Wed", tasks: 5 }, { day: "Thu", tasks: 4 }, { day: "Fri", tasks: 5 }, { day: "Sat", tasks: 2 }, { day: "Sun", tasks: 3 } ],
    progress_metrics: [ { subject: "Communication", score: 75 }, { subject: "Social Skills", score: 65 }, { subject: "Focus", score: 60 }, { subject: "Motor Skills", score: 80 }, { subject: "Behavior", score: 75 } ],
    tasks: [
      { id: "t9", title: "Sensory Room Circuit", description: "Complete the 15-minute physical therapy circuit in the sensory room.", status: "Completed" },
      { id: "t10", title: "Writing Assignment", description: "Write a 3-sentence paragraph after completion of the sensory break.", status: "In Progress" }
    ]
  },
];