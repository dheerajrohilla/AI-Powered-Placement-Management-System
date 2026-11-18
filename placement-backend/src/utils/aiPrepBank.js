/**
 * Verified Question Bank for AI Placement Preparation Platform
 * Categories:
 * 1. Aptitude (Quantitative, Logical Reasoning, Verbal Ability, Data Interpretation)
 * 2. Technical (DSA, Core CS, Java, Python, C++, JavaScript, SQL, Web Dev, System Design)
 * 3. HR Interview (STAR format, behavioral, project explanation, culture fit)
 * 4. Company-Specific Patterns (TCS, Infosys, Accenture, Capgemini, Wipro, Cognizant, Product Companies)
 */

export const APTITUDE_QUESTIONS = [
  // Quantitative Aptitude
  {
    id: "APT-QUANT-01",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Percentages & Profit-Loss",
    difficulty: "medium",
    questionType: "mcq",
    questionText: "A trader sells an article at a profit of 20%. If he had bought it at 10% less and sold it for ₹18 less, he would have gained 25%. What is the cost price of the article?",
    options: ["₹300", "₹360", "₹400", "₹450"],
    correctAnswer: "₹400",
    maxMarks: 2,
    timeAllocationSeconds: 90,
    explanation: "Let Cost Price = CP. Initial Selling Price SP = 1.2 * CP.\nNew CP = 0.9 * CP. New SP = 1.2 * CP - 18.\nGiven new profit = 25%, so New SP = 1.25 * New CP = 1.25 * (0.9 * CP) = 1.125 * CP.\nTherefore: 1.2 * CP - 18 = 1.125 * CP => 0.075 * CP = 18 => CP = 18 / 0.075 = ₹400."
  },
  {
    id: "APT-QUANT-02",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Time and Work",
    difficulty: "easy",
    questionType: "mcq",
    questionText: "Pipe A can fill a tank in 12 hours, and Pipe B can empty it in 18 hours. If both pipes are opened together when the tank is empty, in how many hours will the tank be completely filled?",
    options: ["24 hours", "30 hours", "36 hours", "42 hours"],
    correctAnswer: "36 hours",
    maxMarks: 2,
    timeAllocationSeconds: 75,
    explanation: "Net rate per hour = (1/12) - (1/18) = (3 - 2) / 36 = 1/36 of the tank per hour.\nTotal time required = 36 hours."
  },
  {
    id: "APT-QUANT-03",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Probability & Permutations",
    difficulty: "medium",
    questionType: "numerical",
    questionText: "Two fair six-sided dice are rolled simultaneously. What is the probability (as a decimal rounded to two decimal places) of getting a sum greater than or equal to 10?",
    correctAnswer: "0.17",
    numericalTolerance: 0.02,
    maxMarks: 2,
    timeAllocationSeconds: 60,
    explanation: "Total outcomes = 6 * 6 = 36.\nFavorable outcomes with sum >= 10:\nSum = 10: (4,6), (5,5), (6,4) -> 3 outcomes\nSum = 11: (5,6), (6,5) -> 2 outcomes\nSum = 12: (6,6) -> 1 outcome\nTotal favorable = 3 + 2 + 1 = 6.\nProbability = 6 / 36 = 1/6 ≈ 0.1667 => 0.17."
  },
  {
    id: "APT-QUANT-04",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Time-Speed-Distance",
    difficulty: "hard",
    questionType: "mcq",
    questionText: "A train running at 72 km/h crosses a platform of length 250 meters in 26 seconds. How long will the same train take to cross a pole?",
    options: ["11.5 seconds", "12.5 seconds", "13.5 seconds", "14.5 seconds"],
    correctAnswer: "13.5 seconds",
    maxMarks: 2,
    timeAllocationSeconds: 90,
    explanation: "Speed of train = 72 * (5/18) = 20 m/s.\nDistance covered crossing platform = Length of train (L) + Length of platform (250) = Speed * Time = 20 * 26 = 520 m.\nL = 520 - 250 = 270 meters.\nTime to cross a pole = L / Speed = 270 / 20 = 13.5 seconds."
  },
  {
    id: "APT-QUANT-05",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Number Systems",
    difficulty: "easy",
    questionType: "mcq",
    questionText: "What is the remainder when (7^84) is divided by 342?",
    options: ["1", "7", "49", "341"],
    correctAnswer: "1",
    maxMarks: 2,
    timeAllocationSeconds: 60,
    explanation: "Note that 7^3 = 343 = 342 + 1.\n(7^84) = (7^3)^28 = (342 + 1)^28.\nBy binomial expansion, all terms except 1^28 are multiples of 342.\nRemainder = 1^28 mod 342 = 1."
  },

  // Logical Reasoning
  {
    id: "APT-LOGIC-01",
    category: "aptitude",
    topic: "Logical Reasoning",
    subtopic: "Coding-Decoding",
    difficulty: "easy",
    questionType: "mcq",
    questionText: "In a certain code language, 'SYSTEM' is coded as 'SYSMET' and 'NEARER' is coded as 'AENRER'. How will 'FRACTION' be coded in that language?",
    options: ["CARFNOIT", "CARFTION", "NOITCARF", "ARFCNOIT"],
    correctAnswer: "CARFNOIT",
    maxMarks: 2,
    timeAllocationSeconds: 60,
    explanation: "The word has 8 letters. Split it into two equal halves of 4 letters: 'FRAC' and 'TION'.\nReverse the first half: 'FRAC' -> 'CARF'.\nReverse the second half: 'TION' -> 'NOIT'.\nCombined code = 'CARFNOIT'."
  },
  {
    id: "APT-LOGIC-02",
    category: "aptitude",
    topic: "Logical Reasoning",
    subtopic: "Syllogisms",
    difficulty: "medium",
    questionType: "mcq",
    questionText: "Statements:\n1. All developers are engineers.\n2. Some engineers are designers.\nConclusions:\nI. Some developers are designers.\nII. Some engineers are developers.\nWhich conclusion(s) logically follow?",
    options: ["Only conclusion I follows", "Only conclusion II follows", "Both conclusions I and II follow", "Neither conclusion follows"],
    correctAnswer: "Only conclusion II follows",
    maxMarks: 2,
    timeAllocationSeconds: 70,
    explanation: "Since all developers are inside engineers, there must be engineers who are developers (Conversion of All A are B is Some B are A). Thus II is definitely true.\nNo direct overlap is guaranteed between developers and designers. Thus I does not necessarily follow."
  },
  {
    id: "APT-LOGIC-03",
    category: "aptitude",
    topic: "Logical Reasoning",
    subtopic: "Blood Relations",
    difficulty: "medium",
    questionType: "mcq",
    questionText: "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
    options: ["Brother", "Uncle", "Father", "Grandfather"],
    correctAnswer: "Father",
    maxMarks: 2,
    timeAllocationSeconds: 60,
    explanation: "'The only son of my mother' refers to Suresh himself (assuming single son).\nTherefore, the boy is the son of Suresh. So Suresh is the father of that boy."
  },
  {
    id: "APT-LOGIC-04",
    category: "aptitude",
    topic: "Logical Reasoning",
    subtopic: "Seating Arrangement",
    difficulty: "hard",
    questionType: "mcq",
    questionText: "Five friends A, B, C, D, and E are sitting in a circle facing the center. A is to the immediate right of B. E is between C and D. C is to the immediate left of B. Who is sitting to the immediate right of A?",
    options: ["B", "C", "D", "E"],
    correctAnswer: "D",
    maxMarks: 2,
    timeAllocationSeconds: 90,
    explanation: "Facing center in circle:\nB is seated. A is immediate right of B.\nC is immediate left of B.\nE is between C and D. So moving leftwards: B -> C -> E -> D -> A -> B.\nLooking at A's right: to the immediate right of A sits D."
  },

  // Verbal Ability
  {
    id: "APT-VERBAL-01",
    category: "aptitude",
    topic: "Verbal Ability",
    subtopic: "Sentence Correction",
    difficulty: "medium",
    questionType: "mcq",
    questionText: "Choose the grammatically correct sentence from the following options:",
    options: [
      "Neither the manager nor the employees was present at the quarterly meeting.",
      "Neither the manager nor the employees were present at the quarterly meeting.",
      "Neither the manager or the employees was present at the quarterly meeting.",
      "Neither the manager nor the employees has been present at the quarterly meeting."
    ],
    correctAnswer: "Neither the manager nor the employees were present at the quarterly meeting.",
    maxMarks: 2,
    timeAllocationSeconds: 45,
    explanation: "When two subjects are joined by 'neither... nor', the verb agrees in number with the subject closest to it. Here, 'employees' is plural and closest to the verb, so the plural verb 'were' is correct."
  },
  {
    id: "APT-VERBAL-02",
    category: "aptitude",
    topic: "Verbal Ability",
    subtopic: "Vocabulary & Antonyms",
    difficulty: "easy",
    questionType: "mcq",
    questionText: "What is the most appropriate ANTONYM of the word 'EPHEMERAL'?",
    options: ["Transient", "Permanent", "Fleeting", "Fragile"],
    correctAnswer: "Permanent",
    maxMarks: 2,
    timeAllocationSeconds: 40,
    explanation: "'Ephemeral' means lasting for a very short time (transient/fleeting). Its antonym is 'Permanent' or 'Enduring'."
  }
];

