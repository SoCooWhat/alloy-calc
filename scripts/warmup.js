#!/usr/bin/env node

const routes = [
  '/',
  '/dashboard',
  '/login',
  '/materials',
  '/accessories',
  '/customers',
  '/templates',
  '/templates/create',
  '/orders',
  '/system',
];

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function warmupRoute(route) {
  try {
    const response = await fetch(`${BASE_URL}${route}`, {
      method: 'HEAD',
      headers: {
        'Accept': 'text/html',
      },
    });

    if (response.ok) {
      console.log(`✓ ${route}`);
    } else {
      console.log(`⚠ ${route} (${response.status})`);
    }
  } catch (error) {
    console.log(`✗ ${route} - ${error.message}`);
  }
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔥 Warming up routes...\n');

  // 等待服务器启动
  console.log('Waiting for server to be ready...');
  await wait(2000);

  // 预热所有路由
  const promises = routes.map(warmupRoute);
  await Promise.all(promises);

  console.log('\n✨ All routes warmed up! Pages should load instantly now.');
}

main().catch(console.error);
