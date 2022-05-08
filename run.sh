#!/bin/sh

# Install latsest youtube-dl
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Change to the server directory and run the application
cd /youtube-dl-front/server
node app.js
