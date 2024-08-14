<p align="center">
    <img src="https://github.com/user-attachments/assets/4053266e-b5a7-4499-9b1b-185e3455fc89" alt="logo" width="200" />
</p>

# 🎱 **NetSim - AI Powered Simulations**

## Overview

**NetSim** is an AI-powered web application designed to generate highly interactive and detailed web simulations based on user descriptions. Utilizing state-of-the-art AI models, NetSim creates rich, immersive web experiences that are fully functional and customizable. This repository contains the source code for the NetSim project, including the front-end interface, API proxy script, and necessary configuration files.

## 🌟 **Features**

- **🚀 Instant Web Generation:** Create interactive web applications or websites by simply entering a description.
- **🖼️ Integrated Pixabay Images:** Automatically include high-quality images from Pixabay in your generated simulations to enhance visual appeal.
- **🖥️ Interactive Simulated Browser:** Experience your generated web content within a simulated browser environment.
- **✏️ Element Editing:** Modify specific elements of your simulation with easy-to-use right-click options.
- **🔖 Bookmarking and Publishing:** Save your work with bookmarks, publish your simulations, and share them with others.
- **🔄 Model Selection:** Choose from different AI models to tailor the generation process to your needs.

## 🔗 **Demo**

Check out the live demo of NetSim at [NetSim.xyz](https://netsim.xyz).

## 🎥 **Video Demonstration**

<a href="https://youtu.be/UocxijcquD4">
    <img src="https://img.youtube.com/vi/UocxijcquD4/maxresdefault.jpg" alt="NetSim Demo Video" width="400" />
</a>

## 🛠️ **Getting Started**

### Prerequisites

To run this project locally, you will need:

- A web server capable of running PHP (e.g., Apache, Nginx).
- An API key from [OpenRouter](https://openrouter.ai) to power the AI models used in the simulations.
- An API key from [Pixabay](https://pixabay.com/api/docs/) for fetching images.
- A modern web browser (Google Chrome, Firefox, etc.).

### Installation

#### Option 1: Manual Installation

1. **Clone the Repository:**

   Clone the repository to your local machine using Git:

   ```bash
   git clone https://github.com/yourusername/netsim.git
   cd netsim
   ```

2. **Configure API Keys:**

   The project requires API keys to interact with the OpenRouter API and Pixabay. To configure the script with your API keys:

   - **Open the `api_proxy.php` file:**
     - Replace the placeholder values `YOUR_OPENROUTER_API_KEY` with your actual API keys in the following lines:
       - `$openrouter_api_key2 = 'YOUR_OPENROUTER_API_KEY';`
       - `$openrouter_api_key = 'YOUR_OPENROUTER_API_KEY';`
     
     Example:
     ```php
     $openrouter_api_key2 = 'your-actual-api-key-1';
     $openrouter_api_key = 'your-actual-api-key-2';
     ```

   - **Open the `script.js` file:**
     - Replace the placeholder `'YOUR_PIXABAY_API_KEY'` in the `fetchPixabayImages` function with your actual Pixabay API key:

     Example:
     ```javascript
     const apiKey = 'your-actual-api-key';
     ```

   - **Optional: Change the Website URL for Publishing:**
     - If you need to change the base URL used for publishing simulations:
       - In the `api_proxy.php` file, locate the following lines:
         
         ```php
         'HTTP-Referer: https://YOUR_WEBSITE_HERE.com',
         ...
         $baseUrl = 'https://YOUR_WEBSITE_HERE.com';
         ```

       - Replace `YOUR_WEBSITE_HERE` with your actual domain:

       Example:
       ```php
       'HTTP-Referer: https://example.com',
       ...
       $baseUrl = 'https://example.com';
       ```

   - **Save the Files:**
     - Save the changes to your `api_proxy.php` and `script.js` files.

3. **Set Up a Local Server:**

   If you're using PHP's built-in server, navigate to the project directory and run:

   ```bash
   php -S localhost:8000
   ```

   Alternatively, configure your preferred web server (Apache, Nginx) to serve the project directory.

4. **Access NetSim:**

   Open your web browser and navigate to `http://localhost:8000` (or the appropriate URL if using a different server setup) to start using NetSim.

#### Option 2: Docker Installation

1. **Build the Docker Image:**

   Navigate to the project directory and build the Docker image:

   ```bash
   docker build -t netsim .
   ```

2. **Run the Docker Container:**

   Run the Docker container with the necessary environment variables for the API keys:

   ```bash
   docker run -d -p 8088:80 -e OPENROUTER_API_KEY_1=your-actual-api-key-1 -e OPENROUTER_API_KEY_2=your-actual-api-key-2 -e PIXABAY_API_KEY=your-actual-api-key netsim
   ```

3. **Access NetSim:**

   Open your web browser and navigate to `http://localhost:8088` to start using NetSim.

## 🔧 **Usage**

1. **Creating Simulations:**

   - Enter a description of the web application or website you want to create in the address bar.
   - Press "Create" or hit Enter to generate your simulation.

2. **Editing Simulations:**

   - Right-click on elements within the simulation to modify them. Use the editor to update content or styles as needed.

3. **Saving and Publishing:**

   - Bookmark your simulations for later access.
   - Publish simulations to generate a shareable link.

4. **Model Selection:**

   - Use the model selection tool in the toolbar to choose different AI models, such as `Claude 3.5 Sonnet` or `GPT-4o`, depending on your needs.

## 🗃️ **Data Storage and Persistence**

All data within NetSim, including your simulations, bookmarks, and history, is stored in your local browser's storage. This means:

- **📦 Local Storage:** Everything you create or save is stored in your browser's local storage. This data persists across sessions as long as your browser's cache and history are intact.
- **⚠️ Data Loss:** If you clear your browser's cache or history, all stored data, including simulations, bookmarks, and project history, will be permanently lost. Make sure to export or back up important simulations if you plan to clear your browser data.

## 🔒 **Security Considerations**

- **🔑 Protecting API Keys:**
  - Ensure that your server is secure and that access to the `api_proxy.php` file is restricted to prevent unauthorized use.

- **🔐 HTTPS:**
  - Use HTTPS to encrypt all data transmitted between the client and server, including API keys and other sensitive information.

- **⏱️ Rate Limiting:**
  - The script includes a rate limiting function to prevent abuse. Ensure that this is configured correctly to protect your resources.

## 📝 **To-Do List**

- **Fix the revision history feature:** Improve the functionality to properly track and manage different versions of simulations.
- **Provide different examples using other models:** Create and document simulations generated using various AI models to showcase the capabilities of each model.
- **Add a public showcase for recently published apps.

## 🤝 **Contributing**

Contributions are welcome! If you have suggestions for new features or improvements, feel free to submit a pull request or open an issue.

### **Join the Community**

Share your projects, get feedback, and engage with other NetSim users on the [NetSim subreddit](https://www.reddit.com/r/NetSim/). It's a place to share projects made on [NetSim.xyz](https://netsim.xyz) and discuss ideas, issues, and enhancements.

## ☕ **Support This Project**

If you find NetSim helpful and would like to support its development, consider buying me a coffee!

<p align="center">
    <a href="https://ko-fi.com/techrayappsllc" target="_blank">
        <img src="https://cdn.ko-fi.com/cdn/kofi3.png?v=3" alt="Buy Me A Coffee" width="200" />
    </a>
</p>

## 📄 **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 🙏 **Credits**

Special thanks to the following contributors:

- **u/peeDDemon_au** for providing the Dockerfile for this project.
