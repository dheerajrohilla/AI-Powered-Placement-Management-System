import mongoose from 'mongoose';

const workspaceCodeSessionSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'Placement Coding Lab'
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp'],
    default: 'javascript'
  },
  code: {
    type: String,
    default: `// Collaborative Placement Code Session
// Share ideas, test algorithms, and practice problem solving

function solve(arr, target) {
  const map = new Map();
  for (let i = 0; i < arr.length; i++) {
    const diff = target - arr[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(arr[i], i);
  }
  return [];
}

console.log("Two Sum Indices:", solve([2, 7, 11, 15], 9));
`
  },
  problemDescription: {
    type: String,
    default: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'
  },
  testCases: [{
    input: { type: String, default: '[2, 7, 11, 15], 9' },
    expectedOutput: { type: String, default: '[0, 1]' }
  }],
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  lastEditedByName: {
    type: String,
    default: 'Collaborator'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('WorkspaceCodeSession', workspaceCodeSessionSchema);
