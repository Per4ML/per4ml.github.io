#! /usr/bin/env bash

tmpdir="$(mktemp -d)"
if [ ! -d "$tmpdir" ] ; then
  echo "Unable to create temporary directory"
  exit 1
fi

echo "Generating site in $tmpdir"

echo "git switch main"

echo "Moving site here"
echo "mv $tmpdir/* ."
rm -rf "$tmpdir"

echo "git add *"
echo "git commit -m \"site update\""
echo "git push"
echo "done"

