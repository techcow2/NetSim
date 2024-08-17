# Use an official PHP runtime as a parent image
FROM php:8.1-apache

# Install required packages and enable PHP extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    && docker-php-ext-install gd

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy your application files into the container
COPY ./ /var/www/html/

# Set the correct permissions
RUN chown -R www-data:www-data /var/www/html/

# Expose port 80
EXPOSE 80
