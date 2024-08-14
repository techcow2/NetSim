# Use the official PHP Apache image as a base
FROM php:apache

# Install required packages
RUN apt-get update && \
    apt-get install -y \
    git \
    wget \
    curl

# Clone the repository directly into the container
RUN git clone https://github.com/techcow2/netsim.git /var/www/html/

# Set working directory
WORKDIR /var/www/html/

# Modify the api_proxy.php file to use environment variables for API keys
RUN sed -i "s/\$openrouter_api_key2 = 'YOUR_OPENROUTER_API_KEY';/\$openrouter_api_key2 = getenv('OPENROUTER_API_KEY_2') ?: 'fallback-api-key-2';/" /var/www/html/api_proxy.php && \
    sed -i "s/\$openrouter_api_key = 'YOUR_OPENROUTER_API_KEY';/\$openrouter_api_key = getenv('OPENROUTER_API_KEY_1') ?: 'fallback-api-key-1';/" /var/www/html/api_proxy.php

# Create a PHP file to expose the Pixabay API key as a JavaScript variable with correct MIME type
RUN echo "<?php header('Content-Type: application/javascript'); ?>" > /var/www/html/env.js.php && \
    echo "<?php echo 'const PIXABAY_API_KEY = \"'.getenv('PIXABAY_API_KEY').'\";'; ?>" >> /var/www/html/env.js.php

# Modify script.js to use the environment variable for the Pixabay API key
RUN sed -i "s/const apiKey = 'YOUR_PIXABAY_API_KEY';/const apiKey = PIXABAY_API_KEY;/" /var/www/html/script.js

# Modify index.html to include env.js.php as a JavaScript file before script.js
RUN sed -i "s|<script src=\"script.js\"></script>|<script src=\"env.js.php\"></script>\n<script src=\"script.js\"></script>|" /var/www/html/index.html

# Set up health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD curl --fail http://localhost:80 || exit 1

# Expose port 80 to the outside world
EXPOSE 80

# Start Apache server in the foreground
CMD ["apache2-foreground"]
