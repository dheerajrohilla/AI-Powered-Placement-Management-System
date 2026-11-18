/**
 * Curated Comprehensive Question Bank for the 6 Core Placement Subjects
 * Subjects: OOPS, DSA, DAA, COA, OS, DBMS
 * Levels: Easy (fundamentals/definitions), Medium (practical/scenarios), Hard (advanced/interview depth)
 */

export const SUBJECT_METADATA = {
  oops: {
    id: 'oops',
    name: 'Object-Oriented Programming (OOPS)',
    code: 'OOPS',
    description: 'Core OOP paradigms, classes, inheritance, polymorphism, encapsulation, abstraction, and design patterns.'
  },
  dsa: {
    id: 'dsa',
    name: 'Data Structures & Algorithms (DSA)',
    code: 'DSA',
    description: 'Arrays, linked lists, stacks, queues, trees, graphs, hashing, sorting algorithms, and recursion.'
  },
  daa: {
    id: 'daa',
    name: 'Design & Analysis of Algorithms (DAA)',
    code: 'DAA',
    description: 'Asymptotic complexity, Master Theorem, divide-and-conquer, greedy techniques, dynamic programming, and NP-completeness.'
  },
  coa: {
    id: 'coa',
    name: 'Computer Organization & Architecture (COA)',
    code: 'COA',
    description: 'CPU architecture, instruction formats, pipelining hazards, cache hierarchies, memory mapping, and bus systems.'
  },
  os: {
    id: 'os',
    name: 'Operating Systems (OS)',
    code: 'OS',
    description: 'Process scheduling, concurrency, semaphores, deadlocks, virtual memory management, and file system architecture.'
  },
  dbms: {
    id: 'dbms',
    name: 'Database Management Systems (DBMS)',
    code: 'DBMS',
    description: 'Relational data models, SQL queries, normalization (1NF-BCNF), ACID properties, indexing, and transaction serializability.'
  },
  cn: {
    id: 'cn',
    name: 'Computer Networks (CN)',
    code: 'CN',
    description: 'OSI & TCP/IP protocol suites, IP addressing & subnetting, routing algorithms, transport layer flow & congestion control, and network security.'
  }
};

