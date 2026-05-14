import * as fs from 'fs';
import * as path from 'path';

const MFE_NAME = 'AppointmentsMFE';
const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'mini-apps', MFE_NAME);
const TARGET_DIR = path.join(ROOT, 'exports', `${MFE_NAME}_Standalone`);

function copyDir(src: string, dest: string) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log(`Creating standalone export for ${MFE_NAME}...`);

// 1. Prepare target directory
if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TARGET_DIR, { recursive: true });

// 2. Copy the MFE folder
copyDir(SOURCE_DIR, TARGET_DIR);

// 3. Copy essential external dependencies
const externalDir = path.join(TARGET_DIR, 'external');
fs.mkdirSync(externalDir, { recursive: true });

console.log('Copying external dependencies...');
fs.copyFileSync(path.join(ROOT, 'api_contract', 'appointment.ts'), path.join(externalDir, 'appointment_contract.ts'));

const externalComponents = path.join(externalDir, 'components');
fs.mkdirSync(externalComponents, { recursive: true });
fs.copyFileSync(path.join(ROOT, 'mini-apps', 'PatientMFE', 'components', 'modals', 'ConfirmationModal.tsx'), path.join(externalComponents, 'ConfirmationModal.tsx'));

const externalServices = path.join(externalDir, 'services');
fs.mkdirSync(externalServices, { recursive: true });
fs.copyFileSync(path.join(ROOT, 'mini-apps', 'PatientMFE', 'services', 'authService.ts'), path.join(externalServices, 'authService.ts'));

// 4. Fix imports
console.log('Fixing internal paths...');
function walk(dir: string, callback: (filePath: string) => void) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath, callback);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            callback(filePath);
        }
    }
}

walk(TARGET_DIR, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Calculate relative path to internal 'external' directory
    const relToRoot = path.relative(path.dirname(filePath), TARGET_DIR) || '.';
    const extRef = relToRoot.startsWith('..') ? relToRoot : `./${relToRoot}`;

    content = content.replace(/\.\.\/\.\.\/api_contract\/appointment/g, `${extRef}/external/appointment_contract`);
    content = content.replace(/\.\.\/\.\.\/PatientMFE\/services\/authService/g, `${extRef}/external/services/authService`);
    content = content.replace(/\.\.\/\.\.\/PatientMFE\/components\/modals\/ConfirmationModal/g, `${extRef}/external/components/ConfirmationModal`);
    
    fs.writeFileSync(filePath, content);
});

// 5. Create package.json
const packageJson = {
  name: `@careplus/${MFE_NAME.toLowerCase()}`,
  version: '1.0.0',
  description: 'Standalone Appointments Micro-Frontend',
  main: 'index.tsx',
  dependencies: {
    'react': '^18.0.0',
    'react-dom': '^18.0.0',
    'framer-motion': '^11.0.0',
    'lucide-react': 'latest'
  }
};
fs.writeFileSync(path.join(TARGET_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));

console.log(`Export complete! Ready in: ${TARGET_DIR}`);
