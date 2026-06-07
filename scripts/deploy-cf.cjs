const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Load environment variables from .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    // Remove comments
    const cleanedLine = line.split('#')[0].trim();
    if (!cleanedLine) return;
    const [key, ...valueParts] = cleanedLine.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const PROJECT_NAME = 'rubik-3bld';
const CUSTOM_DOMAIN = 'rubik-3bld.toilacube.io.vn';
const APPS_DEV_SUBDOMAIN = `${PROJECT_NAME}.pages.dev`;

if (!ACCOUNT_ID || !API_TOKEN) {
  console.error('Error: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set in .env or environment.');
  process.exit(1);
}

// Helper for fetch Cloudflare API
async function cfApi(endpoint, options = {}) {
  const url = `https://api.cloudflare.com/client/v4${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.errors?.[0]?.message || `HTTP error ${response.status}`);
  }
  return data;
}

async function main() {
  try {
    // 2. Build the project
    console.log('Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed successfully.');

    // 3. Ensure Pages project exists
    console.log(`Ensuring Pages project "${PROJECT_NAME}" exists...`);
    try {
      await cfApi(`/accounts/${ACCOUNT_ID}/pages/projects`, {
        method: 'POST',
        body: JSON.stringify({
          name: PROJECT_NAME,
          production_branch: 'main',
        }),
      });
      console.log(`Created Pages project "${PROJECT_NAME}".`);
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`Pages project "${PROJECT_NAME}" already exists.`);
      } else {
        console.warn(`Warning: Could not verify/create Pages project: ${error.message}`);
      }
    }

    // 4. Deploy to Cloudflare Pages
    console.log(`Deploying to Cloudflare Pages project "${PROJECT_NAME}"...`);
    // Pass the CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to wrangler command env
    execSync(`npx wrangler pages deploy dist --project-name=${PROJECT_NAME} --branch=main --commit-dirty=true`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID,
        CLOUDFLARE_API_TOKEN: API_TOKEN,
      }
    });
    console.log('Deployment to Pages completed.');

    // 4. Configure Custom Domain in Pages project
    console.log(`Configuring custom domain "${CUSTOM_DOMAIN}" on Pages project...`);
    try {
      await cfApi(`/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/domains`, {
        method: 'POST',
        body: JSON.stringify({ name: CUSTOM_DOMAIN }),
      });
      console.log(`Successfully added custom domain "${CUSTOM_DOMAIN}" to Pages project.`);
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`Custom domain "${CUSTOM_DOMAIN}" is already configured on Pages.`);
      } else {
        console.warn(`Warning: Failed to add custom domain to Pages: ${error.message}`);
      }
    }

    // 5. Setup DNS CNAME Record automatically if zone exists
    const zoneName = 'toilacube.io.vn';
    console.log(`Checking if DNS zone "${zoneName}" is managed on this Cloudflare account...`);
    try {
      const zoneData = await cfApi(`/zones?name=${zoneName}`);
      const zone = zoneData.result?.[0];

      if (zone) {
        const zoneId = zone.id;
        console.log(`Found zone ID ${zoneId} for "${zoneName}".`);

        // Check if CNAME record already exists
        const dnsData = await cfApi(`/zones/${zoneId}/dns_records?name=${CUSTOM_DOMAIN}&type=CNAME`);
        const existingRecord = dnsData.result?.[0];

        const dnsPayload = {
          type: 'CNAME',
          name: 'rubik-3bld',
          content: APPS_DEV_SUBDOMAIN,
          ttl: 1, // Auto
          proxied: true, // Cloudflare proxy enabled
        };

        if (existingRecord) {
          console.log(`CNAME record for "${CUSTOM_DOMAIN}" already exists. Updating it...`);
          await cfApi(`/zones/${zoneId}/dns_records/${existingRecord.id}`, {
            method: 'PUT',
            body: JSON.stringify(dnsPayload),
          });
          console.log('DNS record updated.');
        } else {
          console.log(`Creating CNAME record for "${CUSTOM_DOMAIN}" -> "${APPS_DEV_SUBDOMAIN}"...`);
          await cfApi(`/zones/${zoneId}/dns_records`, {
            method: 'POST',
            body: JSON.stringify(dnsPayload),
          });
          console.log('DNS record created.');
        }
      } else {
        console.log(`DNS zone "${zoneName}" not found on this Cloudflare account.`);
        console.log(`Please make sure you have added a CNAME record manually:\n  Name: rubik-3bld\n  Target: ${APPS_DEV_SUBDOMAIN}\n  Proxy status: Proxied (Orange-clouded)`);
      }
    } catch (error) {
      console.warn(`Warning: Failed to auto-configure DNS: ${error.message}`);
      console.log(`Please make sure you have added a CNAME record manually:\n  Name: rubik-3bld\n  Target: ${APPS_DEV_SUBDOMAIN}\n  Proxy status: Proxied (Orange-clouded)`);
    }

    console.log('\nDeployment finished successfully! 🎉');
    console.log(`URL: https://${CUSTOM_DOMAIN}`);

  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

main();
