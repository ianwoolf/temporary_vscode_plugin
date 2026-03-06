const GitDiffProvider = require('./gitDiffProvider');

async function test() {
    try {
        const provider = new GitDiffProvider();

        console.log('Testing GitDiffProvider...');

        // Test 1: Get current branch
        const currentBranch = await provider.getCurrentBranch();
        console.log('✓ Current branch:', currentBranch);

        // Test 2: Get diff with main
        console.log('\nGetting diff with main...');
        const diff = await provider.getDiff('main');
        console.log('✓ Diff size:', diff.length, 'characters');
        console.log('Diff preview:', diff.substring(0, 200));

        // Test 3: Get changed files
        const files = await provider.getChangedFiles('main');
        console.log('✓ Changed files:', files);

        console.log('\n✅ All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

test();
