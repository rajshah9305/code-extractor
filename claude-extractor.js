let extractedFiles = [];

// Enhanced code extraction functionality
function extractCode() {
    const output = document.getElementById('claudeOutput').value;
    const projectName = document.getElementById('projectName').value || 'claude-extracted-project';
    
    if (!output.trim()) {
        showStatus('Please paste Claude AI output first.', 'error');
        return;
    }
    
    const btn = document.getElementById('extractBtnText');
    btn.innerHTML = '<div class="loading"></div>Extracting...';
    
    setTimeout(() => {
        try {
            extractedFiles = parseClaudeOutput(output, projectName);
            displayExtractedFiles();
            showStatus(`Successfully extracted ${extractedFiles.length} files!`, 'success');
        } catch (error) {
            showStatus(`Error extracting code: ${error.message}`, 'error');
            console.error('Extraction error:', error);
        } finally {
            btn.innerHTML = 'Extract Code & Artifacts';
        }
    }, 500);
}

function parseClaudeOutput(output, projectName) {
    const files = [];
    let fileIndex = 1;
    
    console.log('Starting extraction process...');
    
    // First, extract artifacts (priority)
    const artifactFiles = extractClaudeArtifacts(output, fileIndex);
    files.push(...artifactFiles);
    fileIndex += artifactFiles.length;
    console.log(`Extracted ${artifactFiles.length} artifacts`);
    
    // Then extract regular code blocks
    const codeBlockFiles = extractCodeBlocks(output, fileIndex);
    files.push(...codeBlockFiles);
    fileIndex += codeBlockFiles.length;
    console.log(`Extracted ${codeBlockFiles.length} code blocks`);
    
    // Add package.json if it seems like a Node.js project
    if (hasNodeJSIndicators(output) && !files.some(f => f.name === 'package.json')) {
        files.unshift(generatePackageJson(projectName, output));
    }
    
    // Add README.md if not already present
    if (!files.some(f => f.name.toLowerCase().includes('readme'))) {
        files.push(generateReadme(projectName, output, files));
    }
    
    console.log(`Total files extracted: ${files.length}`);
    return files;
}

function extractClaudeArtifacts(output, startIndex) {
    const artifactFiles = [];
    let fileIndex = startIndex;
    
    // Pattern 1: Look for artifact function calls (new format)
    const artifactCallRegex = /<function_calls>[\s\S]*?<invoke name="artifacts">([\s\S]*?)<\/antml:invoke>[\s\S]*?<\/antml:function_calls>/g;
    let callMatch;
    
    while ((callMatch = artifactCallRegex.exec(output)) !== null) {
        const artifactContent = callMatch[1];
        
        // Extract type and content from artifact parameters
        const typeMatch = artifactContent.match(/<parameter name="type">(.*?)<\/antml:parameter>/);
        const contentMatch = artifactContent.match(/<parameter name="content">([\s\S]*?)<\/antml:parameter>/);
        const titleMatch = artifactContent.match(/<parameter name="title">(.*?)<\/antml:parameter>/);
        
        if (contentMatch && contentMatch[1].trim()) {
            const type = typeMatch ? typeMatch[1] : 'text';
            const title = titleMatch ? titleMatch[1] : '';
            const content = contentMatch[1].trim();
            const fileName = generateArtifactFileName(type, title, fileIndex);
            
            artifactFiles.push({
                name: fileName,
                content: content,
                language: mapArtifactTypeToLanguage(type),
                path: determineFilePath(fileName, content),
                source: 'claude-artifact',
                description: title
            });
            fileIndex++;
        }
    }
    
    console.log(`Found ${artifactFiles.length} Claude artifacts using new format`);
    
    // Pattern 2: Look for legacy artifact patterns (backup)
    const legacyPatterns = [
        // "I'll create a [type] artifact"
        /I'll create (?:a |an )?(\w+)\s+artifact.*?```(\w+)?\n([\s\S]*?)```/gi,
        // "Here's a [type] component/application"
        /Here's (?:a |an )?(\w+)\s+(?:component|application|tool|page).*?```(\w+)?\n([\s\S]*?)```/gi
    ];
    
    legacyPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(output)) !== null) {
            const type = match[1].toLowerCase();
            const language = match[2] || type;
            const content = match[3].trim();
            
            if (content.length > 50 && !isDuplicateContent(content, artifactFiles)) {
                const fileName = generateArtifactFileName(type, '', fileIndex);
                artifactFiles.push({
                    name: fileName,
                    content: content,
                    language: language,
                    path: determineFilePath(fileName, content),
                    source: 'legacy-artifact'
                });
                fileIndex++;
            }
        }
    });
    
    // Pattern 3: Look for standalone HTML/React/JS content that looks like artifacts
    const standalonePatterns = [
        { name: 'HTML', pattern: /```html\n([\s\S]*?)```/g, extension: 'html', language: 'html' },
        { name: 'React', pattern: /```(?:jsx|react)\n([\s\S]*?)```/g, extension: 'jsx', language: 'jsx' },
        { name: 'JavaScript', pattern: /```(?:javascript|js)\n([\s\S]*?)```/g, extension: 'js', language: 'javascript' }
    ];
    
    standalonePatterns.forEach(patternObj => {
        let match;
        while ((match = patternObj.pattern.exec(output)) !== null) {
            const content = match[1].trim();
            if (content.length > 200 && !isDuplicateContent(content, artifactFiles)) {
                // Check if this looks like a substantial application/component
                if (isLikelyArtifact(content, patternObj.name.toLowerCase())) {
                    const fileName = `${patternObj.name.toLowerCase()}-component-${fileIndex}.${patternObj.extension}`;
                    artifactFiles.push({
                        name: fileName,
                        content: content,
                        language: patternObj.language,
                        path: determineFilePath(fileName, content),
                        source: 'standalone-artifact'
                    });
                    fileIndex++;
                }
            }
        }
    });
    
    return artifactFiles;
}

