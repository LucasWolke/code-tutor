FROM openjdk:17-slim

# create non-root user
RUN useradd -m sandbox

# ensure /sandbox exists and is owned by sandbox
RUN mkdir -p /sandbox && chown sandbox:sandbox /sandbox

WORKDIR /sandbox

# copy the runner script
COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh

USER sandbox

ENTRYPOINT ["run.sh"]
