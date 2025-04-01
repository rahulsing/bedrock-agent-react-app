# AWS Bedrock Agent Chat Application

A React-based chat application that demonstrates integration with AWS Bedrock Agent. This application provides a user interface for interacting with AWS Bedrock Agents through a chat interface.

## Features

- Real-time chat interface with AWS Bedrock Agent
- Markdown support for agent responses
- Clean and responsive design
- AWS Amplify integration for AWS services
- Environment-based configuration

## Prerequisites

Before you begin, ensure you have:

- Node.js (v14 or later)
- npm (v6 or later)
- An AWS account with access to:
  - AWS Bedrock
  - AWS Bedrock Agent
  - AWS IAM for necessary permissions

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_AWS_REGION=your-aws-region
REACT_APP_AGENT_ID=your-agent-id
REACT_APP_AGENT_ALIAS_ID=your-agent-alias-id
```
- Configure the creds


## Installation
1. Clone the repository:
```
git clone https://github.com/your-username/bedrock-agent-chat.git
cd bedrock-agent-chat
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

The application will be available at http://localhost:3000

## Project Structure
```
bedrock-agent-chat/
├── public/
├── src/
│   ├── components/
│   │   └── Chat/
│   ├── App.js
│   ├── App.css
│   ├── config.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## Dependencies
Key dependencies include:

- @aws-sdk/client-bedrock-agent-runtime: ^3.775.0
- aws-amplify: ^6.0.0
- react: ^19.0.0
- react-markdown: ^10.1.0

## Available Scripts
In the project directory, you can run:
```
npm start
```

Runs the app in development mode.

Open http://localhost:3000 to view it in your browser.

```
npm test
```

Launches the test runner in interactive watch mode.
```
npm run build
```

Builds the app for production to the build folder.

## AWS Configuration
1. Create a Bedrock Agent in AWS Console
2. Note down the Agent ID and Agent Alias ID
3. Configure IAM permissions for Bedrock Agent access
4. Update the ```.env``` file with your configuration

### IAM Permissions
Ensure your AWS user/role has the following permissions:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeAgent"
            ],
            "Resource": "arn:aws:bedrock:*:*:agent/*"
        }
    ]
}
```
 
## Usage
1. Start the application
2. Type your message in the chat input
3. Press Enter or click Send to interact with the Bedrock Agent
4. View the agent's response in the chat 