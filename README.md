# Youtube-dl-front

Youtube-dl-front is a frontend for youtube-dl. With the easy interface you can download and view videos in seconds.

![Download page](https://raw.githubusercontent.com/Enriquito/youtube-dl-front/master/screenshots/home.png)
![Download page](https://github.com/Enriquito/youtube-dl-front/blob/master/screenshots/view.png?raw=true)

## Installation methods

### Docker
To run youtube-dl-front in docker run the following command in your docker environment.
```bash
docker run -d -v </your/video/path>:/youtube-dl-front/server/videos -p 3000:3000 --name ydlf  enriquek/youtube-dl-front
```

### Linux / MacOS

[Download](http://ytdl-org.github.io/youtube-dl/download.html) the latest `youtube-dl` version. (Do note that you need python installed on your system)

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
## Usage

Start the server with the following command.

```bash
cd youtube-dl-front/server
node app.js
```
Go in your browser to http://localhost:3000

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
