#!/bin/bash
pm2 start ./server/app.js
http-server ./web/dist -p 80