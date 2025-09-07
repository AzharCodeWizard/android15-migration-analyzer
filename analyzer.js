class Android15MigrationAnalyzer {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.singleFileInput = document.getElementById('singleFileInput');
        this.analysisSection = document.getElementById('analysisSection');
        this.resultsList = document.getElementById('resultsList');
        
        this.issues = [];
        this.analyzedFiles = [];
        
        this.initializeTheme();
        this.initializeEventListeners();
        this.initializeAnalysisRules();
    }

    initializeTheme() {
        // Check for saved theme preference or detect system preference
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initialTheme = savedTheme || systemTheme;
        
        this.setTheme(initialTheme);
        
        // Listen for system theme changes if no manual preference is set
        if (!savedTheme) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
        
        // Initialize theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update theme toggle button aria-label
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', 
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            );
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Add a subtle animation feedback
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 150);
        }
    }

    initializeEventListeners() {
        // File input change for folder upload
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        
        // File input change for individual files
        this.singleFileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('drag-over');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('drag-over');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });
        
        // Filter tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterResults(e.target.dataset.category);
            });
        });
    }

    initializeAnalysisRules() {
        this.analysisRules = [
            // API Level and Target SDK
            {
                id: 'target_sdk_35',
                pattern: /targetSdkVersion\s+(\d+)|targetSdk\s*=\s*(\d+)/g,
                severity: 'critical',
                title: 'Target SDK Version Check',
                description: 'Ensure your app targets Android 15 (API level 35) for full compatibility',
                checkFunction: (content, matches) => {
                    const versions = matches.map(match => parseInt(match[1] || match[2]));
                    return versions.some(v => v < 35) ? 
                        'Consider updating targetSdkVersion to 35 for Android 15 compatibility' : null;
                }
            },
            
            // Privacy and Security
            {
                id: 'photo_picker',
                pattern: /ACTION_PICK|MediaStore\.Images|MediaStore\.Video/g,
                severity: 'warning',
                title: 'Photo/Video Access Changes',
                description: 'Android 15 introduces enhanced security for partial photo and video access',
                message: 'Consider migrating to Photo Picker API for better user privacy'
            },
            
            {
                id: 'background_activity',
                pattern: /startActivity|startService.*BACKGROUND/g,
                severity: 'warning',
                title: 'Background Activity Restrictions',
                description: 'Android 15 has stricter background activity launch restrictions',
                message: 'Review background activity launches and consider using PendingIntent'
            },
            
            // Edge-to-edge enforcement
            {
                id: 'edge_to_edge',
                pattern: /WindowCompat\.setDecorFitsSystemWindows|android:fitsSystemWindows/g,
                severity: 'info',
                title: 'Edge-to-edge Enforcement',
                description: 'Android 15 enforces edge-to-edge display for apps targeting API 35+',
                message: 'Ensure proper edge-to-edge implementation'
            },
            
            // Predictive back gesture
            {
                id: 'predictive_back',
                pattern: /onBackPressed|OnBackPressedCallback/g,
                severity: 'info',
                title: 'Predictive Back Gesture',
                description: 'Update back navigation handling for improved predictive back gesture',
                message: 'Consider implementing OnBackInvokedCallback for better user experience'
            },
            
            // Notification changes
            {
                id: 'notification_changes',
                pattern: /NotificationManager|createNotificationChannel/g,
                severity: 'info',
                title: 'Notification Experience Updates',
                description: 'Android 15 introduces new notification features and behaviors',
                message: 'Review notification implementation for Android 15 enhancements'
            },
            
            // OpenJDK 17 features
            {
                id: 'java_version',
                pattern: /sourceCompatibility|targetCompatibility|JavaVersion/g,
                severity: 'warning',
                title: 'Java Version Compatibility',
                description: 'Android 15 includes OpenJDK 17 features and API updates',
                checkFunction: (content, matches) => {
                    if (content.includes('JavaVersion.VERSION_1_8') || content.includes('1.8')) {
                        return 'Consider updating to Java 17 features available in Android 15';
                    }
                    return null;
                }
            },
            
            // Camera and media
            {
                id: 'camera_api',
                pattern: /Camera2|CameraX|MediaRecorder/g,
                severity: 'info',
                title: 'Camera and Media Improvements',
                description: 'Android 15 includes camera and media performance improvements',
                message: 'Review camera implementation for potential optimizations'
            },
            
            // Dynamic performance framework
            {
                id: 'performance_hints',
                pattern: /PerformanceHintManager|PowerManager/g,
                severity: 'info',
                title: 'Dynamic Performance Framework',
                description: 'Leverage Android 15 dynamic performance framework enhancements',
                message: 'Consider implementing performance hints for better resource management'
            },
            
            // Deprecated APIs
            {
                id: 'deprecated_apis',
                pattern: /@Deprecated|\.setType\(|PackageManager\.GET_META_DATA/g,
                severity: 'warning',
                title: 'Deprecated API Usage',
                description: 'Some APIs may be deprecated or changed in Android 15',
                message: 'Review deprecated API usage and migrate to recommended alternatives'
            },
            
            // Private space
            {
                id: 'private_space',
                pattern: /PackageManager\.MATCH_HIDDEN_UNTIL_INSTALLED_COMPONENTS/g,
                severity: 'info',
                title: 'Private Space Functionality',
                description: 'Android 15 introduces private space functionality',
                message: 'Consider how private space affects app visibility and behavior'
            },

            // Notification improvements
            {
                id: 'notification_experience',
                pattern: /NotificationManager|NotificationCompat|createNotificationChannel/g,
                severity: 'info',
                title: 'Notification Experience Updates',
                description: 'Android 15 introduces new notification experience improvements',
                message: 'Review notification implementation for Android 15 enhancements'
            },

            // Storage and file access
            {
                id: 'scoped_storage',
                pattern: /Environment\.getExternalStorageDirectory|MediaStore\.Files/g,
                severity: 'warning',
                title: 'Scoped Storage Compliance',
                description: 'Ensure compliance with scoped storage requirements',
                message: 'Use MediaStore APIs or Storage Access Framework for file operations'
            },

            // Permission changes
            {
                id: 'permission_changes',
                pattern: /<uses-permission.*READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE/g,
                severity: 'warning',
                title: 'Storage Permission Changes',
                description: 'Storage permissions behavior may change in Android 15',
                message: 'Review storage permissions and consider granular photo/video permissions'
            },

            // Work profiles and enterprise
            {
                id: 'work_profile',
                pattern: /DevicePolicyManager|UserManager\.isUserAGoat/g,
                severity: 'info',
                title: 'Work Profile Enhancements',
                description: 'Android 15 includes work profile and enterprise feature updates',
                message: 'Review work profile compatibility and enterprise features'
            }
        ];
    }

    async handleFiles(files) {
        if (files.length === 0) return;
        
        this.showLoading();
        this.issues = [];
        this.analyzedFiles = [];
        
        // Filter and organize files by type
        const validFiles = Array.from(files).filter(file => this.isValidFile(file));
        const projectStructure = this.analyzeProjectStructure(validFiles);
        
        // Display project structure info
        console.log('Project Structure:', projectStructure);
        
        // Analyze each file
        for (let file of validFiles) {
            await this.analyzeFile(file);
        }
        
        // Run project-level analysis
        this.runProjectLevelAnalysis(projectStructure);
        
        this.displayResults();
        this.hideLoading();
    }

    analyzeProjectStructure(files) {
        const structure = {
            totalFiles: files.length,
            javaFiles: [],
            kotlinFiles: [],
            xmlFiles: [],
            gradleFiles: [],
            manifestFiles: [],
            folders: new Set()
        };

        files.forEach(file => {
            const path = file.webkitRelativePath || file.name;
            const folderPath = path.substring(0, path.lastIndexOf('/'));
            if (folderPath) structure.folders.add(folderPath);

            if (file.name.endsWith('.java')) {
                structure.javaFiles.push(file);
            } else if (file.name.endsWith('.kt')) {
                structure.kotlinFiles.push(file);
            } else if (file.name.endsWith('.xml')) {
                structure.xmlFiles.push(file);
                if (file.name === 'AndroidManifest.xml') {
                    structure.manifestFiles.push(file);
                }
            } else if (file.name.endsWith('.gradle')) {
                structure.gradleFiles.push(file);
            }
        });

        return structure;
    }

    runProjectLevelAnalysis(structure) {
        // Check for missing critical files
        if (structure.manifestFiles.length === 0) {
            this.issues.push({
                id: 'missing_manifest',
                severity: 'critical',
                title: 'Missing AndroidManifest.xml',
                description: 'No AndroidManifest.xml file found in the project',
                file: 'Project Structure',
                line: 0,
                message: 'AndroidManifest.xml is required for Android applications'
            });
        }

        if (structure.gradleFiles.length === 0) {
            this.issues.push({
                id: 'missing_gradle',
                severity: 'warning',
                title: 'No Gradle files found',
                description: 'No build.gradle files found in the project',
                file: 'Project Structure',
                line: 0,
                message: 'Gradle build files are recommended for Android projects'
            });
        }

        // Check project size and complexity
        if (structure.totalFiles > 100) {
            this.issues.push({
                id: 'large_project',
                severity: 'info',
                title: 'Large Project Detected',
                description: `Project contains ${structure.totalFiles} files`,
                file: 'Project Structure',
                line: 0,
                message: 'Consider modularizing large projects for better maintainability'
            });
        }
    }

    isValidFile(file) {
        const validExtensions = ['.java', '.kt', '.xml', '.gradle', '.json'];
        return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    }

    async analyzeFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                this.analyzedFiles.push(file.name);
                
                this.analysisRules.forEach(rule => {
                    const matches = [...content.matchAll(rule.pattern)];
                    if (matches.length > 0) {
                        let message = rule.message;
                        
                        if (rule.checkFunction) {
                            const customMessage = rule.checkFunction(content, matches);
                            if (customMessage) {
                                message = customMessage;
                            } else {
                                return; // Skip if check function returns null
                            }
                        }
                        
                        this.issues.push({
                            id: rule.id,
                            severity: rule.severity,
                            title: rule.title,
                            description: rule.description,
                            message: message,
                            file: file.name,
                            matches: matches.length
                        });
                    }
                });
                
                resolve();
            };
            reader.readAsText(file);
        });
    }

    displayResults() {
        // Update stats
        document.getElementById('issueCount').textContent = this.issues.length;
        document.getElementById('fileCount').textContent = this.analyzedFiles.length;
        
        // Calculate compatibility score based on issue severity
        const criticalIssues = this.issues.filter(i => i.severity === 'critical').length;
        const warningIssues = this.issues.filter(i => i.severity === 'warning').length;
        const infoIssues = this.issues.filter(i => i.severity === 'info').length;
        
        // More sophisticated scoring algorithm
        const maxScore = 100;
        const criticalPenalty = criticalIssues * 25;
        const warningPenalty = warningIssues * 10;
        const infoPenalty = infoIssues * 2;
        
        const score = Math.max(0, maxScore - criticalPenalty - warningPenalty - infoPenalty);
        document.getElementById('compatibilityScore').textContent = `${score}%`;
        
        // Update compatibility score color based on score
        const scoreElement = document.getElementById('compatibilityScore');
        const scoreCard = scoreElement.closest('.stat-card');
        if (score >= 80) {
            scoreCard.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        } else if (score >= 60) {
            scoreCard.style.background = 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
        } else {
            scoreCard.style.background = 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)';
        }
        
        // Show analysis section
        this.analysisSection.style.display = 'block';
        
        // Display issues
        this.renderIssues(this.issues);
        
        // Smooth scroll to results
        this.analysisSection.scrollIntoView({ behavior: 'smooth' });
    }

    renderIssues(issues) {
        this.resultsList.innerHTML = '';
        
        if (issues.length === 0) {
            this.resultsList.innerHTML = `
                <div class="result-item">
                    <div class="result-header">
                        <i class="fas fa-check-circle" style="color: #28a745;"></i>
                        <h4 class="result-title">No Issues Found</h4>
                    </div>
                    <p class="result-description">
                        Great! No immediate Android 15 compatibility issues were detected in your uploaded files. 
                        However, make sure to test thoroughly and review the migration guide below.
                    </p>
                </div>
            `;
            return;
        }
        
        issues.forEach(issue => {
            const issueElement = document.createElement('div');
            issueElement.className = `result-item ${issue.severity}`;
            issueElement.innerHTML = `
                <div class="result-header">
                    <span class="severity-badge ${issue.severity}">${issue.severity}</span>
                    <h4 class="result-title">${issue.title}</h4>
                </div>
                <p class="result-description">${issue.description}</p>
                <p><strong>Recommendation:</strong> ${issue.message}</p>
                <div class="result-file">📁 ${issue.file} (${issue.matches} occurrence${issue.matches > 1 ? 's' : ''})</div>
            `;
            this.resultsList.appendChild(issueElement);
        });
    }

    filterResults(category) {
        if (category === 'all') {
            this.renderIssues(this.issues);
        } else {
            const filteredIssues = this.issues.filter(issue => issue.severity === category);
            this.renderIssues(filteredIssues);
        }
    }

    showLoading() {
        let loading = document.querySelector('.loading');
        if (!loading) {
            loading = document.createElement('div');
            loading.className = 'loading';
            loading.innerHTML = `
                <div class="spinner"></div>
                <p>Analyzing your files for Android 15 compatibility...</p>
            `;
            this.analysisSection.appendChild(loading);
        }
        loading.style.display = 'block';
    }

    hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

