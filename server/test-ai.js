async function test() {
  const payload = { projectTitle: 'Test', description: 'Test', teamSize: 3, deadline: '2026-12-31' };
  try {
    const res = await fetch('http://localhost:5000/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
