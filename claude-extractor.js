<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude AI Code Extractor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .main-content {
            padding: 30px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section-title {
            font-size: 1.5rem;
            color: #2c3e50;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title::before {
            content: '';
            width: 4px;
            height: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #34495e;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e8ed;
            border-radius: 10px;
            font-size: 14px;
            transition: all 0.3s ease;
            font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 150px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .btn-secondary {
            background: #6c757d;
        }

        .btn-secondary:hover {
            box-shadow: 0 10px 20px rgba(108, 117, 125, 0.3);
        }

        .btn-danger {
            background: #dc3545;
        }

        .btn-danger:hover {
            box-shadow: 0 10px 20px rgba(220, 53, 69, 0.3);
        }

        .btn-large {
            padding: 16px 32px;
            font-size: 16px;
        }

        .loading {
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .file-item {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 15px;
            margin-bottom: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .file-item:hover {
            border-color: #667eea;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
        }

        .file-header {
            background: white;
            padding: 20px;
            border-bottom: 2px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .file-name {
            font-weight: 700;
            color: #2c3e50;
            font-size: 16px;
        }

        .file-language {
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        }

        .file-source {
            background: #28a745;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        }

        .file-content {
            padding: 20px;
            background: #2d3748;
            color: #e2e8f0;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
            max-height: 300px;
            overflow-y: auto;
            white-space: pre-wrap;
        }

        .file-actions {
            padding: 15px 20px;
            background: white;
            display: flex;
            gap: 10px;
        }

        .progress-container {
            background: #e9ecef;
            border-radius: 10px;
            height: 8px;
            margin: 10px 0;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            width: 0%;
            transition: width 0.3s ease;
        }

        .progress-text {
            font-size: 14px;
            color: #6c757d;
            margin-top: 5px;
        }

        .status-message {
            padding: 12px 20px;
            border-radius: 10px;
            margin-bottom: 10px;
            font-weight: 500;
        }

        .status-success {
            background: #d1edff;
            color: #0c5460;
            border-left: 4px solid #28a745;
        }

        .status-error {
            background: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }

        .status-info {
            background: #cce7ff;
            color: #055160;
            border-left: 4px solid #17a2b8;
        }

        .hidden {
            display: none;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .checkbox-group input[type="checkbox"] {
            width: auto;
        }

        .github-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 25px;
            border-radius: 15px;
            border: 2px solid #dee2e6;
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 15px;
            }

            .header {
                padding: 20px;
            }

            .header h1 {
                font-size: 2rem;
            }

            .main-content {
                padding: 20px;
            }

            .grid {
                grid-template-columns: 1fr;
            }

            .file-actions {
                flex-wrap: wrap;
            }
        }

        .instructions {
            background: #fff3cd;
            border: 2px solid #ffeaa7;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .instructions h3 {
            color: #856404;
            margin-bottom: 10px;
        }

        .instructions p {
            color: #856404;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Claude AI Code Extractor</h1>
            <p>Extract code and artifacts from Claude AI responses and upload directly to GitHub</p>
        </div>

        <div class="main-content">
            <div id="statusMessages"></div>

            <div class="instructions">
                <h3>📋 How to Use:</h3>
                <p>1. Copy and paste Claude AI's response containing code blocks or artifacts into the text area below<br>
                2. Click "Extract Code & Artifacts" to parse all code<br>
                3. Review and edit extracted files if needed<br>
                4. (Optional) Fill in GitHub details to create a new repository<br>
                5. Click "Create Repository & Upload Files" to publish your project</p>
            </div>

            <div class="section">
                <h2 class="section-title">📝 Paste Claude AI Output</h2>
                <div class="form-group">
                    <label for="projectName">Project Name:</label>
                    <input type="text" id="projectName" placeholder="my-awesome-project" />
                </div>
                <div class="form-group">
                    <label for="claudeOutput">Claude AI Response:</label>
                    <textarea id="claudeOutput" placeholder="Paste your Claude AI response here (including code blocks, artifacts, and explanations)..."></textarea>
                </div>
                <button class="btn btn-large" id="extractBtn" onclick="extractCode()">
                    <span id="extractBtnText">🔍 Extract Code & Artifacts</span>
                </button>
            </div>

            <div class="section">
                <h2 class="section-title">📁 Extracted Files</h2>
                <div id="extractedFiles">
                    <p style="text-align: center; color: #7f8c8d; padding: 40px 0;">
                        No files extracted yet. Paste Claude AI output above and click "Extract Code & Artifacts".
                    </p>
                </div>
            </div>

            <div class="section github-section">
                <h2 class="section-title">🐙 GitHub Upload (Optional)</h2>
                <p style="margin-bottom: 20px; color: #6c757d;">
                    Create a new GitHub repository and upload all extracted files automatically.
                </p>
                
                <div class="grid">
                    <div class="form-group">
                        <label for="githubToken">GitHub Personal Access Token:</label>
                        <input type="password" id="githubToken" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
                        <small style="color: #6c757d;">Create token at: github.com/settings/tokens</small>
                    </div>
                    <div class="form-group">
                        <label for="githubUsername">GitHub Username:</label>
                        <input type="text" id="githubUsername" placeholder="your-username" />
                    </div>
                </div>

                <div class="grid">
                    <div class="form-group">
                        <label for="repoName">Repository Name:</label>
                        <input type="text" id="repoName" placeholder="my-claude-project" />
                    </div>
                    <div class="form-group">
                        <label for="repoDescription">Repository Description:</label>
                        <input type="text" id="repoDescription" placeholder="Generated from Claude AI" />
                    </div>
                </div>

                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="createPrivateRepo" />
                        <label for="createPrivateRepo">Create as private repository</label>
                    </div>
                </div>

                <div id="uploadProgress" class="hidden">
                    <div class="progress-container">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">Preparing upload...</div>
                </div>

                <button class="btn btn-large" id="uploadBtn" onclick="uploadToGitHub()">
                    <span id="uploadBtnText">⬆️ Create Repository & Upload Files</span>
                </button>
            </div>
        </div>
    </div>

    <script>
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
                    btn.innerHTML = '🔍 Extract Code & Artifacts';
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
                /I'll create (?:a |an )?(\w+)\s+artifact.*?```(\w+)?\n([\s\S]*?)```/gi,
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
            const artifactIndicators = [
                content.includes('<!DOCTYPE html'),
                content.includes('<html'),
                content.includes('<div') && content.length > 500,
                content.includes('import React') || content.includes('import {'),
                content.includes('export default') && (content.includes('function') || content.includes('=>')),
                content.includes('useState') || content.includes('useEffect'),
                content.includes('document.') && content.length > 300,
                content.includes('addEventListener') && content.length > 200,
                content.includes('class ') && content.includes('constructor'),
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
            
            const extensions = {
                javascript: 'js', python: 'py', html: 'html', css: 'css',
                java: 'java', cpp: 'cpp', c: 'c', php: 'php', ruby: 'rb',
                go: 'go', rust: 'rs', typescript: 'ts', jsx: 'jsx', tsx: 'tsx'
            };
            
            const ext = extensions[language] || 'txt';
            return `file${index}.${ext}`;
        }

        function determineFilePath(fileName, content) {
            if (fileName.endsWith('.html')) return fileName;
            if (fileName.endsWith('.css')) return `css/${fileName}`;
            if (fileName.endsWith('.js') && !fileName.includes('script')) return `js/${fileName}`;
            if (fileName.endsWith('.jsx')) return `src/${fileName}`;
            if (fileName.endsWith('.py')) return fileName;
            if (fileName === 'package.json') return fileName;
            return fileName;
        }

        function hasNodeJSIndicators(output) {
            const indicators = ['npm install', 'require(', 'module.exports', 'express', 'node.js', 'nodejs', 'package.json', 'npm start'];
            return indicators.some(indicator => output.toLowerCase().includes(indicator.toLowerCase()));
        }

        function generatePackageJson(projectName, output) {
            const dependencies = {};
            
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
            const container =
