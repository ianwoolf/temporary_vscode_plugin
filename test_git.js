const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testGitCommands() {
    const workspacePath = '/Users/ianwoolf/code/ai/vscode_plugin';

    try {
        console.log('🔍 Testing Git commands in:', workspacePath);
        console.log('='.repeat(50));

        // Test 1: Current branch
        console.log('\n1️⃣ Testing: git rev-parse --abbrev-ref HEAD');
        const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', {
            cwd: workspacePath
        });
        console.log('✓ Current branch:', branch.trim());

        // Test 2: Diff with main
        console.log('\n2️⃣ Testing: git diff main...HEAD');
        try {
            const { stdout: diff } = await execAsync('git diff main...HEAD', {
                cwd: workspacePath,
                maxBuffer: 10 * 1024 * 1024
            });
            console.log('✓ Diff found:', diff.length, 'characters');
            if (diff.length > 0) {
                console.log('Preview (first 200 chars):', diff.substring(0, 200));
            } else {
                console.log('⚠️  No diff found between current branch and main');
            }
        } catch (diffError) {
            console.log('❌ Diff command failed:', diffError.message);
        }

        // Test 3: Alternative diff
        console.log('\n3️⃣ Testing: git diff main');
        try {
            const { stdout: diff2 } = await execAsync('git diff main', {
                cwd: workspacePath,
                maxBuffer: 10 * 1024 * 1024
            });
            console.log('✓ Diff (git diff main):', diff2.length, 'characters');
            console.log('Preview:', diff2.substring(0, 200));
        } catch (diffError2) {
            console.log('❌ Alternative diff failed:', diffError2.message);
        }

        // Test 4: Changed files
        console.log('\n4️⃣ Testing: git diff --name-only main...HEAD');
        try {
            const { stdout: files } = await execAsync('git diff --name-only main...HEAD', {
                cwd: workspacePath
            });
            const fileList = files.trim().split('\n').filter(f => f.length > 0);
            console.log('✓ Changed files:', fileList.length);
            if (fileList.length > 0) {
                console.log('Files:', fileList);
            } else {
                console.log('⚠️  No changed files');
            }
        } catch (filesError) {
            console.log('❌ Changed files command failed:', filesError.message);
        }

        // Test 5: Fetch and try again
        console.log('\n5️⃣ Testing: git fetch origin main:main');
        try {
            await execAsync('git fetch origin main:main', {
                cwd: workspacePath
            });
            console.log('✓ Fetch successful');

            console.log('\n6️⃣ Testing: git diff main...HEAD (after fetch)');
            const { stdout: diffAfterFetch } = await execAsync('git diff main...HEAD', {
                cwd: workspacePath,
                maxBuffer: 10 * 1024 * 1024
            });
            console.log('✓ Diff after fetch:', diffAfterFetch.length, 'characters');
            if (diffAfterFetch.length > 0) {
                console.log('Preview:', diffAfterFetch.substring(0, 200));
            } else {
                console.log('⚠️  Still no diff after fetch');
            }
        } catch (fetchError) {
            console.log('⚠️  Fetch failed (this is ok if no remote):', fetchError.message);
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ Debugging complete!');

        // Recommendations
        console.log('\n💡 Recommendations:');
        console.log('1. If no diff found: Make some changes and commit them to the current branch');
        console.log('2. Check if target branch exists: git branch -a');
        console.log('3. Try different target branch in settings');
        console.log('4. Check VSCode developer console for error logs');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testGitCommands();