function extractCodeBlocks(output, startIndex) {
    const codeFiles = [];
    let fileIndex = startIndex;
    
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(output)) !== null) {
        const language = match[1] || 'text';
        const content = match[2].trim();
        
        if (content && content.length > 20 && !isDuplicateContent(content, codeFiles)) {
            // Skip if this looks like it was already captured as an artifact
            if (!isLikelyArtifact(content, language)) {
                const fileName = generateFileName(content, language, fileIndex);
                codeFiles.push({
                    name: fileName,
                    content: content,
                    language: language,
                    path: determineFilePath(fileName, content),
                    source: 'code-block'
                });
                fileIndex++;
            }
        }
    }
    
    return codeFiles;
}

function mapArtifactTypeToLanguage(type) {
    const typeMap = {
        'text/html': 'html',
        'application/vnd.ant.react': 'jsx',
        'application/vnd.ant.code': 'javascript',
        'text/markdown': 'markdown',
        'image/svg+xml': 'svg',
        'application/vnd.ant.mermaid': 'mermaid'
    };
    return typeMap[type] || type.split('/').pop() || 'text';
}

function isLikelyArtifact(content, language) {
    // Check if content looks like a substantial application/component
    const artifactIndicators = [
        // HTML indicators
        content.includes('<!DOCTYPE html'),
        content.includes('<html'),
        content.includes('<div') && content.length > 500,
        // React indicators
        content.includes('import React') || content.includes('import {'),
        content.includes('export default') && (content.includes('function') || content.includes('=>')),
        content.includes('useState') || content.includes('useEffect'),
        // JavaScript app indicators
        content.includes('document.') && content.length > 300,
        content.includes('addEventListener') && content.length > 200,
        content.includes('class ') && content.includes('constructor'),
        // CSS indicators for substantial stylesheets
        language === 'css' && content.length > 1000
    ];
    return artifactIndicators.some(indicator => indicator);
}

function generateArtifactFileName(type, description, index) {
    let baseName = '';
    if (description) {
        baseName = description.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 30);
    }
    
    const typeMap = {
        'html': { ext: 'html', prefix: baseName || 'page' },
        'text/html': { ext: 'html', prefix: baseName || 'page' },
        'react': { ext: 'jsx', prefix: baseName || 'component' },
        'application/vnd.ant.react': { ext: 'jsx', prefix: baseName || 'component' },
        'jsx': { ext: 'jsx', prefix: baseName || 'component' },
        'javascript': { ext: 'js', prefix: baseName || 'script' },
        'application/vnd.ant.code': { ext: 'js', prefix: baseName || 'script' },
        'python': { ext: 'py', prefix: baseName || 'main' },
        'css': { ext: 'css', prefix: baseName || 'styles' },
        'markdown': { ext: 'md', prefix: baseName || 'document' },
        'text/markdown': { ext: 'md', prefix: baseName || 'document' },
        'json': { ext: 'json', prefix: baseName || 'data' },
        'svg': { ext: 'svg', prefix: baseName || 'image' },
        'image/svg+xml': { ext: 'svg', prefix: baseName || 'image' }
    };
    
    const typeInfo = typeMap[type] || { ext: 'txt', prefix: baseName || 'file' };
    return `${typeInfo.prefix}${index > 1 ? `-${index}` : ''}.${typeInfo.ext}`;
}

