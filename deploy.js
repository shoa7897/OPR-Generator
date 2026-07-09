import admin from 'firebase-admin';
import fs from 'fs';

admin.initializeApp({
  projectId: 'dappled-equator-cpsvl'
});

const rules = fs.readFileSync('firestore.rules', 'utf8');
const project = 'dappled-equator-cpsvl';

async function deploy() {
  try {
    const ruleset = await admin.securityRules().createRuleset({
      source: {
        files: [
          {
            name: 'firestore.rules',
            content: rules
          }
        ]
      }
    });
    console.log('Ruleset created:', ruleset.name);
    await admin.securityRules().createRelease({
      name: `projects/${project}/releases/cloud.firestore`,
      rulesetName: ruleset.name
    });
    console.log('Rules deployed!');
  } catch(e) {
    console.error('Failed to deploy rules:', e);
  }
}

deploy();
