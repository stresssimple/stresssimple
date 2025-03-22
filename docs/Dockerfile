# Use the official Python image as the base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Expose the port mkdocs will run on
EXPOSE 8000

# Command to run mkdocs
CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000", "-f", "docs/mkdocs.yml"]