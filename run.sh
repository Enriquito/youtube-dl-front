#!/bin/bash

# Install latsest youtube-dl
curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
chmod a+rx /usr/local/bin/youtube-dl

# Change to the server directory and run the application
cd /youtube-dl-front/server
node app.js