export const STATIC_QUESTION_BANK = [
  // ==========================================
  // OOPS - OBJECT-ORIENTED PROGRAMMING
  // ==========================================
  // --- OOPS EASY ---
  {
    subject: 'oops',
    difficulty: 'easy',
    topic: 'Encapsulation',
    questionText: 'Which OOP feature wraps data members and methods together into a single cohesive unit?',
    options: ['Polymorphism', 'Encapsulation', 'Abstraction', 'Inheritance'],
    correctOption: 1,
    explanation: 'Encapsulation is the mechanism of binding code and the data it manipulates into a single unit (such as a class) and protecting it from outside misuse.'
  },
  {
    subject: 'oops',
    difficulty: 'easy',
    topic: 'Class & Object',
    questionText: 'What is an instance of a class known as in Object-Oriented Programming?',
    options: ['Interface', 'Function', 'Object', 'Variable'],
    correctOption: 2,
    explanation: 'An object is a concrete, runtime instance of a class that encapsulates state and behavior.'
  },
  {
    subject: 'oops',
    difficulty: 'easy',
    topic: 'Inheritance',
    questionText: 'Which concept allows a child class to inherit properties and methods from a parent class?',
    options: ['Abstraction', 'Aggregation', 'Inheritance', 'Overloading'],
    correctOption: 2,
    explanation: 'Inheritance facilitates code reusability by enabling a derived or child class to acquire attributes and behaviors from a base or parent class.'
  },
  {
    subject: 'oops',
    difficulty: 'easy',
    topic: 'Access Specifiers',
    questionText: 'Which access specifier restricts variable visibility strictly within the declaring class itself?',
    options: ['public', 'protected', 'private', 'package-private'],
    correctOption: 2,
    explanation: 'The private access specifier ensures that the member is inaccessible from outside the defining class, enforcing strict data hiding.'
  },
  {
    subject: 'oops',
    difficulty: 'easy',
    topic: 'Constructors',
    questionText: 'What is the primary purpose of a constructor in object-oriented languages?',
    options: ['To destroy an object', 'To allocate memory and initialize an object', 'To override methods', 'To make a class static'],
    correctOption: 1,
    explanation: 'A constructor is a special method automatically invoked when an object is instantiated to allocate memory and initialize the object state.'
  },
  {
    subject: 'oops',
    difficulty: 'easy',
    topic: 'Polymorphism',
    questionText: 'Having multiple methods with the exact same name but different parameter lists in the same class is an example of:',
    options: ['Method Overriding', 'Method Overloading', 'Dynamic Dispatch', 'Multiple Inheritance'],
    correctOption: 1,
    explanation: 'Method overloading (compile-time polymorphism) occurs when methods in the same class share a name but differ in parameter count, type, or order.'
  },
  {
    subject: 'oops',
    difficulty: 'easy',
    topic: 'Abstraction',
    questionText: 'Displaying only essential features of an object while hiding implementation background details is termed:',
    options: ['Abstraction', 'Polymorphism', 'Overloading', 'Coupling'],
    correctOption: 0,
    explanation: 'Abstraction is the concept of representing essential features without including the background details or explanation.'
  },
  {
    subject: 'oops',
    difficulty: 'easy',
    topic: 'Destructors',
    questionText: 'In languages like C++, which symbol is used before the class name to declare a destructor?',
    options: ['#', '&', '~', '*'],
    correctOption: 2,
    explanation: 'In C++, destructors are preceded by the tilde symbol (~) and take no arguments, handling resource cleanup before deallocation.'
  },

  // --- OOPS MEDIUM ---
  {
    subject: 'oops',
    difficulty: 'medium',
    topic: 'Virtual Functions',
    questionText: 'What is the primary role of a virtual function in C++ or an overridable method in Java?',
    options: [
      'To increase execution speed at compile time',
      'To achieve runtime (dynamic) polymorphism via late binding',
      'To make a class pure abstract',
      'To restrict inheritance by subclasses'
    ],
    correctOption: 1,
    explanation: 'Virtual functions enable runtime polymorphism through dynamic dispatch (using a vtable), ensuring the derived class implementation is executed based on the actual object type at runtime.'
  },
  {
    subject: 'oops',
    difficulty: 'medium',
    topic: 'Abstract Classes',
    questionText: 'Which statement accurately distinguishes an Abstract Class from an Interface in Java?',
    options: [
      'An abstract class cannot have any concrete methods',
      'A class can implement only one interface but extend multiple abstract classes',
      'An abstract class can maintain state with instance variables, whereas interfaces cannot hold instance state',
      'Interfaces can declare private constructors'
    ],
    correctOption: 2,
    explanation: 'Abstract classes can declare instance state (fields) and constructors, whereas interfaces cannot store non-static instance state.'
  },
  {
    subject: 'oops',
    difficulty: 'medium',
    topic: 'Copy Semantics',
    questionText: 'What differentiates a Deep Copy from a Shallow Copy of an object containing pointers or reference fields?',
    options: [
      'Shallow copy clones dynamically allocated memory, deep copy only copies references',
      'Deep copy creates independent copies of both the object and the dynamically allocated data it references',
      'Deep copy is always executed automatically by default copy constructors',
      'Shallow copy changes immutable constants'
    ],
    correctOption: 1,
    explanation: 'A deep copy recursively allocates new memory and duplicates the underlying data, ensuring changes to one object do not mutate the other.'
  },
  {
    subject: 'oops',
    difficulty: 'medium',
    topic: 'Diamond Problem',
    questionText: 'In object-oriented programming, how does C++ resolve the classic "Diamond Problem" of multiple inheritance?',
    options: [
      'By using final classes',
      'By using virtual base classes (virtual inheritance)',
      'By renaming duplicate methods',
      'By disallowing inheritance entirely'
    ],
    correctOption: 1,
    explanation: 'Virtual inheritance in C++ ensures that only a single instance of the shared base class subobject is included in the most derived class, resolving ambiguity.'
  },
  {
    subject: 'oops',
    difficulty: 'medium',
    topic: 'Static Members',
    questionText: 'If a member variable is declared static in a class, how is it shared among instances?',
    options: [
      'Each instance creates its own isolated copy of the variable',
      'It is shared universally across all instances of the class and exists independent of object instantiation',
      'It cannot be accessed without instantiating at least two objects',
      'It can only be read inside constructors'
    ],
    correctOption: 1,
    explanation: 'Static variables belong to the class rather than individual instances and are shared by all objects created from that class.'
  },
  {
    subject: 'oops',
    difficulty: 'medium',
    topic: 'SOLID Principles',
    questionText: 'The Liskov Substitution Principle (LSP) in SOLID design states that:',
    options: [
      'Subclasses should never override base methods',
      'Objects of a superclass should be replaceable with objects of a subclass without affecting application correctness',
      'A class should have only one reason to change',
      'Interfaces must contain at least five abstract methods'
    ],
    correctOption: 1,
    explanation: 'LSP requires that derived classes must remain completely substitutable for their base classes without breaking program invariants or behavior.'
  },
  {
    subject: 'oops',
    difficulty: 'medium',
    topic: 'Method Overriding',
    questionText: 'Which condition is mandatory for successful method overriding in derived classes?',
    options: [
      'Method name and parameter types must match the base class signature',
      'Return type must be void',
      'Access modifier in child must be more restrictive than in parent',
      'The base class method must be static'
    ],
    correctOption: 0,
    explanation: 'Overriding requires identical method signatures (same name, parameter types, and compatible return types) between parent and child classes.'
  },
  {
    subject: 'oops',
    difficulty: 'medium',
    topic: 'Design Patterns',
    questionText: 'Which creational design pattern guarantees a class has only one single instance globally accessible?',
    options: ['Factory Pattern', 'Singleton Pattern', 'Observer Pattern', 'Adapter Pattern'],
    correctOption: 1,
    explanation: 'The Singleton Pattern restricts class instantiation to a single global object with a private constructor and static access method.'
  },

  // --- OOPS HARD ---
  {
    subject: 'oops',
    difficulty: 'hard',
    topic: 'vptr and vtable',
    questionText: 'When a polymorphic class with virtual functions is instantiated in C++, how is dynamic dispatch internally handled?',
    options: [
      'The compiler embeds the complete function code inside each object instance',
      'Each object receives a virtual pointer (vptr) pointing to a class-level virtual table (vtable) containing function pointers',
      'The OS kernel dispatches calls through a hardware interrupt table',
      'Virtual calls are converted into linear switch-case statements at runtime'
    ],
    correctOption: 1,
    explanation: 'Compilers insert a hidden pointer (_vptr) into each object pointing to the class virtual method table (vtable). At runtime, indirect calls dereference the vptr to invoke the overridden method.'
  },
  {
    subject: 'oops',
    difficulty: 'hard',
    topic: 'Object Slicing',
    questionText: 'What is "Object Slicing" in C++ and under what circumstances does it occur?',
    options: [
      'When an array of objects is partitioned during parallel execution',
      'When a derived class object is assigned by value to a base class object, stripping away derived-specific attributes and behaviors',
      'When memory allocation fails during dynamic instantiation',
      'When an abstract class inherits another abstract class'
    ],
    correctOption: 1,
    explanation: 'Object slicing occurs when a derived class instance is passed by value to a base class variable or parameter; the derived portion is sliced off, leaving only base members.'
  },
  {
    subject: 'oops',
    difficulty: 'hard',
    topic: 'Virtual Destructors',
    questionText: 'Why should a base class intended for polymorphic deletion always declare its destructor as virtual?',
    options: [
      'To prevent memory leaks by ensuring the derived class destructor executes first when deleting via a base pointer',
      'Because C++ does not allow non-virtual destructors in any class',
      'To make derived classes instantiate faster',
      'To force derived classes to provide their own custom destructors'
    ],
    correctOption: 0,
    explanation: 'Deleting a derived object through a pointer to a base class without a virtual destructor results in undefined behavior and resource leaks, as derived cleanup code is skipped.'
  },
  {
    subject: 'oops',
    difficulty: 'hard',
    topic: 'Dependency Inversion',
    questionText: 'According to the Dependency Inversion Principle (DIP), high-level modules should:',
    options: [
      'Directly instantiate concrete low-level utility classes',
      'Depend on abstractions (interfaces) rather than concrete implementations',
      'Inherit all methods from a single global class',
      'Avoid using polymorphism'
    ],
    correctOption: 1,
    explanation: 'DIP dictates that high-level business logic should not depend on low-level detail modules; both must depend on abstractions.'
  },

  // ==========================================
  // DSA - DATA STRUCTURES & ALGORITHMS
  // ==========================================
  // --- DSA EASY ---
  {
    subject: 'dsa',
    difficulty: 'easy',
    topic: 'Arrays',
    questionText: 'What is the time complexity to access an element at a given index in a contiguous array?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctOption: 0,
    explanation: 'Arrays store elements in contiguous memory locations, allowing direct memory address calculation via index offset in O(1) constant time.'
  },
  {
    subject: 'dsa',
    difficulty: 'easy',
    topic: 'Stack',
    questionText: 'Which abstract data structure operates on a Last-In, First-Out (LIFO) order?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
    correctOption: 1,
    explanation: 'A Stack follows the Last-In, First-Out (LIFO) protocol where the most recently inserted item is the first one removed.'
  },
  {
    subject: 'dsa',
    difficulty: 'easy',
    topic: 'Queue',
    questionText: 'Which abstract data structure operates on a First-In, First-Out (FIFO) principle?',
    options: ['Stack', 'Priority Queue', 'Queue', 'Heap'],
    correctOption: 2,
    explanation: 'A regular Queue strictly adheres to the FIFO (First-In, First-Out) discipline, serving elements in the exact order of their arrival.'
  },
  {
    subject: 'dsa',
    difficulty: 'easy',
    topic: 'Linked List',
    questionText: 'What is the worst-case time complexity to search for a value in an unsorted Singly Linked List of n nodes?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correctOption: 2,
    explanation: 'Linked lists lack random access; finding an element requires sequential node-by-node traversal, taking O(n) in the worst case.'
  },
  {
    subject: 'dsa',
    difficulty: 'easy',
    topic: 'Binary Trees',
    questionText: 'What is the maximum number of nodes possible at level "i" of a binary tree (root at level 0)?',
    options: ['2^i', '2^(i+1)', '2i', 'i^2'],
    correctOption: 0,
    explanation: 'Since each node in a binary tree can have at most two children, the maximum number of nodes at depth level i is 2^i.'
  },
  {
    subject: 'dsa',
    difficulty: 'easy',
    topic: 'Sorting',
    questionText: 'Which of the following sorting algorithms has a best-case time complexity of O(n) on an already sorted array?',
    options: ['Merge Sort', 'Bubble Sort with swap flag', 'Selection Sort', 'Heap Sort'],
    correctOption: 1,
    explanation: 'Bubble Sort with an early-exit swapped flag verifies an already sorted array in a single pass of n-1 comparisons, achieving O(n) best case.'
  },
  {
    subject: 'dsa',
    difficulty: 'easy',
    topic: 'Hashing',
    questionText: 'In an ideal hash table with an optimal hash function and low load factor, average search complexity is:',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correctOption: 0,
    explanation: 'With a uniform hash distribution and negligible collision rate, hash table lookups execute in O(1) expected time.'
  },
  {
    subject: 'dsa',
    difficulty: 'easy',
    topic: 'Binary Search',
    questionText: 'Binary Search can be applied only when the input array is:',
    options: ['Unsorted', 'Sorted', 'Doubly Linked', 'Circular'],
    correctOption: 1,
    explanation: 'Binary Search relies on the sorted ordering of elements to eliminate half of the search space in each comparison.'
  },

  // --- DSA MEDIUM ---
  {
    subject: 'dsa',
    difficulty: 'medium',
    topic: 'Linked List Cycle',
    questionText: 'Floyd’s Cycle-Finding Algorithm (Tortoise and Hare) detects a cycle in a linked list using:',
    options: [
      'Two pointers moving at speeds of 1 step and 2 steps per iteration with O(1) space',
      'A hash map storing every visited memory address with O(n) space',
      'Modifying pointer values to null during traversal',
      'Reversing the linked list twice'
    ],
    correctOption: 0,
    explanation: 'Floyd\'s cycle detection algorithm employs a slow pointer (1 step) and fast pointer (2 steps). If a cycle exists, they must collide within the loop in O(n) time and O(1) auxiliary space.'
  },
  {
    subject: 'dsa',
    difficulty: 'medium',
    topic: 'Binary Search Tree',
    questionText: 'What is the time complexity of searching an element in a skewed Binary Search Tree (BST) of n elements?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctOption: 2,
    explanation: 'In the worst case (e.g., elements inserted in ascending or descending order), a BST degenerates into a linear linked list where searching requires O(n) comparisons.'
  },
  {
    subject: 'dsa',
    difficulty: 'medium',
    topic: 'Heap',
    questionText: 'What is the time complexity to extract the minimum element and re-heapify a Min-Heap of n elements?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctOption: 1,
    explanation: 'Extracting the min takes O(1) to read the root, but restoring the heap property (heapify down) requires shifting down the tree height, taking O(log n).'
  },
  {
    subject: 'dsa',
    difficulty: 'medium',
    topic: 'Graph Traversals',
    questionText: 'Which graph traversal algorithm uses a FIFO Queue and is guaranteed to find the shortest path in an unweighted graph?',
    options: ['Depth First Search (DFS)', 'Breadth First Search (BFS)', 'Dijkstra’s Algorithm', 'Topological Sort'],
    correctOption: 1,
    explanation: 'BFS traverses level by level using a queue, guaranteeing that the first time a vertex is visited from the source, the path has minimal edge count in an unweighted graph.'
  },
  {
    subject: 'dsa',
    difficulty: 'medium',
    topic: 'Stacks & Queues',
    questionText: 'How many stacks are required to implement a FIFO Queue with amortized O(1) operations?',
    options: ['1', '2', '3', '4'],
    correctOption: 1,
    explanation: 'Two stacks (inStack and outStack) are required: elements are pushed to inStack and popped from outStack (transferring elements only when outStack is empty), yielding amortized O(1) enqueue and dequeue.'
  },
  {
    subject: 'dsa',
    difficulty: 'medium',
    topic: 'Tree Traversals',
    questionText: 'In which tree traversal order of a Binary Search Tree are node values visited in strictly ascending order?',
    options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
    correctOption: 1,
    explanation: 'Inorder traversal visits Left Subtree -> Root -> Right Subtree, which yields elements in sorted ascending order for any valid BST.'
  },
  {
    subject: 'dsa',
    difficulty: 'medium',
    topic: 'AVL Trees',
    questionText: 'In an AVL Tree, what is the valid balance factor range permitted for every node?',
    options: ['Only 0', '-1, 0, or +1', '-2 to +2', 'Any positive integer'],
    correctOption: 1,
    explanation: 'An AVL tree is a self-balancing BST where the height difference between left and right subtrees (balance factor) must be strictly within {-1, 0, +1}.'
  },
  {
    subject: 'dsa',
    difficulty: 'medium',
    topic: 'Quick Sort',
    questionText: 'What is the worst-case time complexity of Quick Sort, and when does it typically occur?',
    options: [
      'O(n log n) when the array is randomly shuffled',
      'O(n^2) when the pivot selected is consistently the smallest or largest element',
      'O(n) when all elements are unique',
      'O(log n) when elements are sorted'
    ],
    correctOption: 1,
    explanation: 'Quick Sort degenerates to O(n^2) when poor pivot selection yields partitions of sizes 0 and n-1 at each step, such as picking the first element of an already sorted array.'
  },

  // --- DSA HARD ---
  {
    subject: 'dsa',
    difficulty: 'hard',
    topic: 'LRU Cache',
    questionText: 'Which combination of data structures is optimal to implement an LRU (Least Recently Used) Cache supporting O(1) get() and put()?',
    options: [
      'Doubly Linked List and Hash Map',
      'Singly Linked List and Binary Search Tree',
      'Min-Heap and Array',
      'Stack and Circular Queue'
    ],
    correctOption: 0,
    explanation: 'A Hash Map provides O(1) node lookup by key, while a Doubly Linked List permits O(1) node detachment and head insertion to maintain usage recency order.'
  },
  {
    subject: 'dsa',
    difficulty: 'hard',
    topic: 'Topological Sort',
    questionText: 'Under what exact condition is a Topological Ordering possible for a directed graph G?',
    options: [
      'G must be undirected and connected',
      'G must be a Directed Acyclic Graph (DAG)',
      'G must be a complete graph',
      'G must have equal in-degrees and out-degrees'
    ],
    correctOption: 1,
    explanation: 'Topological sorting linearizes vertices such that for every directed edge u -> v, u precedes v. This is mathematically possible if and only if the graph has no directed cycles (DAG).'
  },
  {
    subject: 'dsa',
    difficulty: 'hard',
    topic: 'Red-Black Tree',
    questionText: 'In a Red-Black Tree with n nodes, what is the guaranteed upper bound on the maximum height of the tree?',
    options: ['log2(n)', '2 * log2(n + 1)', 'n / 2', 'n - 1'],
    correctOption: 1,
    explanation: 'Because no path from the root to a leaf has more than twice as many nodes as any other path, the height of a Red-Black tree is guaranteed to be at most 2 * log2(n + 1).'
  },
  {
    subject: 'dsa',
    difficulty: 'hard',
    topic: 'Trie Data Structure',
    questionText: 'What is the time complexity to search for a word of length "m" in a Trie containing "n" stored words?',
    options: ['O(n)', 'O(m)', 'O(n * m)', 'O(log n)'],
    correctOption: 1,
    explanation: 'Searching in a Trie depends solely on the length of the query string m, navigating m edge transitions in O(m) time independent of the total words n in the dictionary.'
  },

  // ==========================================
  // DAA - DESIGN & ANALYSIS OF ALGORITHMS
  // ==========================================
  // --- DAA EASY ---
  {
    subject: 'daa',
    difficulty: 'easy',
    topic: 'Asymptotic Notations',
    questionText: 'Which asymptotic notation represents the tight asymptotic upper bound of an algorithm\'s growth rate?',
    options: ['Omega (Ω)', 'Big-O (O)', 'Theta (Θ)', 'Little-o (o)'],
    correctOption: 1,
    explanation: 'Big-O notation describes the asymptotic upper bound, guaranteeing the running time will not exceed a constant multiple of g(n) for sufficiently large n.'
  },
  {
    subject: 'daa',
    difficulty: 'easy',
    topic: 'Asymptotic Notations',
    questionText: 'If an algorithm\'s running time is bounded from both above and below by the same function, which notation is used?',
    options: ['Big-O', 'Omega', 'Theta (Θ)', 'Gamma'],
    correctOption: 2,
    explanation: 'Theta (Θ) represents an asymptotically tight bound where f(n) is squeezed between c1*g(n) and c2*g(n).'
  },
  {
    subject: 'daa',
    difficulty: 'easy',
    topic: 'Divide and Conquer',
    questionText: 'What are the three fundamental algorithmic phases of the Divide-and-Conquer paradigm?',
    options: [
      'Sort, Search, Combine',
      'Divide, Conquer, Combine',
      'Allocate, Branch, Prune',
      'Greedy, Dynamic, Backtrack'
    ],
    correctOption: 1,
    explanation: 'Divide and Conquer divides the problem into subproblems, conquers subproblems recursively, and combines subproblem solutions to solve the original instance.'
  },
  {
    subject: 'daa',
    difficulty: 'easy',
    topic: 'Sorting Complexity',
    questionText: 'What is the theoretical lower bound for comparison-based sorting algorithms in the worst case?',
    options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
    correctOption: 1,
    explanation: 'A decision tree for comparison sorting of n elements has n! leaves, requiring a minimum tree depth of log2(n!) = Ω(n log n).'
  },
  {
    subject: 'daa',
    difficulty: 'easy',
    topic: 'Greedy Technique',
    questionText: 'A greedy algorithm makes choices based on:',
    options: [
      'The globally optimal solution derived by exploring all future branches',
      'The locally optimal choice at each step hoping it leads to a global optimum',
      'Evaluating subproblems using a dynamic programming table',
      'Random probability'
    ],
    correctOption: 1,
    explanation: 'Greedy algorithms construct solutions iteratively by choosing the locally optimal candidate at each decision point without backtracking.'
  },
  {
    subject: 'daa',
    difficulty: 'easy',
    topic: 'Linear Search',
    questionText: 'What is the average number of comparisons in a successful Linear Search over an array of n items?',
    options: ['n', '(n + 1) / 2', 'n / 4', 'log2(n)'],
    correctOption: 1,
    explanation: 'Assuming each position is equally likely, the average number of comparisons is (1 + 2 + ... + n) / n = (n + 1) / 2.'
  },
  {
    subject: 'daa',
    difficulty: 'easy',
    topic: 'Space Complexity',
    questionText: 'In-place sorting algorithms are characterized by having auxiliary space complexity of:',
    options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n^2)'],
    correctOption: 0,
    explanation: 'An algorithm is considered in-place if it requires O(1) or minimal O(log n) call-stack auxiliary space beyond the input array.'
  },
  {
    subject: 'daa',
    difficulty: 'easy',
    topic: 'Fibonacci Complexity',
    questionText: 'What is the time complexity of the naive recursive Fibonacci implementation without memoization?',
    options: ['O(n)', 'O(log n)', 'O(2^n)', 'O(n^2)'],
    correctOption: 2,
    explanation: 'Naive recursive Fibonacci branches into two subproblems at each step, creating an exponential recursion tree of roughly O(2^n) or O(1.618^n) calls.'
  },

  // --- DAA MEDIUM ---
  {
    subject: 'daa',
    difficulty: 'medium',
    topic: 'Master Theorem',
    questionText: 'Using the Master Theorem, what is the asymptotic solution to the recurrence T(n) = 2T(n/2) + O(n)?',
    options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
    correctOption: 1,
    explanation: 'Here a=2, b=2, log_b(a) = log_2(2) = 1. Since f(n) = O(n^1), it falls under Case 2 of Master Theorem, giving T(n) = Θ(n log n).'
  },
  {
    subject: 'daa',
    difficulty: 'medium',
    topic: 'Dynamic Programming',
    questionText: 'What two fundamental properties must a problem satisfy to be solvable via Dynamic Programming?',
    options: [
      'Optimal Substructure and Overlapping Subproblems',
      'Greedy Choice Property and Divide and Conquer',
      'Linear Independence and Strict Convexity',
      'Asymptotic Equivalence and Deterministic State'
    ],
    correctOption: 0,
    explanation: 'Dynamic Programming applies when optimal solutions to subproblems compose an optimal global solution (Optimal Substructure) and the same subproblems are solved repeatedly (Overlapping Subproblems).'
  },
  {
    subject: 'daa',
    difficulty: 'medium',
    topic: 'Minimum Spanning Tree',
    questionText: 'Which algorithm finds a Minimum Spanning Tree by maintaining a set of trees (forest) and adding the cheapest edge that does not form a cycle?',
    options: ['Prim’s Algorithm', 'Kruskal’s Algorithm', 'Dijkstra’s Algorithm', 'Floyd-Warshall Algorithm'],
    correctOption: 1,
    explanation: 'Kruskal\'s algorithm sorts all edges by weight and uses a Disjoint Set Union (DSU) to greedily add edges avoiding cycles until a single tree spans all vertices.'
  },
  {
    subject: 'daa',
    difficulty: 'medium',
    topic: 'Knapsack Problem',
    questionText: 'Why can the Fractional Knapsack problem be solved with a greedy strategy while 0/1 Knapsack cannot?',
    options: [
      'Fractional Knapsack has smaller weights',
      'In Fractional Knapsack, items can be subdivided according to value-to-weight ratio, ensuring locally greedy choices yield a global optimum',
      '0/1 Knapsack has no optimal substructure',
      '0/1 Knapsack cannot be solved using computers'
    ],
    correctOption: 1,
    explanation: 'In Fractional Knapsack, sorting by value/weight ratio guarantees the knapsack is filled with the highest density value; in 0/1, discrete integer constraints require exploring combinations via DP.'
  },
  {
    subject: 'daa',
    difficulty: 'medium',
    topic: 'Strassen’s Matrix Multiplication',
    questionText: 'Strassen\'s matrix multiplication reduces the number of recursive scalar multiplications from 8 to:',
    options: ['7', '6', '5', '4'],
    correctOption: 0,
    explanation: 'Strassen\'s algorithm computes matrix multiplication using 7 recursive subproblem multiplications instead of 8, lowering the complexity from O(n^3) to O(n^log2(7)) ≈ O(n^2.807).'
  },
  {
    subject: 'daa',
    difficulty: 'medium',
    topic: 'Longest Common Subsequence',
    questionText: 'What is the time complexity to compute the Longest Common Subsequence (LCS) of two strings of lengths m and n using DP?',
    options: ['O(m + n)', 'O(m * n)', 'O(2^(m+n))', 'O(max(m, n))'],
    correctOption: 1,
    explanation: 'Dynamic programming computes an (m+1) x (n+1) table where each cell is calculated in O(1) time, resulting in O(m * n) total time complexity.'
  },
  {
    subject: 'daa',
    difficulty: 'medium',
    topic: 'Backtracking',
    questionText: 'The N-Queens puzzle is commonly solved using which algorithmic paradigm?',
    options: ['Greedy Approach', 'Backtracking', 'Divide and Conquer', 'Dynamic Programming'],
    correctOption: 1,
    explanation: 'Backtracking builds candidates incrementally and abandons (backtracks) any branch as soon as it violates the non-attacking queen constraints.'
  },
  {
    subject: 'daa',
    difficulty: 'medium',
    topic: 'Dijkstra Complexity',
    questionText: 'What is the time complexity of Dijkstra\'s algorithm implemented with an adjacency list and a Binary Min-Heap for a graph G(V, E)?',
    options: ['O(V^2)', 'O(E log V)', 'O(V * E)', 'O(E^2)'],
    correctOption: 1,
    explanation: 'Each vertex extract-min takes O(log V) and each edge relaxation updates the heap in O(log V), yielding O((V + E) log V) or O(E log V) for connected graphs.'
  },

  // --- DAA HARD ---
  {
    subject: 'daa',
    difficulty: 'hard',
    topic: 'NP-Completeness',
    questionText: 'A computational decision problem X is defined to be NP-Complete if:',
    options: [
      'X cannot be solved by any Turing machine',
      'X is in NP and every problem in NP is polynomial-time reducible to X',
      'X is solvable in O(n log n) time on a deterministic machine',
      'X requires infinite memory to verify'
    ],
    correctOption: 1,
    explanation: 'By Cook-Levin definition, a problem X is NP-Complete if: 1) X is in NP (verifiable in polynomial time), and 2) X is NP-Hard (every problem in NP reduces to X in polynomial time).'
  },
  {
    subject: 'daa',
    difficulty: 'hard',
    topic: 'Matrix Chain Multiplication',
    questionText: 'In Matrix Chain Multiplication for n matrices, what is the time complexity of the standard Dynamic Programming approach?',
    options: ['O(n)', 'O(n^2)', 'O(n^3)', 'O(2^n)'],
    correctOption: 2,
    explanation: 'The DP algorithm fills a table of size n x n, and computing each entry requires evaluating k split points (1 <= k < n), resulting in Θ(n^3) overall complexity.'
  },
  {
    subject: 'daa',
    difficulty: 'hard',
    topic: 'Bellman-Ford Algorithm',
    questionText: 'How does the Bellman-Ford algorithm reliably detect negative weight cycles reachable from the source vertex?',
    options: [
      'By checking if any vertex has negative degree',
      'If after relaxing all edges V-1 times, a further relaxation step still reduces any shortest distance',
      'By checking if the total tree weight is zero',
      'By finding any back-edge in DFS'
    ],
    correctOption: 1,
    explanation: 'In a graph without negative cycles, shortest simple paths have at most V-1 edges. If distances can still decrease on the V-th iteration, a negative cycle must exist.'
  },
  {
    subject: 'daa',
    difficulty: 'hard',
    topic: 'Amortized Analysis',
    questionText: 'In dynamic arrays (like C++ vector or Java ArrayList), what is the amortized cost per append operation when the capacity doubles upon reaching full capacity?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correctOption: 0,
    explanation: 'Although resizing takes O(n), it occurs rarely (after 1, 2, 4, 8... insertions). Dividing total work over n appends yields an aggregate constant O(1) amortized cost per insertion.'
  },

  // ==========================================
  // COA - COMPUTER ORGANIZATION & ARCHITECTURE
  // ==========================================
  // --- COA EASY ---
  {
    subject: 'coa',
    difficulty: 'easy',
    topic: 'CPU Components',
    questionText: 'Which internal CPU register holds the address of the next instruction to be fetched and executed?',
    options: ['Instruction Register (IR)', 'Program Counter (PC)', 'Memory Data Register (MDR)', 'Accumulator (AC)'],
    correctOption: 1,
    explanation: 'The Program Counter (PC) stores the memory address of the next sequential instruction awaiting fetch.'
  },
  {
    subject: 'coa',
    difficulty: 'easy',
    topic: 'Memory Hierarchy',
    questionText: 'Which memory type in the computer hierarchy provides the fastest access speed for CPU operations?',
    options: ['Main Memory (DRAM)', 'Registers', 'L1 Cache', 'Solid State Drive (SSD)'],
    correctOption: 1,
    explanation: 'CPU registers are embedded directly within the processor core data path and offer the fastest access times (sub-nanosecond / single cycle).'
  },
  {
    subject: 'coa',
    difficulty: 'easy',
    topic: 'ALU',
    questionText: 'What is the primary responsibility of the Arithmetic Logic Unit (ALU)?',
    options: [
      'Managing external network requests',
      'Performing fundamental arithmetic operations (+, -) and logical operations (AND, OR, NOT)',
      'Generating clock pulses for synchronization',
      'Translating assembly code to binary'
    ],
    correctOption: 1,
    explanation: 'The ALU executes all arithmetic computations (addition, subtraction) and bitwise boolean evaluations (AND, OR, shifts).'
  },
  {
    subject: 'coa',
    difficulty: 'easy',
    topic: 'Von Neumann Architecture',
    questionText: 'A key characteristic of the classical Von Neumann computer architecture is that:',
    options: [
      'Data and instructions share the same memory space and physical bus',
      'Program code and data are stored in physically separate memories with independent buses',
      'It contains no control unit',
      'It cannot execute arithmetic computations'
    ],
    correctOption: 0,
    explanation: 'Von Neumann architecture uses a unified memory subsystem and shared bus for both instruction code and data operands (leading to the Von Neumann bottleneck).'
  },
  {
    subject: 'coa',
    difficulty: 'easy',
    topic: 'Instruction Register',
    questionText: 'Which register temporarily stores the instruction currently being decoded and executed?',
    options: ['Instruction Register (IR)', 'Program Counter (PC)', 'Stack Pointer (SP)', 'Base Register'],
    correctOption: 0,
    explanation: 'Once an instruction is fetched from memory, it is loaded into the Instruction Register (IR) while the control unit decodes its opcode.'
  },
  {
    subject: 'coa',
    difficulty: 'easy',
    topic: 'Buses',
    questionText: 'Which system bus carries addresses specifying physical memory locations and is strictly unidirectional from CPU to memory?',
    options: ['Data Bus', 'Address Bus', 'Control Bus', 'Power Bus'],
    correctOption: 1,
    explanation: 'The Address Bus is unidirectional; the CPU outputs the target memory address onto the bus to indicate where to read or write.'
  },
  {
    subject: 'coa',
    difficulty: 'easy',
    topic: 'Endianness',
    questionText: 'In a "Little-Endian" memory representation, how is a multi-byte integer stored in memory?',
    options: [
      'The most significant byte is stored at the lowest memory address',
      'The least significant byte is stored at the lowest memory address',
      'Bytes are stored in random order',
      'Bytes are inverted bitwise'
    ],
    correctOption: 1,
    explanation: 'Little-endian formats (used by x86) place the Least Significant Byte (LSB) at the smallest/base memory address.'
  },
  {
    subject: 'coa',
    difficulty: 'easy',
    topic: 'RAM Types',
    questionText: 'Why does Dynamic RAM (DRAM) require periodic electrical refreshing whereas Static RAM (SRAM) does not?',
    options: [
      'DRAM uses capacitors that leak charge over time, whereas SRAM uses bistable latching transistors',
      'DRAM operates on alternating current (AC)',
      'SRAM has no transistors',
      'DRAM is optical storage'
    ],
    correctOption: 0,
    explanation: 'DRAM cells store bits as charge in tiny capacitors that naturally discharge, requiring refresh cycles. SRAM uses flip-flop cross-coupled inverters that hold state as long as power is applied.'
  },

  // --- COA MEDIUM ---
  {
    subject: 'coa',
    difficulty: 'medium',
    topic: 'Instruction Pipelining',
    questionText: 'In a 5-stage RISC processor pipeline (IF, ID, EX, MEM, WB), what is the primary benefit of pipelining?',
    options: [
      'It reduces the execution latency of an individual instruction',
      'It increases overall instruction throughput by overlapping execution of multiple instructions',
      'It completely eliminates the need for a clock cycle',
      'It prevents all types of software bugs'
    ],
    correctOption: 1,
    explanation: 'Pipelining does not shorten individual instruction latency; instead, it increases instruction throughput (IPC) by working on different stages of several instructions concurrently.'
  },
  {
    subject: 'coa',
    difficulty: 'medium',
    topic: 'Pipeline Hazards',
    questionText: 'A "Data Hazard" (such as Read-After-Write or RAW) in a pipelined CPU occurs when:',
    options: [
      'Two instructions compete for the same physical functional hardware resource simultaneously',
      'An instruction depends on the result of an earlier instruction that has not yet completed its writeback stage',
      'A conditional branch outcome has not been evaluated',
      'Power supply voltage fluctuates'
    ],
    correctOption: 1,
    explanation: 'A RAW data hazard arises when instruction j tries to read a register before an earlier instruction i writes its computed result back to that register.'
  },
  {
    subject: 'coa',
    difficulty: 'medium',
    topic: 'Cache Mapping',
    questionText: 'In a "Direct-Mapped" cache, where can a specific main memory block be mapped?',
    options: [
      'Any available cache block arbitrarily',
      'Exactly one specific cache line determined by (Block Address modulo Number of Cache Lines)',
      'Only to line 0 or line 1',
      'To the least recently used block across all sets'
    ],
    correctOption: 1,
    explanation: 'Direct mapping uses a deterministic hash: cache line = (block address) mod (total cache lines), giving each memory block exactly one possible location.'
  },
  {
    subject: 'coa',
    difficulty: 'medium',
    topic: 'Addressing Modes',
    questionText: 'In "Immediate Addressing Mode", where is the operand value located?',
    options: [
      'Directly inside the instruction itself as a constant',
      'Inside the register pointed to by the program counter',
      'At the effective address computed from base plus index',
      'In secondary disk storage'
    ],
    correctOption: 0,
    explanation: 'In immediate addressing mode, the operand operand field contains the actual literal data constant (e.g., ADD R1, #5).'
  },
  {
    subject: 'coa',
    difficulty: 'medium',
    topic: 'Cache Misses',
    questionText: 'The "Three Cs" model categorizes cache misses into Compulsory, Capacity, and:',
    options: ['Complex', 'Conflict', 'Circular', 'Concurrent'],
    correctOption: 1,
    explanation: 'The 3 C\'s of cache misses are: Compulsory (cold start on first access), Capacity (cache too small to hold working set), and Conflict (multiple blocks mapping to the same set).'
  },
  {
    subject: 'coa',
    difficulty: 'medium',
    topic: 'Branch Prediction',
    questionText: 'What is the purpose of Branch Prediction hardware in modern superscalar processors?',
    options: [
      'To guess whether a conditional jump will be taken to avoid pipeline stalls and flushes',
      'To calculate floating-point operations in parallel',
      'To compress machine code in memory',
      'To format hard drive partitions'
    ],
    correctOption: 0,
    explanation: 'Branch prediction guesses conditional outcomes so the instruction fetch unit can speculate ahead without waiting for execution stage evaluation, preventing costly pipeline bubbles.'
  },
  {
    subject: 'coa',
    difficulty: 'medium',
    topic: 'DMA',
    questionText: 'Direct Memory Access (DMA) enhances system performance primarily by:',
    options: [
      'Overclocking the CPU clock rate',
      'Enabling high-speed I/O devices to transfer data directly to/from RAM without continuous CPU intervention',
      'Replacing main memory with SSDs',
      'Translating machine code to microcode'
    ],
    correctOption: 1,
    explanation: 'DMA controllers transfer large blocks of data between peripherals and memory autonomously, freeing the CPU to execute instructions concurrently.'
  },
  {
    subject: 'coa',
    difficulty: 'medium',
    topic: 'Interrupts',
    questionText: 'How does an interrupt-driven I/O mechanism differ from polling?',
    options: [
      'Polling never queries device status',
      'Interrupts allow the CPU to perform other work until the device signals readiness via an interrupt signal, eliminating busy-waiting',
      'Interrupts are slower than polling in high-throughput applications',
      'Interrupts can only occur on system startup'
    ],
    correctOption: 1,
    explanation: 'Polling continuously wastes CPU cycles checking status bits (busy-wait), whereas interrupt-driven I/O notifies the CPU only when an event requires service.'
  },

  // --- COA HARD ---
  {
    subject: 'coa',
    difficulty: 'hard',
    topic: 'Cache Write Policies',
    questionText: 'In cache memory architecture, what is the key trade-off between Write-Through and Write-Back policies?',
    options: [
      'Write-Through writes only to disk, Write-Back writes only to RAM',
      'Write-Through immediately updates both cache and main memory guaranteeing consistency, whereas Write-Back updates only cache and uses a "dirty bit" to write to memory on eviction',
      'Write-Back does not require cache tags',
      'Write-Through is always faster than Write-Back'
    ],
    correctOption: 1,
    explanation: 'Write-Through guarantees data consistency between cache and memory at the cost of bus write bandwidth. Write-Back minimizes bus traffic by delaying memory updates until a dirty cache block is replaced.'
  },
  {
    subject: 'coa',
    difficulty: 'hard',
    topic: 'Data Forwarding',
    questionText: 'How does "Operand Forwarding" (or Bypassing) mitigate RAW data hazards in a pipelined CPU?',
    options: [
      'By reordering high-level source code lines during compilation',
      'By routing the computed result directly from the ALU (EX/MEM stage) output to the inputs of dependent instructions in execution stage without waiting for the register writeback (WB) stage',
      'By pausing the CPU clock for 4 cycles',
      'By converting arithmetic operations to logical operations'
    ],
    correctOption: 1,
    explanation: 'Forwarding hardware feeds results computed in the EX stage directly to the ALU inputs for the next instruction, eliminating stalls when the consumer immediately follows the producer.'
  },
  {
    subject: 'coa',
    difficulty: 'hard',
    topic: 'TLB and Page Faults',
    questionText: 'What occurs when a virtual address lookup produces a TLB Miss followed by a Page Table Hit?',
    options: [
      'A page fault interrupt triggers disk I/O to read the page',
      'The MMU walks the page table in memory, finds the valid frame number, and updates the TLB without disk access',
      'The program is terminated with a segmentation violation',
      'The CPU switches into kernel sleep mode'
    ],
    correctOption: 1,
    explanation: 'A TLB miss simply means the cache of recent address translations lacked the entry; if the page table entry has valid bit = 1, it is already resident in RAM, so the translation is fetched and loaded into TLB without any disk I/O.'
  },
  {
    subject: 'coa',
    difficulty: 'hard',
    topic: 'Superscalar Architecture',
    questionText: 'What defines a "Superscalar" processor architecture?',
    options: [
      'A processor that uses optical circuits instead of silicon',
      'A processor capable of executing more than one instruction per clock cycle by utilizing multiple redundant execution pipelines',
      'A processor without registers',
      'A processor limited to 8-bit operations'
    ],
    correctOption: 1,
    explanation: 'Superscalar processors employ multiple execution units (multiple ALUs, FPUs) and instruction-level parallelism (ILP) to fetch, decode, and dispatch multiple instructions in a single cycle (IPC > 1).'
  },

  // ==========================================
  // OS - OPERATING SYSTEMS
  // ==========================================
  // --- OS EASY ---
  {
    subject: 'os',
    difficulty: 'easy',
    topic: 'Process Concept',
    questionText: 'What is the fundamental difference between a program and a process?',
    options: [
      'A program is an active execution unit, while a process is passive code on disk',
      'A program is passive code stored on secondary storage, while a process is an active program in execution with associated resources',
      'A program has a PID, a process does not',
      'There is no difference between them'
    ],
    correctOption: 1,
    explanation: 'A program is a passive executable file stored on disk, whereas a process is an active entity loaded into memory with a Program Counter, stack, data, and allocated system resources.'
  },
  {
    subject: 'os',
    difficulty: 'easy',
    topic: 'Process States',
    questionText: 'Which process state describes a process that is waiting to be assigned to a CPU by the scheduler?',
    options: ['Running', 'Ready', 'Terminated', 'Blocked'],
    correctOption: 1,
    explanation: 'A process in the Ready state has all required resources loaded in memory and is queued waiting for CPU time from the dispatcher.'
  },
  {
    subject: 'os',
    difficulty: 'easy',
    topic: 'Context Switching',
    questionText: 'What is "Context Switching" in an operating system?',
    options: [
      'Deleting an application from memory',
      'Saving the state (context) of the currently running process and loading the saved state of a new process onto the CPU',
      'Switching from 32-bit to 64-bit architecture',
      'Connecting to the internet'
    ],
    correctOption: 1,
    explanation: 'Context switching preserves the PCB (Program Counter, registers, memory state) of an interrupted process and restores another process so multiple tasks share the CPU.'
  },
  {
    subject: 'os',
    difficulty: 'easy',
    topic: 'Scheduling Algorithms',
    questionText: 'Which CPU scheduling algorithm allocates CPU time to processes in strictly First-Come, First-Served order without preemption?',
    options: ['Round Robin (RR)', 'Shortest Job First (SJF)', 'FCFS', 'Priority Scheduling'],
    correctOption: 2,
    explanation: 'FCFS (First-Come, First-Served) non-preemptively executes processes in the exact order of their arrival in the ready queue.'
  },
  {
    subject: 'os',
    difficulty: 'easy',
    topic: 'Deadlock',
    questionText: 'A deadlock in an operating system is defined as a situation where:',
    options: [
      'A process terminates abnormally due to an unhandled exception',
      'A set of processes are permanently blocked because each process is holding a resource and waiting for another resource held by another process in the set',
      'The CPU clock frequency drops to zero',
      'The hard disk is full'
    ],
    correctOption: 1,
    explanation: 'Deadlock occurs when processes are unable to proceed because each holds resources needed by others while waiting for resources held by those same processes.'
  },
  {
    subject: 'os',
    difficulty: 'easy',
    topic: 'Virtual Memory',
    questionText: 'What is a "Page Fault" in virtual memory systems?',
    options: [
      'A hardware failure in physical RAM chips',
      'An interrupt raised when an executing process attempts to access a page that is mapped in its address space but not currently resident in physical memory (RAM)',
      'A syntax error in source code',
      'An access violation trying to write to read-only kernel memory'
    ],
    correctOption: 1,
    explanation: 'A page fault occurs when a referenced virtual page has its valid bit set to 0 in the page table, prompting the OS to bring the page from backing store into RAM.'
  },
  {
    subject: 'os',
    difficulty: 'easy',
    topic: 'Threads',
    questionText: 'Threads belonging to the same process share which of the following resources?',
    options: [
      'Program Counter and Registers',
      'Stack memory',
      'Address space (code section, data section) and open file descriptors',
      'Thread ID'
    ],
    correctOption: 2,
    explanation: 'Threads share their parent process\'s virtual address space (heap, data, code) and operating system resources, but maintain private stacks and register sets.'
  },
  {
    subject: 'os',
    difficulty: 'easy',
    topic: 'Spooling',
    questionText: 'What does the acronym SPOOLING stand for in operating systems?',
    options: [
      'Simultaneous Peripheral Operations On-Line',
      'Serial Process Organization On Line',
      'System Program Output Overload Line',
      'Storage Pool Organized On Logic'
    ],
    correctOption: 0,
    explanation: 'SPOOLING stands for Simultaneous Peripheral Operations On-Line, an overlapping technique buffering data for slower devices like printers.'
  },

  // --- OS MEDIUM ---
  {
    subject: 'os',
    difficulty: 'medium',
    topic: 'Critical Section',
    questionText: 'Which three requirements must any valid solution to the Critical Section problem strictly satisfy?',
    options: [
      'Mutual Exclusion, Progress, and Bounded Waiting',
      'High Priority, Low Latency, and Fast Recovery',
      'Preemption, Non-preemption, and Circular Wait',
      'Atomicity, Consistency, and Durability'
    ],
    correctOption: 0,
    explanation: 'Classic synchronization requires Mutual Exclusion (only one process in critical section), Progress (selection of next entrant cannot be postponed indefinitely), and Bounded Waiting (limit on times other processes can enter before a request is granted).'
  },
  {
    subject: 'os',
    difficulty: 'medium',
    topic: 'Semaphores',
    questionText: 'In Dijkstra\'s semaphore definition, what does the wait() (or P()) operation do when the semaphore value is <= 0?',
    options: [
      'Increments the semaphore value immediately',
      'Blocks the invoking process until the semaphore value becomes positive and then decrements it',
      'Terminates the calling process with SIGSEGV',
      'Returns a random integer'
    ],
    correctOption: 1,
    explanation: 'wait(S) decrements S. If S is not positive, the calling process is blocked and placed in the semaphore\'s wait queue until a signal() operation wakes it up.'
  },
  {
    subject: 'os',
    difficulty: 'medium',
    topic: 'Deadlock Conditions',
    questionText: 'Which of the following is NOT one of the four Coffman conditions necessary for deadlock to occur?',
    options: [
      'Mutual Exclusion',
      'Hold and Wait',
      'Preemptive Resource Allocation',
      'Circular Wait'
    ],
    correctOption: 2,
    explanation: 'The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption were allowed, deadlock cannot occur.'
  },
  {
    subject: 'os',
    difficulty: 'medium',
    topic: 'SJF Scheduling',
    questionText: 'Why is Shortest Job First (SJF) scheduling provably optimal for minimizing average waiting time?',
    options: [
      'It always runs the longest process first',
      'Moving shorter tasks ahead of longer ones decreases waiting time for short jobs more than it increases waiting time for long jobs',
      'It eliminates CPU idle time',
      'It requires zero memory'
    ],
    correctOption: 1,
    explanation: 'By executing shorter bursts first, the accumulated waiting time across all queued processes is minimized, giving the lowest mathematical average waiting time.'
  },
  {
    subject: 'os',
    difficulty: 'medium',
    topic: 'Round Robin Quantum',
    questionText: 'In Round Robin scheduling, what happens if the time quantum is chosen to be extremely large (approaching infinity)?',
    options: [
      'It degenerates into First-Come First-Served (FCFS) scheduling',
      'It degenerates into Shortest Job First (SJF)',
      'Context switching overhead skyrockets',
      'Average response time drops to zero'
    ],
    correctOption: 0,
    explanation: 'If the time quantum exceeds the longest process burst time, every process completes in a single turn without preemption, behaving exactly like FCFS.'
  },
  {
    subject: 'os',
    difficulty: 'medium',
    topic: 'Internal Fragmentation',
    questionText: 'What causes Internal Fragmentation in memory management systems?',
    options: [
      'Free memory broken into small scattered holes between allocated blocks',
      'Memory allocated to a process being slightly larger than the requested size due to fixed block or page partition sizing',
      'Unused swap disk space',
      'Page tables occupying all physical RAM'
    ],
    correctOption: 1,
    explanation: 'Internal fragmentation occurs when memory is allocated in fixed-size blocks (e.g., 4KB pages) and a process uses only a fraction of the last block, leaving the unused portion wasted inside.'
  },
  {
    subject: 'os',
    difficulty: 'medium',
    topic: 'Page Replacement',
    questionText: 'What is Bélády’s Anomaly in operating systems page replacement algorithms?',
    options: [
      'Memory usage decreasing as more processes are spawned',
      'The counter-intuitive phenomenon where increasing physical page frames leads to an increased number of page faults under FIFO',
      'LRU executing slower than optimal replacement',
      'A system running out of swap space'
    ],
    correctOption: 1,
    explanation: 'Bélády\'s Anomaly is the phenomenon where allocating more page frames increases the total number of page faults under certain algorithms like FIFO.'
  },
  {
    subject: 'os',
    difficulty: 'medium',
    topic: 'Spinlocks vs Mutex',
    questionText: 'When is a Spinlock preferable over a sleeping Mutex lock?',
    options: [
      'In single-core systems running long calculations',
      'In multi-core systems when the critical section is extremely short, so the cost of busy-waiting is less than a context switch',
      'When user processes are waiting for disk I/O',
      'When priority inversion is desired'
    ],
    correctOption: 1,
    explanation: 'Spinlocks burn CPU cycles in a tight loop instead of sleeping; they are preferred in multiprocessor kernels when lock hold times are shorter than the context switch overhead.'
  },

  // --- OS HARD ---
  {
    subject: 'os',
    difficulty: 'hard',
    topic: 'Banker’s Algorithm',
    questionText: 'How does Dijkstra\'s Banker\'s Algorithm determine if granting a resource request leaves the system in a "Safe State"?',
    options: [
      'By confirming that total available resources exceed the current request',
      'By verifying the existence of at least one execution sequence of all processes such that each can satisfy its maximum remaining needs and terminate',
      'By randomly killing low priority processes',
      'By converting all resources into virtual memory'
    ],
    correctOption: 1,
    explanation: 'A state is defined as safe if there exists a safe sequence <P1, P2, ... Pn> where each Pi\'s maximum remaining need can be satisfied by current available resources plus resources freed by preceding processes.'
  },
  {
    subject: 'os',
    difficulty: 'hard',
    topic: 'Thrashing',
    questionText: 'What causes "Thrashing" in an operating system and what is the primary symptom?',
    options: [
      'Hard disk failure leading to corrupt sectors',
      'A process spending more time paging (swapping pages in and out) than executing instructions, causing CPU utilization to collapse toward zero',
      'Excessive CPU scheduling interrupts during gaming',
      'Multiple processes deadlocked on mutexes'
    ],
    correctOption: 1,
    explanation: 'Thrashing occurs when the sum of active processes\' working sets exceeds physical memory; pages are constantly evicted and immediately needed again, causing the CPU to sit idle waiting for disk I/O.'
  },
  {
    subject: 'os',
    difficulty: 'hard',
    topic: 'Inverted Page Table',
    questionText: 'What is the principal advantage and disadvantage of an Inverted Page Table over traditional multi-level hierarchical page tables?',
    options: [
      'Advantage: Faster lookup; Disadvantage: More memory consumed',
      'Advantage: Fixed memory overhead proportional to physical frames rather than virtual address space; Disadvantage: Longer lookup time requiring hashing or linear scan',
      'Advantage: Eliminates page faults; Disadvantage: Limited to 16-bit systems',
      'Advantage: Requires no hardware support; Disadvantage: No protection bits'
    ],
    correctOption: 1,
    explanation: 'Inverted Page Tables maintain one entry per physical frame (saving massive RAM on 64-bit systems), but finding a virtual-to-physical translation requires hashing or associative search.'
  },
  {
    subject: 'os',
    difficulty: 'hard',
    topic: 'Priority Inversion',
    questionText: 'How does the "Priority Inheritance Protocol" resolve the classic Priority Inversion problem?',
    options: [
      'By lowering the priority of high-priority tasks',
      'By temporarily boosting the priority of a low-priority process holding a resource to match the highest priority of any task waiting for that resource',
      'By aborting the middle priority task',
      'By disabling all interrupts permanently'
    ],
    correctOption: 1,
    explanation: 'Priority Inheritance elevates the lower-priority thread holding the lock to the priority of the highest-priority blocked waiter until it releases the lock, preventing intermediate tasks from preempting it.'
  },

  // ==========================================
  // DBMS - DATABASE MANAGEMENT SYSTEMS
  // ==========================================
  // --- DBMS EASY ---
  {
    subject: 'dbms',
    difficulty: 'easy',
    topic: 'Primary Key',
    questionText: 'Which constraint uniquely identifies every record in a relational database table and strictly forbids NULL values?',
    options: ['Foreign Key', 'Primary Key', 'Check Constraint', 'Default Constraint'],
    correctOption: 1,
    explanation: 'A Primary Key enforces uniqueness across all rows and strictly disallows NULL values, uniquely identifying each record in a relational table.'
  },
  {
    subject: 'dbms',
    difficulty: 'easy',
    topic: 'Foreign Key',
    questionText: 'What is the primary role of a Foreign Key constraint in relational databases?',
    options: [
      'To speed up arithmetic computations',
      'To enforce referential integrity between two tables by matching primary key values in the referenced table',
      'To automatically encrypt sensitive columns',
      'To allow unlimited duplicate rows'
    ],
    correctOption: 1,
    explanation: 'Foreign keys maintain referential integrity by ensuring child row values correspond to valid existing parent rows in the referenced table.'
  },
  {
    subject: 'dbms',
    difficulty: 'easy',
    topic: 'SQL Sublanguages',
    questionText: 'Which SQL statement category do CREATE, ALTER, and DROP belong to?',
    options: ['DML (Data Manipulation Language)', 'DDL (Data Definition Language)', 'DCL (Data Control Language)', 'TCL (Transaction Control Language)'],
    correctOption: 1,
    explanation: 'DDL (Data Definition Language) commands define, alter, and delete database schema structures.'
  },
  {
    subject: 'dbms',
    difficulty: 'easy',
    topic: 'SQL Clauses',
    questionText: 'Which SQL clause is used to eliminate duplicate rows from a query result set?',
    options: ['UNIQUE', 'DISTINCT', 'DIFFERENT', 'ISOLATE'],
    correctOption: 1,
    explanation: 'The SELECT DISTINCT clause filters out duplicate tuples, returning only distinct result rows.'
  },
  {
    subject: 'dbms',
    difficulty: 'easy',
    topic: 'Relational Terms',
    questionText: 'In the formal relational model, what do the terms "Tuple" and "Attribute" correspond to in SQL tables?',
    options: [
      'Tuple = Row / Record, Attribute = Column / Field',
      'Tuple = Column, Attribute = Row',
      'Tuple = Primary Key, Attribute = Table Name',
      'Tuple = Database, Attribute = Index'
    ],
    correctOption: 0,
    explanation: 'In relational algebra, a relation consists of tuples (rows/records) containing attributes (columns/fields).'
  },
  {
    subject: 'dbms',
    difficulty: 'easy',
    topic: 'ACID Properties',
    questionText: 'Which ACID property guarantees that all operations within a transaction either completely succeed or completely fail together?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctOption: 0,
    explanation: 'Atomicity ensures "all-or-nothing" execution: if any transaction step fails, the entire transaction is rolled back to its previous state.'
  },
  {
    subject: 'dbms',
    difficulty: 'easy',
    topic: 'Aggregate Functions',
    questionText: 'Which of the following is NOT an SQL aggregate function?',
    options: ['COUNT()', 'AVG()', 'CONCAT()', 'SUM()'],
    correctOption: 2,
    explanation: 'COUNT, AVG, SUM, MIN, and MAX are standard aggregate functions operating on multiple rows; CONCAT is a scalar string manipulation function.'
  },
  {
    subject: 'dbms',
    difficulty: 'easy',
    topic: 'DBMS vs File System',
    questionText: 'What is a significant advantage of using a DBMS over a traditional file processing system?',
    options: [
      'Data redundancy is minimized and data consistency is enforced',
      'DBMS consumes less memory than flat text files',
      'DBMS does not require storage devices',
      'File systems provide automatic ACID transaction guarantees'
    ],
    correctOption: 0,
    explanation: 'DBMS software centralizes data, eliminating isolated redundant copies and enforcing integrity, concurrency control, and crash recovery.'
  },

  // --- DBMS MEDIUM ---
  {
    subject: 'dbms',
    difficulty: 'medium',
    topic: 'HAVING vs WHERE',
    questionText: 'What is the critical functional distinction between the WHERE and HAVING clauses in SQL?',
    options: [
      'WHERE filters grouped aggregate data, whereas HAVING filters individual rows before grouping',
      'WHERE filters individual rows prior to grouping; HAVING filters aggregated groups after GROUP BY evaluation',
      'HAVING can be used without GROUP BY, but WHERE cannot',
      'They are completely interchangeable with identical performance'
    ],
    correctOption: 1,
    explanation: 'The WHERE clause filters individual rows before any groupings are formed. The HAVING clause applies condition filters to the aggregated summary values generated by GROUP BY.'
  },
  {
    subject: 'dbms',
    difficulty: 'medium',
    topic: 'Normalization 2NF',
    questionText: 'A relation is in Second Normal Form (2NF) if and only if it is in 1NF and:',
    options: [
      'It contains no transitive functional dependencies',
      'Every non-prime attribute is fully functionally dependent on the entire primary key (no partial dependencies)',
      'All determinants are candidate keys',
      'It contains at least two foreign keys'
    ],
    correctOption: 1,
    explanation: '2NF eliminates partial dependencies: no non-prime attribute may depend on only a proper subset of any candidate key.'
  },
  {
    subject: 'dbms',
    difficulty: 'medium',
    topic: 'Normalization 3NF',
    questionText: 'What type of dependency is specifically eliminated when decomposing a 2NF relation into Third Normal Form (3NF)?',
    options: ['Partial Dependency', 'Transitive Dependency', 'Multivalued Dependency', 'Join Dependency'],
    correctOption: 1,
    explanation: '3NF removes transitive dependencies where a non-prime attribute functionally determines another non-prime attribute (X -> Y -> Z).'
  },
  {
    subject: 'dbms',
    difficulty: 'medium',
    topic: 'SQL Joins',
    questionText: 'Which SQL join returns all rows from the left table and matching rows from the right table, substituting NULLs when no match exists?',
    options: ['INNER JOIN', 'RIGHT OUTER JOIN', 'LEFT OUTER JOIN', 'CROSS JOIN'],
    correctOption: 2,
    explanation: 'LEFT OUTER JOIN preserves every record from the left table; unmatched columns from the right table are populated with NULL values.'
  },
  {
    subject: 'dbms',
    difficulty: 'medium',
    topic: 'Durability',
    questionText: 'How do database engines guarantee the "Durability" property of ACID even across power loss crashes?',
    options: [
      'By keeping all data in volatile CPU L1 cache',
      'By employing Write-Ahead Logging (WAL) onto non-volatile storage before committing',
      'By refusing to commit more than 1 transaction per second',
      'By replicating code to ROM'
    ],
    correctOption: 1,
    explanation: 'Write-Ahead Logging (WAL) ensures all change records are flushed to persistent disk logs before a transaction commit is confirmed, allowing redo during crash recovery.'
  },
  {
    subject: 'dbms',
    difficulty: 'medium',
    topic: 'Indexes',
    questionText: 'How does a Clustered Index differ from a Non-Clustered Index in an RDBMS table?',
    options: [
      'A table can have multiple clustered indexes, but only one non-clustered index',
      'A clustered index dictates the physical storage order of rows on disk (only one allowed per table), while non-clustered indexes store pointers to the data rows',
      'Clustered indexes only work on VARCHAR columns',
      'Non-clustered indexes modify the physical table ordering'
    ],
    correctOption: 1,
    explanation: 'Because data rows can be physically stored on disk in only one order, a table can have only one clustered index. Non-clustered indexes maintain separate B-Tree structures pointing to the rows.'
  },
  {
    subject: 'dbms',
    difficulty: 'medium',
    topic: 'Candidate Key',
    questionText: 'What is a "Candidate Key" in relational database theory?',
    options: [
      'Any column containing numbers',
      'A minimal superkey capable of uniquely identifying every tuple without redundant attributes',
      'A foreign key referencing external tables',
      'A key generated only by AI'
    ],
    correctOption: 1,
    explanation: 'A candidate key is a minimal superkey: a set of attributes that uniquely identifies tuples such that no proper subset can also be a key.'
  },
  {
    subject: 'dbms',
    difficulty: 'medium',
    topic: 'Views',
    questionText: 'What is an SQL View in standard relational databases?',
    options: [
      'A physically duplicated table stored in high-speed RAM',
      'A virtual table defined by a stored SELECT query that executes dynamically upon access',
      'A hardware monitor showing query performance',
      'An encrypted database backup'
    ],
    correctOption: 1,
    explanation: 'A View is a virtual table containing no physical data of its own; it presents query results dynamically from underlying base tables.'
  },

  // --- DBMS HARD ---
  {
    subject: 'dbms',
    difficulty: 'hard',
    topic: 'Boyce-Codd Normal Form',
    questionText: 'A relation R is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:',
    options: [
      'Y is a candidate key',
      'X is a superkey of R',
      'X and Y are both non-prime attributes',
      'Y is a single atomic integer'
    ],
    correctOption: 1,
    explanation: 'BCNF is a stricter form of 3NF: for every functional dependency X -> Y, the determinant X must strictly be a superkey of relation R.'
  },
  {
    subject: 'dbms',
    difficulty: 'hard',
    topic: 'Two-Phase Locking',
    questionText: 'How does the Strict Two-Phase Locking (Strict 2PL) concurrency protocol prevent Cascading Aborts?',
    options: [
      'By disallowing all shared locks entirely',
      'By requiring transactions to hold all exclusive (write) locks until the transaction terminates (Commit or Abort)',
      'By executing all transactions sequentially on a single thread',
      'By releasing locks immediately after each write statement'
    ],
    correctOption: 1,
    explanation: 'Strict 2PL prevents cascading aborts by holding all exclusive locks until commit or abort, guaranteeing other transactions never read uncommitted dirty data.'
  },
  {
    subject: 'dbms',
    difficulty: 'hard',
    topic: 'B+ Tree Indexing',
    questionText: 'Why do relational databases prefer B+ Trees over B-Trees for database indexing?',
    options: [
      'B+ trees do not require disk access',
      'All record data pointers are stored only in leaf nodes, which are linked together in a sequential linked list for high-speed range queries',
      'B+ trees have a constant height of 1',
      'B+ trees require less memory than binary search trees'
    ],
    correctOption: 1,
    explanation: 'In a B+ tree, internal nodes store only routing keys (allowing higher branching factor / fanout), while leaf nodes store all data pointers and are chained together via bidirectional pointers, making range scans exceptionally fast.'
  },
  {
    subject: 'dbms',
    difficulty: 'hard',
    topic: 'Transaction Isolation',
    questionText: 'In ANSI SQL transaction isolation levels, which anomaly is possible under "Repeatable Read" that is prevented under "Serializable"?',
    options: [
      'Dirty Read',
      'Non-Repeatable Read',
      'Phantom Read',
      'Lost Update'
    ],
    correctOption: 2,
    explanation: 'Repeatable Read locks existing rows preventing updates/deletes, but does not lock index gaps, allowing another transaction to insert new matching rows that appear as "Phantom Reads". Serializable prevents phantom reads.'
  },

  // ==========================================
  // CN - COMPUTER NETWORKS
  // ==========================================
  // --- CN EASY ---
  {
    subject: 'cn',
    difficulty: 'easy',
    topic: 'OSI Model',
    questionText: 'Which layer of the OSI reference model is responsible for end-to-end communication, error recovery, and flow control between source and destination hosts?',
    options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
    correctOption: 2,
    explanation: 'The Transport Layer (Layer 4) provides transparent, end-to-end data transfer between source and destination endpoints, handling flow control, error recovery, and segmentation (e.g., TCP and UDP).'
  },
  {
    subject: 'cn',
    difficulty: 'easy',
    topic: 'Transport Protocols',
    questionText: 'What is the primary characteristic difference between TCP and UDP?',
    options: [
      'TCP is connectionless and unreliable, whereas UDP is connection-oriented and reliable',
      'TCP is connection-oriented and reliable, whereas UDP is connectionless and unreliable',
      'TCP operates at Layer 3, whereas UDP operates at Layer 4',
      'TCP is used exclusively for streaming video, whereas UDP is used for web pages'
    ],
    correctOption: 1,
    explanation: 'TCP (Transmission Control Protocol) is connection-oriented, requiring a 3-way handshake and guaranteeing ordered, reliable delivery. UDP (User Datagram Protocol) is lightweight, connectionless, and provides best-effort delivery with lower latency.'
  },
  {
    subject: 'cn',
    difficulty: 'easy',
    topic: 'MAC Addressing',
    questionText: 'How many bits are in a standard Media Access Control (MAC) address, and at which OSI layer does it operate?',
    options: ['32 bits, Network Layer', '48 bits, Data Link Layer', '64 bits, Physical Layer', '128 bits, Transport Layer'],
    correctOption: 1,
    explanation: 'A standard MAC address (Ethernet hardware address) is 48 bits (6 octets) long, usually written in hexadecimal (e.g., 00:1A:2B:3C:4D:5E), and operates at the Data Link Layer (Layer 2).'
  },
  {
    subject: 'cn',
    difficulty: 'easy',
    topic: 'Application Layer Ports',
    questionText: 'Which standard port number is assigned by default to the Domain Name System (DNS) service?',
    options: ['Port 22', 'Port 53', 'Port 80', 'Port 443'],
    correctOption: 1,
    explanation: 'DNS queries and responses predominantly use UDP (and TCP for large responses/zone transfers) on well-known Port 53. Port 22 is SSH, Port 80 is HTTP, and Port 443 is HTTPS.'
  },
  {
    subject: 'cn',
    difficulty: 'easy',
    topic: 'Network Topologies',
    questionText: 'In which network topology is every node connected directly to a central hub, switch, or concentrator?',
    options: ['Ring Topology', 'Star Topology', 'Bus Topology', 'Mesh Topology'],
    correctOption: 1,
    explanation: 'In a Star topology, all terminal devices are linked independently to a central device (such as a switch or hub). A failure of an individual cable affects only that node, leaving the rest of the network unaffected.'
  },
  {
    subject: 'cn',
    difficulty: 'easy',
    topic: 'Address Resolution Protocol',
    questionText: 'What is the primary function of the Address Resolution Protocol (ARP)?',
    options: [
      'Maps a 32-bit IPv4 address to a 48-bit physical MAC address',
      'Translates a domain name (FQDN) to an IP address',
      'Assigns dynamic IP addresses automatically to client devices',
      'Routes IP packets between different autonomous systems'
    ],
    correctOption: 0,
    explanation: 'ARP dynamically resolves a known logical network layer IP address to an unknown physical data link layer MAC address on a local broadcast network.'
  },
  {
    subject: 'cn',
    difficulty: 'easy',
    topic: 'Network Devices',
    questionText: 'Which networking device operates at Layer 2 of the OSI model and maintains a MAC address table to forward frames exclusively to the destination port?',
    options: ['Hub', 'Repeater', 'Switch', 'Router'],
    correctOption: 2,
    explanation: 'A network switch operates at Layer 2 (Data Link Layer). It inspects incoming frame source MAC addresses to populate its CAM/MAC table and selectively forwards unicast frames directly to the intended destination port.'
  },
  {
    subject: 'cn',
    difficulty: 'easy',
    topic: 'Transmission Modes',
    questionText: 'A communication channel where transmission can occur in both directions simultaneously is called:',
    options: ['Simplex', 'Half-Duplex', 'Full-Duplex', 'Multiplex'],
    correctOption: 2,
    explanation: 'Full-Duplex communication allows simultaneous bidirectional data transmission (e.g., modern switched Ethernet or telephone conversations), whereas Half-Duplex allows transmission in both directions but not at the same time.'
  },
  {
    subject: 'cn',
    difficulty: 'easy',
    topic: 'IP Addressing',
    questionText: 'What is the default subnet mask for a standard Class B IPv4 network?',
    options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'],
    correctOption: 1,
    explanation: 'Class B IPv4 networks use the first 16 bits for the network ID and the remaining 16 bits for host IDs, yielding a default subnet mask of 255.255.0.0 (/16 prefix).'
  },
  {
    subject: 'cn',
    difficulty: 'easy',
    topic: 'Network Troubleshooting',
    questionText: 'Which network protocol and message type does the ping utility use to test host reachability?',
    options: ['TCP SYN packets', 'UDP datagrams', 'ICMP Echo Request and Echo Reply', 'ARP Requests'],
    correctOption: 2,
    explanation: 'The ping command utilizes ICMP (Internet Control Message Protocol, Layer 3), sending ICMP Echo Request (Type 8) messages and listening for ICMP Echo Reply (Type 0) responses.'
  },

  // --- CN MEDIUM ---
  {
    subject: 'cn',
    difficulty: 'medium',
    topic: 'Subnetting & CIDR',
    questionText: 'How many usable host IP addresses are available in an IPv4 subnet with the CIDR prefix /26?',
    options: ['30', '62', '64', '126'],
    correctOption: 1,
    explanation: 'A /26 subnet leaves 32 - 26 = 6 host bits. Total IP addresses = 2^6 = 64. Subtracting 2 reserved addresses (1 for network ID and 1 for broadcast address) yields 64 - 2 = 62 usable host addresses.'
  },
  {
    subject: 'cn',
    difficulty: 'medium',
    topic: 'TCP Handshake',
    questionText: 'During the standard TCP 3-way connection handshake, what sequence of control flags is exchanged between client and server?',
    options: ['SYN, ACK, FIN', 'SYN, SYN-ACK, ACK', 'ACK, SYN-ACK, SYN', 'SYN, ACK-FIN, ACK'],
    correctOption: 1,
    explanation: 'The client initiates by sending a SYN packet with its initial sequence number (ISN). The server responds with SYN-ACK, acknowledging the client and synchronizing its own ISN. The client completes the handshake by sending an ACK.'
  },
  {
    subject: 'cn',
    difficulty: 'medium',
    topic: 'TCP Connection Teardown',
    questionText: 'What is the primary purpose of the TIME_WAIT state in the TCP state machine on the host initiating an active close?',
    options: [
      'To keep the socket open indefinitely for incoming data',
      'To ensure the final ACK was received by the remote peer and prevent delayed segments from colliding with a new connection',
      'To measure round-trip time for future connections',
      'To allow the client to renegotiate MSS parameters'
    ],
    correctOption: 1,
    explanation: 'The TIME_WAIT state (lasting 2 * MSL / Maximum Segment Lifetime) ensures that the remote peer received the final ACK (and can retransmit FIN if lost) and guarantees that stale/delayed packets from this connection expire before a new socket reuses the same 4-tuple.'
  },
  {
    subject: 'cn',
    difficulty: 'medium',
    topic: 'Flow Control',
    questionText: 'In TCP, how does the receiver regulate the rate at which the sender transmits data to avoid overwhelming the receiver buffer?',
    options: [
      'By dynamically adjusting the Congestion Window (cwnd)',
      'By advertising its Receive Window (rwnd) in the TCP header',
      'By dropping packets randomly (RED)',
      'By sending ICMP Source Quench messages'
    ],
    correctOption: 1,
    explanation: 'Flow control is receiver-driven: the receiving TCP host advertises the available space in its socket receive buffer using the 16-bit Window Size field (rwnd). The sender usable window cannot exceed min(rwnd, cwnd).'
  },
  {
    subject: 'cn',
    difficulty: 'medium',
    topic: 'Sliding Window Protocols',
    questionText: 'In the Go-Back-N (GBN) ARQ protocol with window size N, what happens if frame 3 is lost while frames 4 and 5 arrive safely at the receiver?',
    options: [
      'Receiver buffers frames 4 and 5, acknowledging frame 3 upon selective retransmission',
      'Receiver discards frames 4 and 5, and sender retransmits frames 3, 4, and 5 upon timeout',
      'Sender retransmits only frame 3, leaving 4 and 5 in the receiver pipeline',
      'The connection is terminated immediately due to an unrecoverable sequence error'
    ],
    correctOption: 1,
    explanation: 'In Go-Back-N, the receiver does not buffer out-of-order frames and accepts frames strictly in sequence. When frame 3 is lost, subsequent frames (4 and 5) are discarded, and the sender must go back and retransmit all unacknowledged frames starting from frame 3 when its timer expires.'
  },
  {
    subject: 'cn',
    difficulty: 'medium',
    topic: 'Routing Protocols',
    questionText: 'Which routing protocol uses the Dijkstra Shortest Path First (SPF) algorithm and requires each router to maintain a complete topological link-state database (LSDB)?',
    options: [
      'RIP (Routing Information Protocol)',
      'BGP (Border Gateway Protocol)',
      'OSPF (Open Shortest Path First)',
      'EGP (Exterior Gateway Protocol)'
    ],
    correctOption: 2,
    explanation: 'OSPF is a Link-State routing protocol. Each router floods Link State Advertisements (LSAs) so every router in the area builds an identical Link-State Database (LSDB), then runs Dijkstra SPF algorithm to calculate the shortest path tree to all destinations.'
  },
  {
    subject: 'cn',
    difficulty: 'medium',
    topic: 'Medium Access Control',
    questionText: 'Why does standard 802.11 Wi-Fi use CSMA/CA (Collision Avoidance) rather than CSMA/CD (Collision Detection) used in wired Ethernet?',
    options: [
      'Wi-Fi radios cannot transmit and receive simultaneously on the same frequency to detect collisions while transmitting',
      'Wi-Fi packets do not have checksums to verify errors',
      'Wi-Fi operates exclusively at the network layer',
      'Wi-Fi switches eliminate collisions completely'
    ],
    correctOption: 0,
    explanation: 'In wireless transmissions, the local transmitting power completely overpowers any incoming signal from distant nodes (dynamic range disparity), making real-time collision detection impossible during transmission. Additionally, the hidden terminal problem necessitates collision avoidance mechanisms (like IFS backoffs and RTS/CTS).'
  },
  {
    subject: 'cn',
    difficulty: 'medium',
    topic: 'Dynamic Host Configuration',
    questionText: 'What is the correct sequence of messages exchanged when a client automatically obtains an IP address via DHCP?',
    options: [
      'DHCP Request -> DHCP Discover -> DHCP Offer -> DHCP ACK',
      'DHCP Discover -> DHCP Offer -> DHCP Request -> DHCP ACK',
      'DHCP Offer -> DHCP Discover -> DHCP ACK -> DHCP Request',
      'DHCP Solicit -> DHCP Advertise -> DHCP Confirm -> DHCP Reply'
    ],
    correctOption: 1,
    explanation: 'The DHCP process follows the "DORA" acronym: Discover (client broadcasts looking for a server) -> Offer (server offers IP parameters) -> Request (client requests the offered IP) -> ACK (server acknowledges and confirms the lease).'
  },
  {
    subject: 'cn',
    difficulty: 'medium',
    topic: 'Network Address Translation',
    questionText: 'How does Port Address Translation (PAT), also known as NAT Overload, allow multiple internal private hosts to share a single public IP address simultaneously?',
    options: [
      'By assigning different MAC addresses to each outbound packet',
      'By mapping each private IP and source port combination to a unique ephemeral port on the public IP',
      'By dividing the public IP address into sub-nibbles',
      'By queuing outbound packets in time-division slots'
    ],
    correctOption: 1,
    explanation: 'PAT/NAT Overload tracks sessions in a state translation table by mapping each internal private IP address and source port to unique ephemeral source ports on the single external public IP address.'
  },
  {
    subject: 'cn',
    difficulty: 'medium',
    topic: 'TCP Congestion Control',
    questionText: 'In TCP Reno congestion control, what triggers the Fast Retransmit mechanism before the retransmission timer expires?',
    options: [
      'A single duplicate ACK',
      'Receipt of 3 duplicate ACKs (4 identical ACKs total)',
      'A reduction in receiver window size to 0',
      'An ICMP Destination Unreachable notification'
    ],
    correctOption: 1,
    explanation: 'When a packet is lost but subsequent packets arrive, the receiver sends duplicate ACKs for the last contiguous in-order byte. Upon receiving 3 duplicate ACKs, the sender infers packet loss and immediately triggers Fast Retransmit without waiting for the slow retransmission timer (RTO) to expire.'
  },

  // --- CN HARD ---
  {
    subject: 'cn',
    difficulty: 'hard',
    topic: 'Subnetting Calculations',
    questionText: 'An organization is allocated the block 172.16.0.0/16 and needs to create 12 distinct subnets, each supporting at least 1,500 usable host machines. What CIDR subnet mask must be used?',
    options: ['/20 (255.255.240.0)', '/21 (255.255.248.0)', '/22 (255.255.252.0)', '/19 (255.255.224.0)'],
    correctOption: 1,
    explanation: 'To support >= 1,500 hosts per subnet, we need 2^h - 2 >= 1500. For h = 11: 2^11 - 2 = 2046 hosts (sufficient, whereas h = 10 gives only 1022). With 11 host bits, the subnet mask length is 32 - 11 = 21 bits (/21). Subnetting /16 into /21 borrows 21 - 16 = 5 bits, creating 2^5 = 32 subnets (satisfying the >= 12 subnets requirement).'
  },
  {
    subject: 'cn',
    difficulty: 'hard',
    topic: 'TCP Sequence & Acknowledgment',
    questionText: 'Host A initiates a TCP connection to Host B with Initial Sequence Number (ISN) 1000. Host B replies with ISN 5000 and ACKs Host A. Then Host A sends 400 bytes of application payload to Host B. If no retransmissions occur, what Sequence Number and Acknowledgment Number will Host B include in its next ACK segment?',
    options: [
      'Seq = 5001, Ack = 1401',
      'Seq = 5000, Ack = 1400',
      'Seq = 5001, Ack = 1400',
      'Seq = 5000, Ack = 1401'
    ],
    correctOption: 0,
    explanation: 'In the SYN handshake, Host A consumes 1 seq num (SYN counts as 1 byte), so Host A first data byte starts at Seq = 1001. Sending 400 bytes of data spans sequence numbers 1001 through 1400. Host B acknowledges up through byte 1400 by requesting the next expected byte: Ack = 1401. Since Host B SYN consumed 1 byte (5000 + 1 = 5001) and Host B has sent no data since, Host B current Seq is 5001.'
  },
  {
    subject: 'cn',
    difficulty: 'hard',
    topic: 'Silly Window Syndrome',
    questionText: 'Which algorithm addresses Silly Window Syndrome on the sender side by buffering small amounts of data until a full Maximum Segment Size (MSS) packet can be sent or all previously sent data has been acknowledged?',
    options: ['Clark\'s Algorithm', 'Nagle\'s Algorithm', 'Karn\'s Algorithm', 'Jacobson\'s Algorithm'],
    correctOption: 1,
    explanation: 'Nagle\'s Algorithm prevents a sender from transmitting small TCP packets (tinygrams) that cause high header overhead. It dictates that if unacknowledged data is in flight, any new outgoing data smaller than MSS must be accumulated until either a full MSS is ready or the pending ACK is received. (Clark\'s algorithm solves the syndrome on the receiver side).'
  },
  {
    subject: 'cn',
    difficulty: 'hard',
    topic: 'IP Fragmentation',
    questionText: 'An IPv4 packet with an overall length of 4000 bytes (including a 20-byte IP header and 3980 bytes payload) passes through a router with an MTU of 1500 bytes. What will be the Fragment Offset (in 8-byte units) and More Fragments (MF) flag of the second fragment?',
    options: ['Offset = 185, MF = 1', 'Offset = 185, MF = 0', 'Offset = 1480, MF = 1', 'Offset = 370, MF = 1'],
    correctOption: 0,
    explanation: 'With MTU = 1500 and a 20-byte IP header, each fragment can carry at most 1500 - 20 = 1480 data bytes (1480 is divisible by 8: 1480 / 8 = 185). The first fragment carries bytes 0–1479 with Offset = 0, MF = 1. The second fragment carries bytes 1480–2959: its Fragment Offset is 1480 / 8 = 185, and since more data remains (3980 - 2960 = 1020 bytes), its MF flag is 1.'
  },
  {
    subject: 'cn',
    difficulty: 'hard',
    topic: 'Distance Vector Routing',
    questionText: 'In distance-vector routing protocols like RIP, how does the Split Horizon with Poison Reverse heuristic prevent two-node routing loops?',
    options: [
      'By broadcasting all routing updates via multicast instead of unicast',
      'By advertising a route back to the neighbor from which it was learned with a metric set to infinity (16)',
      'By imposing a hold-down timer of 30 minutes on failed links',
      'By converting distance-vector tables into link-state advertisements'
    ],
    correctOption: 1,
    explanation: 'Split Horizon with Poison Reverse explicitly advertises routes back out the interface they were learned from, but with the cost/metric set to infinity (in RIP, metric = 16 represents unreachable). This prevents the neighboring router from believing it has an alternate path back through this node.'
  },
  {
    subject: 'cn',
    difficulty: 'hard',
    topic: 'Border Gateway Protocol',
    questionText: 'Why is BGP classified as a Path-Vector routing protocol rather than a standard Distance-Vector protocol, and how does it prevent routing loops between Autonomous Systems (AS)?',
    options: [
      'It calculates link delays using ping packets and discards paths with high latency',
      'It maintains the complete list of Autonomous Systems traversed in the AS_PATH attribute; an AS discards any update containing its own AS number',
      'It uses Dijkstra\'s algorithm to construct a loop-free tree across all global routers',
      'It relies exclusively on TCP retransmissions to detect dropped loop packets'
    ],
    correctOption: 1,
    explanation: 'BGP is a Path-Vector protocol because routing advertisements carry the sequence of AS numbers (the AS_PATH attribute) that an update has traversed. If a BGP router inspects an incoming route announcement and finds its own AS number already in the AS_PATH, it immediately detects a routing loop and discards the update.'
  },
  {
    subject: 'cn',
    difficulty: 'hard',
    topic: 'Network Security & TCP',
    questionText: 'How do SYN Cookies defend a server against TCP SYN Flood Denial of Service (DoS) attacks?',
    options: [
      'By blocking all incoming TCP connection requests from non-whitelisted IP addresses',
      'By computing an encoded cryptographic sequence number from connection parameters, allowing the server to avoid allocating state memory until the final ACK arrives',
      'By forcing the client to solve a proof-of-work hash puzzle before sending the SYN packet',
      'By redirecting all SYN requests through a GRE tunnel'
    ],
    correctOption: 1,
    explanation: 'In a SYN flood, the server SYN backlog queue is exhausted by half-open connections. SYN Cookies prevent memory allocation on receiving a SYN: the server encodes timestamp, MSS, and a cryptographic hash of the 4-tuple into the Initial Sequence Number (ISN) of the SYN-ACK. Only when the client responds with a valid ACK (reflecting Ack = ISN + 1) does the server reconstruct connection state and allocate socket resources.'
  },
  {
    subject: 'cn',
    difficulty: 'hard',
    topic: 'Sliding Window Limits',
    questionText: 'In the Selective Repeat (SR) ARQ sliding window protocol using an n-bit sequence number space (0 to 2^n - 1), what is the maximum permissible window size W for both sender and receiver to avoid ambiguity between current and duplicate sequence numbers?',
    options: ['2^n', '2^(n-1)', '2^n - 1', '2^(n+1)'],
    correctOption: 1,
    explanation: 'In Selective Repeat, both the sender and receiver maintain sliding windows. If the window size W exceeded 2^(n-1) (half the sequence number space), an unacknowledged frame from the previous window could have the exact same sequence number as an accepted frame in the shifted new window. Thus, W_sender + W_receiver <= 2^n; when sender and receiver window sizes are equal, W <= 2^(n-1).'
  }
];
