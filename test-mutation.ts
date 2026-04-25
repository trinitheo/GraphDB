async function test() {
  const query = `
    mutation {
      addMedicalRecordEntry(input: {
        patientId: "pat_ben_carter_123",
        content: "Patient is feeling much better today.",
        type: "Progress Note"
      }) {
        id
        content
        authorName
      }
    }
  `;

  const user = {
    id: "U007",
    name: "Dr. Evelyn Chen",
    role: "Clinician"
  };

  const res = await fetch('http://localhost:3000/graphql', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JSON.stringify(user)}`
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
