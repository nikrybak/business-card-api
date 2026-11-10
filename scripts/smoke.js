// Live checks of a running instance: yarn smoke https://business-card-api-amp9.onrender.com
const base = process.argv[2] ?? 'http://localhost:3000';
const results = [];

const check = async (name, fn) => {
  const started = Date.now();
  try {
    await fn();
    results.push(`PASS ${name} (${Date.now() - started} ms)`);
  } catch (error) {
    results.push(`FAIL ${name}: ${error.message}`);
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const gql = async (query) => {
  const response = await fetch(`${base}/graphql`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return { status: response.status, body: await response.json() };
};

(async () => {
  await check('health reports ok with the database reachable', async () => {
    const response = await fetch(`${base}/health`);
    assert(response.status === 200, `status ${response.status}`);
    assert((await response.json()).status === 'ok', 'body is not ok');
  });

  await check('Apollo Sandbox landing page is served on GET /graphql', async () => {
    const response = await fetch(`${base}/graphql`, { headers: { accept: 'text/html' } });
    const html = await response.text();
    assert(response.status === 200, `status ${response.status}`);
    assert(/sandbox/i.test(html) && html.includes('embeddable-sandbox'), 'no embedded Sandbox in the page');
  });

  await check('introspection is enabled for Sandbox', async () => {
    const { body } = await gql('{ __schema { queryType { fields { name } } } }');
    const fields = body.data.__schema.queryType.fields.map(({ name }) => name);
    assert(fields.includes('profile'), `query fields: ${fields}`);
  });

  await check(
    'the example query from the task returns profile, skills, experience and projects',
    async () => {
      const { body } = await gql(
        '{ profile { name description skills { name } experience { company position } projects { name } } }',
      );
      const { profile } = body.data;
      assert(profile.name === 'Nikita Rybak', `name ${profile.name}`);
      assert(profile.skills.length > 30, `skills ${profile.skills.length}`);
      assert(profile.experience.length === 4, `experience ${profile.experience.length}`);
      assert(profile.projects.length === 3, `projects ${profile.projects.length}`);
    },
  );

  await check('links, periods and achievements are filled and ordered', async () => {
    const { body } = await gql(
      '{ profile { links { label url } experience { company period { start end months } achievements } } }',
    );
    const { links, experience } = body.data.profile;
    assert(links.map(({ label }) => label).join() === 'GitHub,LinkedIn,Telegram,Email', 'links order');
    assert(experience[0].company === 'Bambit' && experience[0].period.end === null, 'current job first');
    assert(
      experience.every(({ achievements }) => achievements.length > 0),
      'empty achievements',
    );
    assert(
      experience.every(({ period }) => period.months > 0),
      'empty period',
    );
  });

  await check('skills filter by category', async () => {
    const { body } = await gql('{ profile { skills(category: MESSAGING) { name category } } }');
    assert(
      body.data.profile.skills.map(({ name }) => name).join() === 'Kafka,RabbitMQ',
      'wrong filter result',
    );
  });

  await check('an unknown field is rejected with a validation error', async () => {
    const { status, body } = await gql('{ profile { salary } }');
    assert(status === 400, `status ${status}`);
    assert(body.errors[0].extensions.code === 'GRAPHQL_VALIDATION_FAILED', body.errors[0].extensions.code);
  });

  await check('a wrong enum value is rejected', async () => {
    const { body } = await gql('{ profile { skills(category: COOKING) { name } } }');
    assert(body.errors?.length > 0, 'no error for a wrong category');
  });

  await check('internal fields stay hidden', async () => {
    const { status } = await gql('{ profile { slug } }');
    assert(status === 400, `slug is exposed, status ${status}`);
  });

  console.log(results.join('\n'));
  process.exit(results.some((line) => line.startsWith('FAIL')) ? 1 : 0);
})();
