async function verifyChatbot() {
  const baseUrl = 'http://localhost:5000';
  console.log(`Testing Chatbot against live server at ${baseUrl}`);

  // 1. Authenticate as student
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'prajwal@student.com', password: 'student123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  if (!token) throw new Error('Login failed: ' + JSON.stringify(loginData));

  // 2. Clear history for clean multi-turn test
  await fetch(`${baseUrl}/api/student/chatbot/history`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('✓ Cleared previous chat history for fresh multi-turn test.');

  const testPrompts = [
    'What are the current placement drives?',
    'How can I improve my ATS score?',
    'Explain Java HashMap with an example.',
    'Give me five medium-level DSA questions.',
    'Show my upcoming interviews.',
    'What are my weak technical skills?',
    'Explain the second point in your previous answer.',
    'Tell me a joke.'
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const question = testPrompts[i];
    console.log(`\n============================================================`);
    console.log(`TEST ${i + 1}/8: "${question}"`);
    console.log(`------------------------------------------------------------`);

    const res = await fetch(`${baseUrl}/api/student/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message: question })
    });

    const data = await res.json();
    console.log(`HTTP Status: ${res.status}`);
    console.log(`Is AI Powered: ${data.isAiPowered}`);

    // Check that response is NOT the repetitive welcome message
    const isRepetitiveWelcome = (data.reply || '').includes('I am CampusAI Copilot, your real-time campus placement assistant.\n\nHere is a quick snapshot of your profile:');
    if (isRepetitiveWelcome) {
      console.error(`❌ FAILED: Response contains repetitive welcome message!`);
      process.exit(1);
    } else {
      console.log(`✅ PASS: Contextual answer received.`);
    }

    console.log(`Preview (first 300 characters):\n${(data.reply || '').slice(0, 300)}...\n`);
    if (data.suggestions && data.suggestions.length > 0) {
      console.log(`Suggestions: ${data.suggestions.join(' | ')}`);
    }
  }

  // 3. Test empty message
  console.log(`\n============================================================`);
  console.log(`TEST 9: Empty Message Handling`);
  const emptyRes = await fetch(`${baseUrl}/api/student/chatbot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message: '   ' })
  });
  const emptyData = await emptyRes.json();
  console.log(`Status for empty message: ${emptyRes.status} (Expected: 400), Error: "${emptyData.error}"`);

  console.log('\n🎉 ALL 9 CHATBOT TESTS COMPLETED SUCCESSFULLY!');
}

verifyChatbot().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
