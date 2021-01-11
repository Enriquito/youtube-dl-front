#!/bin/bash

# Install latsest youtube-dl
curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
chmod a+rx /usr/local/bin/youtube-dl

# Check if database file exists
if [ ! -f "/youtube-dl-front/config/database.json" ];
then
    echo "Creating database file"
    echo "{\"videos\":[],\"downloads\":[]}" >> "/youtube-dl-front/config/database.json"
fi

# Check if settings file exists
if [ ! -f "/youtube-dl-front/config/settings.json" ];
then
    echo "Creating settings file"
    echo "{\"port\": 3000,\"defaultQuality\": \"720p\",\"outputLocation\": \"./videos\"}" >> "/youtube-dl-front/config/settings.json"
fi

# Change to the server directory and run the application
cd /youtube-dl-front/server
node app.js
