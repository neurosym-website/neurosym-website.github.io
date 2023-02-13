#!/bin/bash

cd $(dirname $0)

git pull origin master
sudo bash refresh.sh