// Initialize the analyzer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Android15MigrationAnalyzer();
});

// Add some demo functionality for better user experience
document.addEventListener('DOMContentLoaded', () => {
    // Add demo button
    const uploadSection = document.querySelector('.upload-section');
    const demoButton = document.createElement('button');
    demoButton.className = 'btn-primary';
    demoButton.style.marginLeft = '10px';
    demoButton.textContent = 'Try Demo';
    demoButton.onclick = runDemo;
    
    const browseButton = document.querySelector('.upload-area button');
    browseButton.parentNode.insertBefore(demoButton, browseButton.nextSibling);
});

function runDemo() {
    const analyzer = new Android15MigrationAnalyzer();
    
    // Simulate demo data
    const demoIssues = [
        {
            id: 'target_sdk_35',
            severity: 'critical',
            title: 'Target SDK Version Check',
            description: 'Ensure your app targets Android 15 (API level 35) for full compatibility',
            message: 'Consider updating targetSdkVersion to 35 for Android 15 compatibility',
            file: 'build.gradle',
            matches: 1
        },
        {
            id: 'photo_picker',
            severity: 'warning',
            title: 'Photo/Video Access Changes',
            description: 'Android 15 introduces enhanced security for partial photo and video access',
            message: 'Consider migrating to Photo Picker API for better user privacy',
            file: 'MainActivity.java',
            matches: 2
        },
        {
            id: 'edge_to_edge',
            severity: 'info',
            title: 'Edge-to-edge Enforcement',
            description: 'Android 15 enforces edge-to-edge display for apps targeting API 35+',
            message: 'Ensure proper edge-to-edge implementation',
            file: 'activity_main.xml',
            matches: 1
        }
    ];
    
    analyzer.issues = demoIssues;
    analyzer.analyzedFiles = ['build.gradle', 'MainActivity.java', 'activity_main.xml'];
    analyzer.displayResults();
}
