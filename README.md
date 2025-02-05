# Discord Project
#### Alireza Sadeghi | 9927913 | Final Project

## Overview
The Discord Clone Voice Channels is a platform that allows users to join voice channels without requiring login or user management. Users can listen to ongoing conversations in these channels or participate in them by speaking. The main focus of this platform is on real-time audio communication with a low-latency, smooth experience.

## Features
1. Create Voice Channels
    - Users can create multiple voice channels that others can join to communicate.

2. Join Voice Channels
    - Users can join any available voice channel and listen to ongoing conversations, or they can speak themselves.

3. Leave Voice Channels
    - Users can leave any voice channel at any time.

4. Simultaneous Audio Communication
    - All users in a voice channel can talk or listen to others in real-time without interruption. The connection should be stable with minimal delay.

5. Display Active Users
    - Users present in each voice channel are shown in a list, including indicators to show who is talking.

6. Talking Indicator
    - A visual indicator (a green circle) around a user's profile to show that they are currently speaking.

7. Mute/Unmute Users
    - Users in the channel can be muted or unmuted by others, allowing for more control over the conversation.

## Installation
### Prerequisites
  * Node.js (v16.0 or higher)
  * MongoDB instance (for database)
  * Git (for cloning the repository)

### Steps
1. Clone the repository:
```shell
git clone https://github.com/alireza-sadeghii/discord-clone.git
```

2. Install the dependencies: Navigate into the project directory and install the necessary packages :
```shell
cd discord-clone
npm install
```

3. Set up environment variables: Create a .env file in the root of the project and add the following:
```
PORT=3000
MONGO_URI=mongodb+srv://your_mongodb_connection_string
```

4. Start the server:
```
npm start
```

## Usage
1. Create a Voice Channel: Once you open the platform, you will see an option to create a new voice channel. Give the channel a name and press the "Create" button.

2. Join a Voice Channel: Click on any available voice channel, and you will be connected to it. You can start listening or talking immediately.

3. Mute/Unmute Yourself: While in a voice channel, you can toggle your microphone on or off using the provided button.

4. See Active Users: Users currently in the channel are displayed in a list, along with the talking indicator if they are speaking.

5. Leave the Channel: At any time, you can leave the voice channel by clicking the "Leave" button.

## Technologies Used
  * Frontend: HTML, CSS, JavaScript
  * Backend: Node.js, Express.js
  * Database: MongoDB (for storing messages data)
  * WebRTC: For real-time audio communication
  * WebSockets: For real-time interaction between users

## Architecture
This project uses a client-server architecture where the frontend communicates with the backend via WebSockets. The backend handles WebRTC signaling for peer-to-peer communication between users in a voice channel.

## Screenshots
![Landing](https://drive.google.com/uc?export=view&id=19JmduHpAUiKn4fOE28V5o1sE1tjUBwWD)
![Home](https://drive.google.com/uc?export=view&id=19sHe96Z7EGYZpnsJCsxgWblA6KlAKEiY)
![About Us](https://drive.google.com/uc?export=view&id=1l4RN2HFV6kTwUWS4ZQh_Fv7tKCcmLeiv)
![FAQ](https://drive.google.com/uc?export=view&id=19b2zZ763EimJ3_eXZU9WW9AoSptESbWw)
![Main](https://drive.google.com/uc?export=view&id=1s48EqluPWiv5BIgfr9FqzbzvC3iLQSeC)
