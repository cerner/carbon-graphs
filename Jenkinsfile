def genericsh(cmd) {
    if (isUnix()) {
        sh cmd
    }
    else {
        bat cmd
    }
}

pipeline {
    agent any
    environment {
        CI = "true"
    }
    stages {
        stage("Install") {
            steps {
                script {
                    genericsh "npm install"
                }
            }
        }
        stage("Lint") {
            steps {
                script {
                    genericsh "npm run lint"
                }
            }
        }
        stage("Test") {
            steps {
                script {
                     genericsh "npm run test"
                }
            }
        }
        stage("Build:Lib") {
            steps {
                script {
                    genericsh "npm run build"
                }
            }
        }
		stage("Build:Dist") {
            steps {
                script {
                    genericsh "npm run build"
                }
            }
        }
    }
}
