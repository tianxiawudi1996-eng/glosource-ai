/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { root } = require('./_utils');

const envPath = path.join(root, '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([^#=\s]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].replace(/^"(.*)"$/, '$1').trim();
}

async function gql(query, variables = {}) {
  const res = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.BUFFER_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text);
  }
  if (data.errors) throw new Error(JSON.stringify(data.errors, null, 2));
  return data.data;
}

(async () => {
  if (!process.env.BUFFER_API_KEY) {
    console.error('BUFFER_API_KEY is missing.');
    process.exit(1);
  }

  const account = await gql(`query { account { organizations { id name channelCount } } }`);
  const organizations = account?.account?.organizations || [];
  const results = [];

  for (const organization of organizations) {
    const data = await gql(
      `query Channels($input: ChannelsInput!) {
        channels(input: $input) {
          id
          name
          service
        }
      }`,
      { input: { organizationId: organization.id } }
    );

    results.push({
      organization,
      channels: data?.channels || [],
    });
  }

  console.log(JSON.stringify(results, null, 2));
})();