function isDuplicateContent(content, existingFiles) {
    const contentHash = content.trim().substring(0, 100);
    return existingFiles.some(file => file.content.trim().substring(0, 100) === contentHash);
}

function generateFileName(content, language, index) {
    // Try to detect file type from content
    if (content.includes('<!DOCTYPE html') || content.includes('<html')) {
        return `index${index > 1 ? `-${index}` : ''}.html`;
    }
    if (content.includes('package.json') || content.includes('"name":')) {
        return 'package.json';
    }
    if (content.includes('function') && language === 'javascript') {
        return `script${index}.js`;
    }
    if (content.includes('def ') && language === 'python') {
        return `main${index}.py`;
    }
    if (content.includes('class ') && language === 'java') {
        return `Main${index}.java`;
    }
    if (content.includes('#include') && language === 'cpp') {
        return `main${index}.cpp`;
    }
    
    // Default naming based on language
    const extensions = {
        javascript: 'js',
        python: 'py',
        html: 'html',
        css: 'css',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        php: 'php',
        ruby: 'rb',
        go: 'go',
        rust: 'rs',
        typescript: 'ts',
        jsx: 'jsx',
        tsx: 'tsx'
    };
    
    const ext = extensions[language] || 'txt';
    return `file${index}.${ext}`;
}

function determineFilePath(fileName, content) {
    // Determine appropriate directory structure
    if (fileName.endsWith('.html')) return fileName;
    if (fileName.endsWith('.css')) return `css/${fileName}`;
    if (fileName.endsWith('.js') && !fileName.includes('script')) return `js/${fileName}`;
    if (fileName.endsWith('.jsx')) return `src/${fileName}`;
    if (fileName.endsWith('.py')) return fileName;
    if (fileName === 'package.json') return fileName;
    return fileName;
}

function hasNodeJSIndicators(output) {
    const indicators = [
        'npm install',
        'require(',
        'module.exports',
        'express',
        'node.js',
        'nodejs',
        'package.json',
        'npm start'
    ];
    return indicators.some(indicator => 
        output.toLowerCase().includes(indicator.toLowerCase()));
}

function generatePackageJson(projectName, output) {
    const dependencies = {};
    
    // Detect common dependencies
    if (output.includes('express')) dependencies.express = '^4.18.0';
    if (output.includes('react')) dependencies.react = '^18.0.0';
    if (output.includes('axios')) dependencies.axios = '^1.0.0';
    if (output.includes('mongoose')) dependencies.mongoose = '^7.0.0';
    
    const packageJson = {
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: 'Project generated from Claude AI output',
        main: 'index.js',
        scripts: {
            start: 'node index.js',
            dev: 'nodemon index.js'
        },
        dependencies: Object.keys(dependencies).length > 0 ? dependencies : { express: '^4.18.0' },
        keywords: ['ai-generated', 'claude'],
        author: '',
        license: 'MIT'
    };
    
    return {
        name: 'package.json',
        content: JSON.stringify(packageJson, null, 2),
        language: 'json',
        path: 'package.json',
        source: 'generated'
    };
}

function generateReadme(projectName, output, files) {
    let readme = `# ${projectName}\n\n`;
    readme += `This project was generated from Claude AI output.\n\n`;
    readme += `## Files\n\n`;
    
    files.forEach(file => {
        if (file.name !== 'README.md') {
            readme += `- **${file.name}** - ${file.language} file${file.source ? ` (${file.source})` : ''}\n`;
        }
    });
    
    readme += `\n## Installation\n\n`;
    if (files.some(f => f.name === 'package.json')) {
        readme += `\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n\n`;
    }
    
    readme += `## Usage\n\nRefer to individual files for specific usage instructions.\n\n`;
    readme += `---\n*Generated by Claude Code Extractor*`;
    
    return {
        name: 'README.md',
        content: readme,
        language: 'markdown',
        path: 'README.md',
        source: 'generated'
    };
}

