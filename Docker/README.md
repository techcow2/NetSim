# Docker instructions

## Building the image

run the following inside the Docker directory

```bash
docker build -t netsim .
```

## Run the container

once built, to launch the app inside the container run (set the -p XXXXX:80 to any port number you that is free on your docker host)

```bash
docker run -d -p 43751:80 -e OPENROUTER_API_KEY_1=<YOUR_OPENROUTER_API_KEY> -e OPENROUTER_API_KEY_2=<YOUR_OPENROUTER_API_KEY> -e PIXABAY_API_KEY=<YOUR_PIXABAY_API_KEY> netsim:latest

```

## Access the app

then open your browser to

[http://localhost:43751/](http://localhost:43751/)