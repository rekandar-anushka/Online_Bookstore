pipeline {
  agent any
  tools {
    nodejs "NodeJS"
  }
  stages {
    stage('Clone') {
      steps {
        git credentialsId: 'github-token', url: 'https://github.com/your-username/your-repo.git'
      }
    }
    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    stage('Deploy') {
      steps {
        echo 'Deployment logic here'
      }
    }
  }
}
