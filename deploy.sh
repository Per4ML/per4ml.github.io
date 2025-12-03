#! /usr/bin/env bash

print_usage() {
  echo "
Usage: $0 [args]

Args are optional and are (currently) intended for website deployment

Args: [ -d | --deploy ] Remove non-deployment files, meant for deployment
      [ -h | --help   ] Display this help message
"
  [ -n "$1" ] && echo "* Unknown argument $1"
  exit 0
}

for arg in "$@" ; do
  shift
  case "${arg}" in
    -d|--deploy|deploy  ) set -- "$@" "-d"        ;;
    -h|--help  |help    ) set -- "$@" "-h"        ;;
    *                   ) print_usage "$arg" >&2  ;;
    #--* ) set -- "$@" "-${arg:2:1}" ;;
    #-*  ) set -- "$@" "$arg"        ;;
    #*   ) set -- "$@" "-${arg:0:1}" ;;
  esac
done

while getopts dh opt ; do
  case "${opt}" in
    d ) deploy=1    ;;
    * ) print_usage ;;
  esac
done

set -e
python3 updatehtml.py
set +e

find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 711 {} \;

if [ -n "$deploy" ] ; then
  rm -rf *.in *.py contents/ "$0"
else
  chmod 755 "$0"
fi

