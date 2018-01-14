#!/bin/sh

ENV=$1

case $env in
    daily )
    ;;
    pre )
    ;;
    production )
    ;;
    dev )
    ;;
    * )
    # 默认为日常
    ENV="production"
    ;;
esac

execFile=`dirname $0`/`readlink $0`

## 获取到framework的路径
if [ "${0:0:1}" = "/" ]; then
  BASE=$(dirname `dirname $execFile`)
else
  BASE=$(dirname `pwd`/`dirname $execFile`)
fi

echo "base-framework dir: $BASE , env: $ENV"
cd $BASE

if [ -f ./config/config_${ENV}.js ]; then
  cp config/config_${ENV}.js config/config.js
fi

