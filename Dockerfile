FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Now, copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# The command to run the application
CMD [ "npm", "run", "dev" ]