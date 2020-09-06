# youtube-dl-front

youtube-dl-front is a frontend for youtube-dl. With the easy interface you can download and view videos in seconds.

## Linux / MacOS Installation

[Download](http://ytdl-org.github.io/youtube-dl/download.html) the latest youtube-dl version.

```bash
sudo curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl

sudo chmod a+rx /usr/local/bin/youtube-dl
```
Install Nodejs
```bash
sudo apt-get install nodejs
```
Clone youtube-dl-front and install the dependencies.

```bash
git clone https://github.com/Enriquito/youtube-dl-front
cd ~/youtube-dl-front/server
npm install
```

## Usage

Start the server with the following command.

```bash
cd ~/youtube-dl-front/server
node app.js
```
Go in your browser to http://localhost:3000
