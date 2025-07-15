/**
 * 构建脚本
 * 用于打包Chrome插件，排除测试文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

// 发布文件列表
const releaseFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'icon.png'
];

// 发布目录
const releaseDir = '../release';

function build() {
  console.log('🔨 开始构建Chrome插件...\n');
  
  // 创建发布目录
  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
    console.log('📁 创建发布目录');
  }
  
  // 复制发布文件
  let copiedCount = 0;
  releaseFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const targetPath = path.join(__dirname, releaseDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`📄 复制: ${file}`);
      copiedCount++;
    } else {
      console.log(`⚠️  文件不存在: ${file}`);
    }
  });
  
  console.log(`\n✅ 构建完成！复制了 ${copiedCount} 个文件到 ${releaseDir} 目录`);
  console.log('📦 发布文件已准备就绪，测试文件已被排除');
  
  // 显示发布目录内容
  console.log('\n📋 发布目录内容:');
  const releaseDirFiles = fs.readdirSync(releaseDir);
  releaseDirFiles.forEach(file => {
    const stats = fs.statSync(path.join(releaseDir, file));
    const size = (stats.size / 1024).toFixed(2);
    console.log(`  ${file} (${size} KB)`);
  });
}

function clean() {
  console.log('🧹 清理发布目录...');
  
  if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
    console.log('✅ 发布目录已清理');
  } else {
    console.log('📁 发布目录不存在，无需清理');
  }
}

function test() {
  console.log('🧪 运行测试...\n');
  
  try {
    execSync('node tests/run-tests.js', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('\n✅ 测试通过，可以继续构建');
  } catch (error) {
    console.log('\n❌ 测试失败，请修复问题后重试');
    process.exit(1);
  }
}

function zipRelease() {
  const zipPath = path.join(__dirname, 'release.zip');
  const releasePath = path.join(__dirname, releaseDir);
  if (!fs.existsSync(releasePath)) {
    console.log('❌ release 目录不存在，请先运行 build');
    process.exit(1);
  }
  // 创建输出流
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  output.on('close', function() {
    console.log(`\n✅ 打包完成，生成 ${zipPath} (${(archive.pointer()/1024).toFixed(2)} KB)`);
  });
  archive.on('error', function(err) {
    throw err;
  });
  archive.pipe(output);
  archive.directory(releasePath + '/', false);
  archive.finalize();
}

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'build':
    build();
    break;
  case 'clean':
    clean();
    break;
  case 'test':
    test();
    break;
  case 'build:test':
    test();
    build();
    break;
  case 'build:zip':
    build();
    zipRelease();
    break;
  case 'zip':
    zipRelease();
    break;
  default:
    console.log('🔨 Chrome插件构建工具');
    console.log('');
    console.log('使用方法:');
    console.log('  node build.js build      - 构建发布文件');
    console.log('  node build.js clean      - 清理发布目录');
    console.log('  node build.js test       - 运行测试');
    console.log('  node build.js build:test - 运行测试后构建');
    console.log('  node build.js build:zip  - 构建并打包为zip');
    console.log('  node build.js zip        - 仅打包release为zip');
    console.log('');
    console.log('注意: 构建时会自动排除 tests/ 目录中的测试文件');
} 