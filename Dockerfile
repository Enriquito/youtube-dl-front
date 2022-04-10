FROM node:16.14.2-alpine3.14 AS build

WORKDIR /

# Install dependicies
ENV APK_ADD="git curl python2 python3 g++ make"
RUN apk add --no-cache ${APK_ADD}

# Install vue/cli to build the frontend.
RUN npm install -g @vue/cli

# Clone when working in the master branch
# RUN git clone https://github.com/Enriquito/youtube-dl-front

# Clone when working in the development branch
RUN git clone -b dev https://github.com/Enriquito/youtube-dl-front.git

# Install the modules for the server
WORKDIR /youtube-dl-front/server
RUN npm install

# Build the frontend
WORKDIR /youtube-dl-front/web
RUN npm install
RUN npm run build

# Remove the node_module folder as it is no longer needed.
RUN rm -rf /youtube-dl-front/web/node_modules

FROM node:16.14.2-alpine3.14

WORKDIR /

# Install youtube-dl dependicies
ENV APK_ADD="ffmpeg python2 curl"
RUN apk add --no-cache ${APK_ADD}

# Copy run script
COPY run.sh ./run.sh

# Download youtube-dl and make it executable.
RUN curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
RUN chmod a+rx /usr/local/bin/youtube-dl

# Copy the youtube-dl-front files from the build layer.
COPY --from=build /youtube-dl-front /youtube-dl-front

# Setup port, volume and entrypoint script
EXPOSE 3000
VOLUME ["/youtube-dl-front/server/videos"]
ENTRYPOINT [ "/run.sh" ]