function displayExtractedFiles() {
    const container = document.getElementById('extractedFiles');
    
    if (extractedFiles.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No code blocks found in the input.</p>';
        return;
    }
    
    let html = '';
    extractedFiles.forEach((file, index) => {
        html += `
            <div class="file-item">
                <div class="file-header">
                    <div>
                        <span class="file-name">${file.name}</span>
                        <span class="file-language">${file.language}</span>
                        ${file.source ? `<span class="file-source">${file.source}</span>` : ''}
                    </div>
                </div>
                <div class="file-content">${escapeHtml(file.content)}</div>
                <div class="file-actions">
                    <button class="btn btn-secondary" onclick="editFile(${index})">Edit</button>
                    <button class="btn btn-secondary" onclick="downloadFile(${index})">Download</button>
                    <button class="btn btn-danger" onclick="removeFile(${index})">Remove</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function editFile(index) {
    const file = extractedFiles[index];
    const newContent = prompt(`Edit ${file.name}:`, file.content);
    if (newContent !== null) {
        extractedFiles[index].content = newContent;
        displayExtractedFiles();
        showStatus(`Updated ${file.name}`, 'success');
    }
}

function downloadFile(index) {
    const file = extractedFiles[index];
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
}

function removeFile(index) {
    if (confirm(`Remove ${extractedFiles[index].name}?`)) {
        extractedFiles.splice(index, 1);
        displayExtractedFiles();
        showStatus('File removed', 'info');
    }
}

async function uploadToGitHub() {
    const token = document.getElementById('githubToken').value;
    const username = document.getElementById('githubUsername').value;
    const repoName = document.getElementById('repoName').value;
    const description = document.getElementById('repoDescription').value;
    const isPrivate = document.getElementById('createPrivateRepo').checked;
    
    if (!token || !username || !repoName) {
        showStatus('Please fill in GitHub token, username, and repository name.', 'error');
        return;
    }
    
    if (extractedFiles.length === 0) {
        showStatus('No files to upload. Extract code first.', 'error');
        return;
    }
    
    const uploadBtn = document.getElementById('uploadBtnText');
    uploadBtn.innerHTML = '<div class="loading"></div>Uploading...';
    document.getElementById('uploadBtn').disabled = true;
    
    showUploadProgress(0, 'Creating repository...');
    
    try {
        // Create repository
        await createGitHubRepo(token, username, repoName, description, isPrivate);
        showUploadProgress(30, 'Repository created! Uploading files...');
        
        // Upload files
        for (let i = 0; i < extractedFiles.length; i++) {
            const file = extractedFiles[i];
            await uploadFileToGitHub(token, username, repoName, file);
            const progress = 30 + ((i + 1) / extractedFiles.length) * 70;
            showUploadProgress(progress, `Uploaded ${file.name}...`);
        }
        
        showUploadProgress(100, 'Upload complete!');
        showStatus(`Successfully uploaded to https://github.com/${username}/${repoName}`, 'success');
        
    } catch (error) {
        showStatus(`Upload failed: ${error.message}`, 'error');
    } finally {
        uploadBtn.innerHTML = 'Create Repository & Upload Files';
        document.getElementById('uploadBtn').disabled = false;
    }
}

async function createGitHubRepo(token, username, repoName, description, isPrivate) {
    const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: repoName,
            description: description,
            private: isPrivate
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create repository: ${errorData.message}`);
    }
}

async function uploadFileToGitHub(token, username, repoName, file) {
    const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${file.path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Add ${file.name}`,
            content: btoa(file.content)
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to upload ${file.name}: ${errorData.message}`);
    }
}

function showUploadProgress(percentage, message) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const uploadProgress = document.getElementById('uploadProgress');
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = message;
    uploadProgress.classList.remove('hidden');
}

function showStatus(message, type) {
    const statusMessages = document.getElementById('statusMessages');
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message status-${type}`;
    statusDiv.textContent = message;
    statusMessages.appendChild(statusDiv);
    
    // Remove the status message after 5 seconds
    setTimeout(() => {
        if (statusMessages.contains(statusDiv)) {
            statusMessages.removeChild(statusDiv);
        }
    }, 5000);
}
