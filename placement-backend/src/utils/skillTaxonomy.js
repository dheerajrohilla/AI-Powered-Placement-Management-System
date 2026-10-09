/**
 * Comprehensive technical skills taxonomy for campus placement evaluation
 */
export const SKILL_CATEGORIES = {
  languages: {
    label: 'Programming Languages',
    skills: [
      { name: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'es2020'] },
      { name: 'TypeScript', aliases: ['typescript', 'ts'] },
      { name: 'Python', aliases: ['python', 'py'] },
      { name: 'Java', aliases: ['java', 'core java', 'j2ee'], boundary: true },
      { name: 'C++', aliases: ['c\\+\\+', 'cpp'] },
      { name: 'C', regex: /\bC\b(?!\+\+|#)/i },
      { name: 'C#', aliases: ['c#', 'csharp'] },
      { name: 'Go', regex: /\b(golang|go\s+language)\b/i },
      { name: 'Rust', aliases: ['rust'] },
      { name: 'PHP', aliases: ['php'] },
      { name: 'Ruby', aliases: ['ruby'] },
      { name: 'Kotlin', aliases: ['kotlin'] },
      { name: 'Swift', aliases: ['swift'] },
      { name: 'SQL', aliases: ['sql', 't-sql', 'pl/sql', 'plsql'] },
      { name: 'HTML/CSS', aliases: ['html', 'html5', 'css', 'css3'] },
      { name: 'R', regex: /\b(r\s+programming|r\s+language)\b/i },
      { name: 'Dart', aliases: ['dart'] },
      { name: 'Scala', aliases: ['scala'] }
    ]
  },
  frontend: {
    label: 'Frontend Development',
    skills: [
      { name: 'React', aliases: ['react', 'react.js', 'reactjs'] },
      { name: 'Next.js', aliases: ['next.js', 'nextjs', 'next'] },
      { name: 'Vue.js', aliases: ['vue', 'vue.js', 'vuejs'] },
      { name: 'Angular', aliases: ['angular', 'angularjs'] },
      { name: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss', 'tailwind css'] },
      { name: 'Redux', aliases: ['redux', 'redux toolkit', 'rtk'] },
      { name: 'Bootstrap', aliases: ['bootstrap', 'bootstrap5'] },
      { name: 'Sass/SCSS', aliases: ['sass', 'scss'] },
      { name: 'Vite', aliases: ['vite', 'vitejs'] },
      { name: 'Webpack', aliases: ['webpack'] },
      { name: 'Responsive Design', aliases: ['responsive design', 'mobile-first', 'flexbox', 'css grid'] }
    ]
  },
  backend: {
    label: 'Backend & APIs',
    skills: [
      { name: 'Node.js', aliases: ['node', 'node.js', 'nodejs'] },
      { name: 'Express.js', aliases: ['express', 'express.js', 'expressjs'] },
      { name: 'Spring Boot', aliases: ['spring boot', 'springboot', 'spring framework', 'spring'] },
      { name: 'Django', aliases: ['django', 'django rest framework', 'drf'] },
      { name: 'FastAPI', aliases: ['fastapi', 'fast api'] },
      { name: 'Flask', aliases: ['flask'] },
      { name: 'RESTful APIs', aliases: ['rest', 'rest api', 'restful api', 'rest apis', 'restful'] },
      { name: 'GraphQL', aliases: ['graphql'] },
      { name: 'Microservices', aliases: ['microservices', 'microservice architecture'] },
      { name: 'WebSockets', aliases: ['websocket', 'websockets', 'socket.io'] },
      { name: 'NestJS', aliases: ['nestjs', 'nest.js'] },
      { name: 'ASP.NET', aliases: ['asp.net', '.net core', 'dotnet'] }
    ]
  },
  databases: {
    label: 'Databases & Storage',
    skills: [
      { name: 'MongoDB', aliases: ['mongodb', 'mongo', 'mongoose', 'nosql'] },
      { name: 'PostgreSQL', aliases: ['postgresql', 'postgres', 'psql'] },
      { name: 'MySQL', aliases: ['mysql'] },
      { name: 'Redis', aliases: ['redis'] },
      { name: 'Firebase', aliases: ['firebase', 'firestore'] },
      { name: 'SQLite', aliases: ['sqlite', 'sqlite3'] },
      { name: 'Oracle DB', aliases: ['oracle database', 'oracle db'] },
      { name: 'Cassandra', aliases: ['cassandra', 'apache cassandra'] },
      { name: 'DynamoDB', aliases: ['dynamodb', 'aws dynamodb'] },
      { name: 'Prisma ORM', aliases: ['prisma', 'prisma orm'] }
    ]
  },
  cloudDevops: {
    label: 'Cloud & DevOps',
    skills: [
      { name: 'Docker', aliases: ['docker', 'containerization', 'docker compose'] },
      { name: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
      { name: 'AWS', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
      { name: 'Google Cloud (GCP)', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
      { name: 'Microsoft Azure', aliases: ['azure', 'microsoft azure'] },
      { name: 'CI/CD Pipelines', aliases: ['ci/cd', 'github actions', 'gitlab ci', 'jenkins', 'circleci'] },
      { name: 'Linux', aliases: ['linux', 'ubuntu', 'bash', 'shell scripting'] },
      { name: 'Nginx', aliases: ['nginx'] },
      { name: 'Terraform', aliases: ['terraform'] }
    ]
  },
  aiMlData: {
    label: 'AI, ML & Data Science',
    skills: [
      { name: 'Machine Learning', aliases: ['machine learning', 'ml', 'scikit-learn', 'sklearn'] },
      { name: 'Deep Learning', aliases: ['deep learning', 'neural networks', 'ann', 'cnn', 'rnn', 'lstm'] },
      { name: 'TensorFlow', aliases: ['tensorflow', 'tf'] },
      { name: 'PyTorch', aliases: ['pytorch'] },
      { name: 'Pandas', aliases: ['pandas'] },
      { name: 'NumPy', aliases: ['numpy'] },
      { name: 'Natural Language Processing (NLP)', aliases: ['nlp', 'natural language processing', 'spacy', 'nltk', 'transformers', 'bert', 'huggingface'] },
      { name: 'Computer Vision', aliases: ['computer vision', 'opencv', 'image processing'] },
      { name: 'Generative AI & LLMs', aliases: ['generative ai', 'genai', 'llm', 'llms', 'langchain', 'openai', 'gemini', 'rag'] },
      { name: 'Data Analysis & BI', aliases: ['data analysis', 'power bi', 'tableau', 'matplotlib', 'seaborn'] }
    ]
  },
  coreCs: {
    label: 'Core Computer Science',
    skills: [
      { name: 'Data Structures & Algorithms', aliases: ['dsa', 'data structures', 'algorithms', 'problem solving', 'competitive programming'] },
      { name: 'Object-Oriented Programming (OOP)', aliases: ['oop', 'oops', 'object oriented programming'] },
      { name: 'System Design', aliases: ['system design', 'distributed systems', 'scalability', 'high level design', 'low level design', 'hld', 'lld'] },
      { name: 'Database Management Systems (DBMS)', aliases: ['dbms', 'database management', 'database systems'] },
      { name: 'Operating Systems', aliases: ['operating systems', 'os concepts', 'concurrency', 'multithreading'] },
      { name: 'Computer Networks', aliases: ['computer networks', 'networking', 'tcp/ip', 'http', 'https', 'dns'] }
    ]
  },
  tools: {
    label: 'Tools & Practices',
    skills: [
      { name: 'Git & GitHub', aliases: ['git', 'github', 'version control', 'gitlab'] },
      { name: 'Postman', aliases: ['postman', 'api testing'] },
      { name: 'VS Code', aliases: ['vs code', 'vscode', 'visual studio code'] },
      { name: 'Unit Testing', aliases: ['unit testing', 'jest', 'mocha', 'junit', 'pytest', 'cypress'] },
      { name: 'Agile & Scrum', aliases: ['agile', 'scrum', 'jira', 'sprints'] },
      { name: 'Figma', aliases: ['figma', 'ui/ux design'] }
    ]
  }
};

/**
 * Standard career roles and their key required skills
 */
export const ROLE_PROFILES = [
  {
    role: 'Full Stack Developer',
    description: 'Builds end-to-end web applications across client and server.',
    coreSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'RESTful APIs', 'Git & GitHub', 'Data Structures & Algorithms'],
    weightings: { 'React': 15, 'Node.js': 15, 'JavaScript': 10, 'MongoDB': 10, 'RESTful APIs': 10, 'Git & GitHub': 10, 'Data Structures & Algorithms': 10, 'Docker': 5, 'TypeScript': 5, 'PostgreSQL': 5, 'HTML/CSS': 5 }
  },
  {
    role: 'Backend Engineer',
    description: 'Designs scalable APIs, database schemas, and microservice architectures.',
    coreSkills: ['Java', 'Python', 'Node.js', 'Spring Boot', 'SQL', 'PostgreSQL', 'MongoDB', 'RESTful APIs', 'System Design', 'Data Structures & Algorithms', 'Docker', 'Redis'],
    weightings: { 'Data Structures & Algorithms': 15, 'System Design': 15, 'RESTful APIs': 12, 'SQL': 10, 'Node.js': 10, 'Java': 10, 'Spring Boot': 8, 'PostgreSQL': 8, 'Docker': 7, 'Redis': 5 }
  },
  {
    role: 'Frontend Engineer',
    description: 'Crafts responsive, interactive user experiences and modern SPAs.',
    coreSkills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML/CSS', 'Tailwind CSS', 'Redux', 'Responsive Design', 'Git & GitHub', 'RESTful APIs'],
    weightings: { 'React': 20, 'JavaScript': 15, 'HTML/CSS': 15, 'TypeScript': 10, 'Tailwind CSS': 10, 'Redux': 10, 'Next.js': 8, 'Responsive Design': 7, 'Git & GitHub': 5 }
  },
  {
    role: 'Data Scientist & AI/ML Engineer',
    description: 'Analyzes data, trains ML models, and builds intelligent predictive systems.',
    coreSkills: ['Python', 'Machine Learning', 'Deep Learning', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'SQL', 'Data Analysis & BI', 'Data Structures & Algorithms'],
    weightings: { 'Python': 20, 'Machine Learning': 15, 'Pandas': 12, 'NumPy': 12, 'Deep Learning': 10, 'TensorFlow': 8, 'PyTorch': 8, 'SQL': 8, 'Data Analysis & BI': 7 }
  },
  {
    role: 'Cloud & DevOps Engineer',
    description: 'Automates deployments, manages cloud infrastructure, and monitors reliability.',
    coreSkills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD Pipelines', 'Git & GitHub', 'Python', 'Nginx', 'Terraform', 'System Design'],
    weightings: { 'Docker': 18, 'Linux': 15, 'AWS': 15, 'Kubernetes': 12, 'CI/CD Pipelines': 12, 'Git & GitHub': 10, 'Python': 8, 'Terraform': 5, 'Nginx': 5 }
  }
];
