// amazonq-ignore-next-lineconst fs = require('fs');
const path = require('path');

function setupEnvironment() {
  try {
    const envExample = path.join(process.cwd(), '.env.example');
    const envFile = path.join(process.cwd(), '.env');
    // amazonq-ignore-next-line

    if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, envFile);
      console.log('✅ Created .env file from .env.example');
    }

    // Create reports directory
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      fs.mkdirSync(path.join(reportsDir, 'screenshots'), { recursive: true });
      console.log('✅ Created reports directory');
    }

    console.log('🚀 Environment setup completed!');
  } catch (error) {
    console.error('❌ Environment setup failed:', error.message);
    process.exit(1);
  }
}

setupEnvironment();
