FROM node:current-alpine
WORKDIR /

# Copy run script
COPY run.sh /run.sh

# Install dependencies
ENV APK_ADD="git bash curl ffmpeg python2"
RUN apk add --no-cache ${APK_ADD}
RUN curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
RUN chmod a+rx /usr/local/bin/youtube-dl
RUN git clone https://github.com/Enriquito/youtube-dl-front

# Clone when working in the development branch
#RUN git clone -b development https://github.com/Enriquito/youtube-dl-front.git
WORKDIR /youtube-dl-front/server
RUN npm install

# Setup ports and volumes (volume tbd), startup script
EXPOSE 3000
VOLUME ["/youtube-dl-front/server/videos"]
VOLUME ["/youtube-dl-front/config"]
ENTRYPOINT [ "/run.sh" ]