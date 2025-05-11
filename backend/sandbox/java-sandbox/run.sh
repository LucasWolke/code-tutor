#!/bin/bash
set -eo pipefail

# compile (10s) → stderr goes to Docker’s logs
timeout 10s javac Main.java

# run (5s) → stderr goes to Docker’s logs
timeout  5s java Main