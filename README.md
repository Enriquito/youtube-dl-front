# Youtube-dl-front

Youtube-dl-front is a frontend for youtube-dl. With the easy interface you can download and view videos in seconds.

![Download page](https://github.com/Enriquito/youtube-dl-front/blob/master/screenshots/Download.png?raw=true)
![Download page](https://github.com/Enriquito/youtube-dl-front/blob/master/screenshots/view.png?raw=true)

## Linux / MacOS Installation

[Download](http://ytdl-org.github.io/youtube-dl/download.html) the latest `youtube-dl` version.

```bash
sudo curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl

sudo chmod a+rx /usr/local/bin/youtube-dl
```
Install Nodejs
```bash
# NodeJS installation examples

# Ubuntu
sudo apt-get install nodejs
# MacOS
brew install node
# CentOS
sudo yum install nodejs
```
Clone youtube-dl-front and install the dependencies.

```bash
git clone https://github.com/Enriquito/youtube-dl-front
cd youtube-dl-front/server
npm install
```

## Linux / MacOS Update
```bash
cd youtube-dl-front/
git pull
```
Terminate the current node process and restart with the following commands.

```bash
cd youtube-dl-front/server
node app.js
```

## Usage

Start the server with the following command.

```bash
cd youtube-dl-front/server
node app.js
```
Go in your browser to http://localhost:3000