export const TECHNICAL_QUESTIONS = [
  // Technical MCQs
  {
    id: "TECH-DSA-MCQ-01",
    category: "technical",
    topic: "Data Structures & Algorithms",
    subtopic: "Time Complexity & Trees",
    difficulty: "medium",
    questionType: "mcq",
    questionText: "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST) versus an AVL tree?",
    options: [
      "O(log n) for BST and O(n) for AVL",
      "O(n) for BST and O(log n) for AVL",
      "O(1) for BST and O(log n) for AVL",
      "O(n log n) for BST and O(n) for AVL"
    ],
    correctAnswer: "O(n) for BST and O(log n) for AVL",
    maxMarks: 2,
    timeAllocationSeconds: 60,
    explanation: "In an unbalanced BST, elements inserted in sorted order form a skewed degenerate linked list, leading to O(n) worst-case search. An AVL tree enforces self-balancing via height factor rotations, maintaining O(log n) strictly."
  },
  {
    id: "TECH-JAVA-MCQ-01",
    category: "technical",
    topic: "Java",
    subtopic: "Memory Management",
    difficulty: "easy",
    questionType: "mcq",
    questionText: "Where are local primitive variables and object instances stored in the Java Virtual Machine (JVM) memory model?",
    options: [
      "Both local primitives and objects are stored in the Stack memory.",
      "Local primitives are stored in Stack memory, while object instances are stored in Heap memory.",
      "Both are stored in Heap memory.",
      "Local primitives are stored in Method Area, while objects are in Stack."
    ],
    correctAnswer: "Local primitives are stored in Stack memory, while object instances are stored in Heap memory.",
    maxMarks: 2,
    timeAllocationSeconds: 45,
    explanation: "In Java, method execution frames with local primitives and reference variables are allocated on the Stack. All object instances and arrays are allocated dynamically on the Heap."
  },
  {
    id: "TECH-DBMS-MCQ-01",
    category: "technical",
    topic: "DBMS & SQL",
    subtopic: "ACID Properties & Transactions",
    difficulty: "medium",
    questionType: "mcq",
    questionText: "Which ACID property guarantees that database transactions are executed concurrently without interferences, preserving the outcome as if transactions were executed sequentially?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correctAnswer: "Isolation",
    maxMarks: 2,
    timeAllocationSeconds: 45,
    explanation: "Isolation ensures that intermediate transaction states are invisible to concurrently executing transactions, preventing dirty reads, non-repeatable reads, and phantom reads depending on isolation level."
  },
  {
    id: "TECH-CN-MCQ-01",
    category: "technical",
    topic: "Computer Networks",
    subtopic: "Protocols & Handshakes",
    difficulty: "medium",
    questionType: "mcq",
    questionText: "During the TCP 3-way handshake to establish a connection, which flags are exchanged in sequence from Client to Server and back?",
    options: [
      "SYN -> SYN-ACK -> ACK",
      "ACK -> SYN -> SYN-ACK",
      "FIN -> ACK -> FIN-ACK",
      "SYN -> ACK -> DATA"
    ],
    correctAnswer: "SYN -> SYN-ACK -> ACK",
    maxMarks: 2,
    timeAllocationSeconds: 50,
    explanation: "Step 1: Client sends SYN. Step 2: Server responds with SYN-ACK acknowledging client sequence number and proposing its own. Step 3: Client replies with ACK."
  },

  // Technical Short-Answer & Conceptual Questions (Subjective)
  {
    id: "TECH-DSA-SUB-01",
    category: "technical",
    topic: "Data Structures & Algorithms",
    subtopic: "Hashing & Collisions",
    difficulty: "medium",
    questionType: "short_answer",
    questionText: "Explain how hash collisions are resolved using Open Addressing (Linear Probing) vs Separate Chaining. What are the key trade-offs in cache locality and memory usage?",
    maxMarks: 5,
    timeAllocationSeconds: 180,
    rubric: [
      { criterion: "Technical correctness of collision mechanisms", weight: 40, description: "Accurate definition of separate chaining (linked list / buckets) and open addressing (probing slots in the table)." },
      { criterion: "Analysis of cache performance and memory overhead", weight: 30, description: "Explains contiguous memory cache advantage in open addressing vs pointer overhead in separate chaining." },
      { criterion: "Handling clustering / degradation", weight: 20, description: "Mentions primary/secondary clustering in probing and load factor sensitivity." },
      { criterion: "Clarity and structure", weight: 10, description: "Organized, concise technical terminology." }
    ],
    expectedKeyPoints: ["separate chaining", "linked lists / buckets", "open addressing", "linear probing", "cache locality", "contiguous array", "clustering", "load factor", "pointer overhead"],
    modelAnswer: "In Separate Chaining, each bucket stores a pointer to an external chain (linked list or balanced tree). When a collision occurs, the element is appended to that bucket's list. It handles high load factors gracefully but suffers from cache misses due to scattered pointer traversals and extra memory for node pointers.\nIn Open Addressing (Linear Probing), all elements reside directly within the hash table array. When a collision occurs, the algorithm checks sequential array slots (hash(k) + i mod N). It provides superior CPU cache locality because data is stored contiguously, but suffers from primary clustering and rapid performance degradation as the load factor approaches 0.7."
  },
  {
    id: "TECH-OOP-SUB-01",
    category: "technical",
    topic: "OOP & Software Engineering",
    subtopic: "SOLID Principles",
    difficulty: "medium",
    questionType: "long_answer",
    questionText: "Explain the Liskov Substitution Principle (LSP) and the Dependency Inversion Principle (DIP). Provide a real-world software architecture example showing how violating LSP breaks system behavior.",
    maxMarks: 10,
    timeAllocationSeconds: 300,
    rubric: [
      { criterion: "Technical definition of LSP and DIP", weight: 35, description: "Accurately defines LSP (subtypes substitutable for base types without altering correctness) and DIP (depend on abstractions, not concretions)." },
      { criterion: "Concrete violation example and consequences", weight: 35, description: "Presents classic Rectangle-Square or ReadOnly-Writable collection violation showing broken pre/postconditions or unexpected exceptions." },
      { criterion: "Architectural remedy and clean design", weight: 20, description: "Explains how refactoring to interfaces or composition fixes the violation." },
      { criterion: "Clarity, reasoning, and depth", weight: 10, description: "Coherent explanation with appropriate terminology." }
    ],
    expectedKeyPoints: ["subtypes must be substitutable", "base class contract", "preconditions and postconditions", "depend on abstractions", "high-level and low-level modules", "rectangle square problem", "unsupported operation exception"],
    modelAnswer: "1. Liskov Substitution Principle (LSP): Subtypes must be substitutable for their base types without altering the correctness or intended behavior of the program. Derived classes must adhere to the contract defined by the superclass (preconditions cannot be strengthened, postconditions cannot be weakened).\n2. Dependency Inversion Principle (DIP): High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.\n3. Classic LSP Violation Example:\nThe Square-Rectangle problem. If class Square inherits from Rectangle, setting width and height independently in client code (e.g. rect.setWidth(10); rect.setHeight(20); assert(rect.getArea() == 200)) breaks for Square because a square must maintain equal sides. Overriding setWidth to mutate height violates the caller's reasonable expectations.\nRemedy: Separate Square and Rectangle under a common Shape interface with a getArea() method, avoiding inappropriate inheritance."
  },
  {
    id: "TECH-OS-SUB-01",
    category: "technical",
    topic: "Operating Systems",
    subtopic: "Process Synchronization & Deadlocks",
    difficulty: "medium",
    questionType: "short_answer",
    questionText: "What are the four Coffman conditions necessary for a Deadlock to occur in an operating system? How does modern OS design prevent or recover from them?",
    maxMarks: 6,
    timeAllocationSeconds: 180,
    rubric: [
      { criterion: "Identification of all 4 Coffman conditions", weight: 50, description: "Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait." },
      { criterion: "Prevention and recovery strategies", weight: 40, description: "Resource ordering, timeout/preemption, Banker's algorithm, process termination." },
      { criterion: "Clarity and conciseness", weight: 10, description: "Clear and well-structured answer." }
    ],
    expectedKeyPoints: ["mutual exclusion", "hold and wait", "no preemption", "circular wait", "resource hierarchy", "banker's algorithm", "process termination"],
    modelAnswer: "A deadlock requires four simultaneous Coffman conditions:\n1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.\n2. Hold and Wait: A process holds at least one resource while waiting to acquire additional resources held by others.\n3. No Preemption: Resources cannot be forcibly taken from a process; they can only be released voluntarily.\n4. Circular Wait: A closed chain of processes exists such that each process holds a resource needed by the next.\n\nHandling:\n- Prevention: Break circular wait by enforcing a strict global resource acquisition ordering (hierarchical allocation), or eliminate hold-and-wait by requiring all resources upfront.\n- Recovery: Kill one or more deadlocked processes, or preempt resources and roll back processes to a safe checkpoint."
  },

  // SQL Query Writing Question
  {
    id: "TECH-SQL-PRAC-01",
    category: "technical",
    topic: "DBMS & SQL",
    subtopic: "SQL Query Writing",
    difficulty: "medium",
    questionType: "sql",
    questionText: "Write a SQL query to find the second highest salary from the Employee table. If there is no second highest salary, return NULL (aliased as 'SecondHighestSalary').",
    maxMarks: 5,
    timeAllocationSeconds: 150,
    sqlSchema: "CREATE TABLE Employee (id INT, salary INT); INSERT INTO Employee VALUES (1, 100), (2, 200), (3, 300);",
    sqlExpectedQuery: "SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);",
    expectedKeyPoints: ["MAX(salary)", "subquery", "WHERE salary <", "DISTINCT", "DENSE_RANK()", "LIMIT 1 OFFSET 1"],
    rubric: [
      { criterion: "Query correctness and logic", weight: 60, description: "Accurately extracts 2nd highest distinct value." },
      { criterion: "Edge case handling (NULL when only 1 distinct salary)", weight: 30, description: "Handles ties and tables with fewer than 2 distinct salaries." },
      { criterion: "SQL syntax standard", weight: 10, description: "Valid SQL syntax." }
    ],
    modelAnswer: "SELECT MAX(salary) AS SecondHighestSalary\nFROM Employee\nWHERE salary < (SELECT MAX(salary) FROM Employee);\n-- Alternative using LIMIT / OFFSET:\nSELECT (\n  SELECT DISTINCT salary\n  FROM Employee\n  ORDER BY salary DESC\n  LIMIT 1 OFFSET 1\n) AS SecondHighestSalary;"
  },

  // Practical Coding Question with automated test cases
  {
    id: "TECH-CODE-PRAC-01",
    category: "technical",
    topic: "Data Structures & Algorithms",
    subtopic: "Two Pointers & Arrays",
    difficulty: "medium",
    questionType: "coding",
    questionText: "Given an integer array `nums` sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order. Your solution must run in O(n) time.",
    maxMarks: 10,
    timeAllocationSeconds: 300,
    codeLanguage: "javascript",
    codeTemplate: "function sortedSquares(nums) {\n  // Write your O(n) solution here\n  \n}",
    testCases: [
      { input: "[-4,-1,0,3,10]", expectedOutput: "[0,1,9,16,100]", isHidden: false, weight: 25 },
      { input: "[-7,-3,2,3,11]", expectedOutput: "[4,9,9,49,121]", isHidden: false, weight: 25 },
      { input: "[-5,-3,-2,-1]", expectedOutput: "[1,4,9,25]", isHidden: true, weight: 25 },
      { input: "[0,2,4,6]", expectedOutput: "[0,4,16,36]", isHidden: true, weight: 25 }
    ],
    expectedKeyPoints: ["two pointers", "left and right pointers", "compare absolute values", "fill from end", "O(n) time complexity", "no sorting"],
    rubric: [
      { criterion: "Test case correctness", weight: 70, description: "Passes visible and hidden edge case test executions." },
      { criterion: "Time and space complexity", weight: 20, description: "Achieves linear O(n) time using two pointers without O(n log n) sorting." },
      { criterion: "Code hygiene & readability", weight: 10, description: "Clean variable naming and bounded loops." }
    ],
    modelAnswer: "function sortedSquares(nums) {\n  const n = nums.length;\n  const result = new Array(n);\n  let left = 0;\n  let right = n - 1;\n  let pos = n - 1;\n\n  while (left <= right) {\n    const leftSq = nums[left] * nums[left];\n    const rightSq = nums[right] * nums[right];\n    if (leftSq > rightSq) {\n      result[pos] = leftSq;\n      left++;\n    } else {\n      result[pos] = rightSq;\n      right--;\n    }\n    pos--;\n  }\n  return result;\n}"
  }
];

