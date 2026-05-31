#!/usr/bin/env bash

node dist/main.js &
npx prisma db push
wait