export const HR_QUESTIONS = [
  {
    id: "HR-BEHAV-01",
    category: "hr",
    topic: "HR & Behavioral",
    subtopic: "Personal Introduction",
    difficulty: "easy",
    questionType: "long_answer",
    questionText: "Tell me about yourself. Walk me through your academic background, core technical strengths, key project achievements, and why you are excited to start your software engineering career.",
    maxMarks: 10,
    timeAllocationSeconds: 180,
    rubric: [
      { criterion: "Relevance and structure (Chronological / Present-Past-Future)", weight: 30, description: "Follows clear narrative structure without rambling." },
      { criterion: "Technical competencies and concrete project highlights", weight: 30, description: "Mentions specific technical skills and demonstrable project impact." },
      { criterion: "Career ambition and genuine motivation", weight: 25, description: "Articulates authentic enthusiasm for software development and growth." },
      { criterion: "Professionalism and communication quality", weight: 15, description: "Crisp, confident, and professional articulation." }
    ],
    expectedKeyPoints: ["degree and specialization", "technical skills (languages/frameworks)", "key project overview and results", "problem solving passion", "career goals"],
    modelAnswer: "A high-impact answer follows the Present-Past-Future framework:\n1. Present: State your current status as a Computer Science undergraduate passionate about full-stack engineering and distributed systems.\n2. Past: Briefly mention your key technical foundation in Java/JavaScript and highlight your flagship project (e.g. an AI-powered placement platform or e-commerce API) highlighting your role, technologies used, and real-world results.\n3. Future: Connect your drive for solving impactful problems with your aspiration to contribute as a Software Engineer, emphasizing rapid learning, adaptability, and collaboration."
  },
  {
    id: "HR-BEHAV-02",
    category: "hr",
    topic: "HR & Behavioral",
    subtopic: "Strengths & Weaknesses",
    difficulty: "medium",
    questionType: "long_answer",
    questionText: "What do you consider your greatest professional strength and your biggest area for improvement (weakness)? How are you actively working on overcoming that weakness?",
    maxMarks: 10,
    timeAllocationSeconds: 180,
    rubric: [
      { criterion: "Authenticity and self-awareness", weight: 35, description: "Presents a genuine, credible strength and a real, honest area of improvement (not a disguised humblebrag like 'I work too hard')." },
      { criterion: "Actionable improvement plan", weight: 35, description: "Provides concrete steps, tools, or habits adopted to actively address the weakness." },
      { criterion: "Relevance to engineering role", weight: 20, description: "Relates traits to teamwork, debugging, or technical ownership." },
      { criterion: "Clarity and composure", weight: 10, description: "Well-organized response." }
    ],
    expectedKeyPoints: ["specific genuine strength", "example supporting strength", "real weakness", "actionable steps taken to improve", "measured progress"],
    modelAnswer: "Strength: Highlight disciplined problem decomposition—breaking ambiguous bugs into reproducible micro-components through logging and unit tests.\nWeakness: Share a genuine development area, such as initial hesitation to delegate tasks in team projects or over-engineering solutions beyond requirements. Crucially, explain how you actively tackle it: 'I now practice timeboxing architectural spikes and checking in with peers early with wireframes or API specs before writing code.'"
  },
  {
    id: "HR-BEHAV-03",
    category: "hr",
    topic: "HR & Behavioral",
    subtopic: "Conflict Resolution & Teamwork",
    difficulty: "medium",
    questionType: "long_answer",
    questionText: "Describe a situation where you had a strong disagreement with a teammate or peer regarding a technical design decision. How did you resolve the conflict, and what was the outcome?",
    maxMarks: 10,
    timeAllocationSeconds: 240,
    rubric: [
      { criterion: "STAR structure (Situation, Task, Action, Result)", weight: 35, description: "Clear narrative flow establishing context, the disagreement, and resolution." },
      { criterion: "Objectivity, empathy, and data-driven resolution", weight: 35, description: "Focuses on benchmarks, prototypes, or user needs rather than personal ego." },
      { criterion: "Positive business or project outcome", weight: 20, description: "Demonstrates collaborative delivery without lingering animosity." },
      { criterion: "Professional maturity", weight: 10, description: "Shows respect for differing perspectives." }
    ],
    expectedKeyPoints: ["STAR method", "technical disagreement context", "listening to alternative perspective", "data or benchmark comparison", "consensus decision", "successful delivery"],
    modelAnswer: "Use the STAR method:\n- Situation: During a capstone project, my teammate favored MongoDB while I advocated PostgreSQL for our financial tracking feature.\n- Task: We needed to decide on a schema architecture that met ACID guarantees without slowing sprint velocity.\n- Action: Instead of debating opinions, we scheduled a 30-minute spike. We benchmarked transaction rollbacks and schema constraints against our required schema. We realized our relational transaction logic made PostgreSQL substantially safer against data corruption.\n- Result: My teammate agreed after reviewing the benchmark. We shipped on schedule with zero transactional discrepancies."
  }
];

export const COMPANY_RECRUITMENT_PATTERNS = {
  tcs: {
    name: "Tata Consultancy Services (TCS)",
    roles: ["Ninja Software Engineer", "Digital Specialist Engineer", "Innovator"],
    rounds: [
      { name: "TCS NQT Cognitive Round", durationMinutes: 60, focus: "Numerical Ability, Verbal Ability, Reasoning Ability" },
      { name: "TCS Advanced Technical & Coding", durationMinutes: 45, focus: "Hands-on Programming, DSA, Complexity Analysis" },
      { name: "Technical & Managerial Interview", durationMinutes: 30, focus: "OOP Concepts, SQL, Project Architecture, System Design" },
      { name: "HR Interview", durationMinutes: 15, focus: "Communication, Adaptability, Relocation Willingness, Company Knowledge" }
    ],
    syllabus: ["Time and Work", "Permutations & Combinations", "Coding in Java/C++/Python", "OOP & DBMS", "Data Interpretation"],
    difficulty: "medium"
  },
  infosys: {
    name: "Infosys",
    roles: ["Systems Engineer", "Specialist Programmer", "Digital Specialist Engineer"],
    rounds: [
      { name: "Infosys Online Assessment", durationMinutes: 100, focus: "Reasoning Ability, Mathematical Ability, Verbal, Pseudocode" },
      { name: "Hands-on Coding Round", durationMinutes: 60, focus: "DSA, Arrays, Dynamic Programming, Strings" },
      { name: "Technical + HR Interview", durationMinutes: 35, focus: "Core CS Fundamentals, DBMS, Academic Projects, Behavioral" }
    ],
    syllabus: ["Pseudocode Tracing", "Data Structures", "Combinatorics", "Database Normalization", "System Concepts"],
    difficulty: "medium"
  },
  accenture: {
    name: "Accenture",
    roles: ["Associate Software Engineer (ASE)", "Advanced Associate Software Engineer (AASE)"],
    rounds: [
      { name: "Cognitive & Technical Assessment", durationMinutes: 90, focus: "Analytical Reasoning, Numerical Ability, Pseudocode, Common Applications & MS Office, Cloud/Security Fundamentals" },
      { name: "Automata Coding Assessment", durationMinutes: 45, focus: "2 Programming Questions (Strings/Arrays/Hashing)" },
      { name: "Communication Assessment", durationMinutes: 20, focus: "Sentence Mastery, Pronunciation, Fluency, Listening Comprehension" },
      { name: "Technical & HR Interview", durationMinutes: 25, focus: "Project Contribution, Agile Practices, Problem Solving" }
    ],
    syllabus: ["Critical Reasoning", "Pseudocode Debugging", "Cloud Fundamentals", "Array Manipulations", "STAR Behavioral"],
    difficulty: "medium"
  },
  capgemini: {
    name: "Capgemini",
    roles: ["Analyst", "Senior Analyst"],
    rounds: [
      { name: "Game-based Aptitude Assessment", durationMinutes: 30, focus: "Grid Challenge, Motion Challenge, Deductive Reasoning" },
      { name: "Pseudocode & Technical MCQ", durationMinutes: 30, focus: "C/C++/Java Pseudocode, Data Structures, Algorithms" },
      { name: "English Communication Test", durationMinutes: 30, focus: "Vocabulary, Grammar, Sentence Completion" },
      { name: "Technical & HR Interview", durationMinutes: 30, focus: "Database Queries, Final Year Project, Core CS" }
    ],
    syllabus: ["Game Aptitude", "Pseudocode Analysis", "SQL Joins", "OOP Principles"],
    difficulty: "medium"
  },
  wipro: {
    name: "Wipro",
    roles: ["Project Engineer (Elite NLTH)", "Turbo Specialist"],
    rounds: [
      { name: "Aptitude Assessment", durationMinutes: 48, focus: "Quantitative, Logical, Verbal Ability" },
      { name: "Written Communication Test", durationMinutes: 20, focus: "Formal Essay Writing on Technology & Society" },
      { name: "Online Programming Test", durationMinutes: 60, focus: "2 Coding Questions (Basic to Intermediate Data Structures)" },
      { name: "Combined Technical & HR Interview", durationMinutes: 30, focus: "C++/Java, DBMS, Project Walkthrough, Willingness to Learn" }
    ],
    syllabus: ["Percentages & Work", "Essay Writing", "String Algorithms", "SQL Aggregations"],
    difficulty: "medium"
  },
  cognizant: {
    name: "Cognizant",
    roles: ["GenC", "GenC Next", "GenC Elevate"],
    rounds: [
      { name: "Skill-based Aptitude & Coding", durationMinutes: 80, focus: "Numerical, Verbal, Automata Coding" },
      { name: "Advanced Domain Assessment", durationMinutes: 60, focus: "Web Technologies, Databases, Cloud & Architecture" },
      { name: "Technical + HR Discussion", durationMinutes: 35, focus: "Project Deep-Dive, Live Coding, Behavioral Scenarios" }
    ],
    syllabus: ["Data Structures", "Analytical Problem Solving", "Full-Stack Concepts", "Database Queries"],
    difficulty: "hard"
  },
  product: {
    name: "Tier-1 Product Companies (Amazon, Microsoft, Google)",
    roles: ["Software Development Engineer I (SDE-1)"],
    rounds: [
      { name: "Online Coding Assessment", durationMinutes: 90, focus: "2-3 Hard DSA Problems (Graphs, DP, Heaps, Sliding Window)" },
      { name: "Technical Round 1: DSA & Problem Solving", durationMinutes: 60, focus: "Live coding on Google Docs / CoderPad with time & space proofs" },
      { name: "Technical Round 2: Object-Oriented & Low-Level Design", durationMinutes: 60, focus: "Design Parking Lot, Rate Limiter, Cache with SOLID principles" },
      { name: "Hiring Manager & Leadership Principles Round", durationMinutes: 60, focus: "STAR Behavioral, Customer Obsession, Ownership, Handling Ambiguity" }
    ],
    syllabus: ["Graph Algorithms (BFS/DFS/Dijkstra)", "Dynamic Programming", "Concurrency & Low-Level Design", "Distributed Systems Basics"],
    difficulty: "hard"
  }
};
