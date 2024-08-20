let history = [];
let currentSimulation = '';
let currentProjectId = '';
let cachedPages = {};
let currentModel = 'claude-3.5-sonnet';
let isEditMode = false;
let currentEditElement = null;
let editMenuVisible = false;
let lastUserInput = '';

const loadingTexts = [
    "Brewing some digital magic...",
    "Assembling pixels with care...",
    "Feeding hamsters to power the server...",
    "Consulting the digital oracle...",
    "Reticulating splines...",
    "Generating witty loading messages...",
    "Proving P=NP...",
    "Dividing by zero...",
    "Spinning up the flux capacitor...",
    "Untangling the world wide web..."
];

function checkRateLimit(action, limit, timeFrame) {
    const now = Date.now();
    const actionKey = `rateLimit_${action}`;
    const storedData = JSON.parse(sessionStorage.getItem(actionKey) || '[]');
    
    
    const validData = storedData.filter(timestamp => now - timestamp < timeFrame);
    
    if (validData.length >= limit) {
        return false; 
    }
    
    
    validData.push(now);
    sessionStorage.setItem(actionKey, JSON.stringify(validData));
    return true; 
}
function clearInputAndSetPlaceholder() {
    document.getElementById('addressbar').value = '';
    document.getElementById('addressbar').placeholder = "Enter text here to update or make changes to your project";
}

function initializeApp() {
    goHome();
    document.getElementById('addressbar').addEventListener('click', toggleRevisions);
    document.getElementById('addressbar').addEventListener('focus', toggleRevisions);
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#addressbar-container')) {
            hideRevisions();
        }
        if (!event.target.closest('#model-select-container')) {
            hideModelOptions();
        }
        if (!event.target.closest('#bookmarks-panel') && !event.target.closest('.btn[onclick="toggleBookmarks()"]')) {
            hideBookmarks();
        }
    });
    document.getElementById('addressbar').setAttribute('autocomplete', 'off');
    updateModelSelection();
    
    document.getElementById('modal-close').onclick = function() {
        document.getElementById('modal').style.display = "none";
    }
    
    document.getElementById('copy-url').onclick = function() {
        const urlInput = document.getElementById('generated-url');
        urlInput.select();
        document.execCommand('copy');
        alert('URL copied to clipboard!');
    }
    
    document.getElementById('open-url').onclick = function() {
        const url = document.getElementById('generated-url').value;
        window.open(url, '_blank');
    }

    // Ensure the bookmarks panel hides on outside clicks
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#bookmarks-panel') && !event.target.closest('.btn[onclick="toggleBookmarks()"]')) {
            hideBookmarks();
        }
    });

    ldb.get('netsim_history', function(value) {
        history = JSON.parse(LZString.decompressFromUTF16(value) || '[]');
    });

    const frame = document.getElementById('simulation-frame');
    if (frame && frame.contentDocument) {
        frame.contentDocument.addEventListener('contextmenu', handleRightClick);
        frame.contentDocument.addEventListener('click', handleLeftClick);
    }
}


function showLoadingOverlay() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div id="loading-overlay">
            <div id="loading-spinner"></div>
            <div id="loading-text">${getRandomLoadingText()}</div>
        </div>
    `;
    startLoadingTextAnimation();
}

function getRandomLoadingText() {
    return loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
}

function startLoadingTextAnimation() {
    const loadingText = document.getElementById('loading-text');
    setInterval(() => {
        loadingText.textContent = getRandomLoadingText();
    }, 3000);
}

function updateStatusBar(message) {
    const maxLength = 50; // Adjust this based on your design needs
    if (message.length > maxLength) {
        message = message.substring(0, maxLength) + '...';
    }
    document.getElementById('status-message').textContent = message;
}

function updatePageTitle(title) {
    const maxLength = 20;
    if (title.length > maxLength) {
        title = title.substring(0, maxLength) + '...';
    }
    document.getElementById('page-title').textContent = title;
}


function updateAddressBar(text) {
    document.getElementById('addressbar').value = text;
}

async function fetchPixabayImages(query, count = 5) {
    const apiKey = 'YOUR_PIXABAY_API';
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${count}&image_type=vector,illustration`;

    try {
        const response = await axios.get(url);

        return response.data.hits.map(image => ({
            url: image.webformatURL,
            alt: image.tags || query
        }));
    } catch (error) {
        console.error('Error fetching images from Pixabay:', error);
        return [];
    }
}

async function handleAddressBarSubmit() {
    const input = document.getElementById('addressbar').value;
    if (input.trim() === '') return;

    if (currentSimulation && isEditMode) {
        await continueSimulation(input);
    } else {
        await loadPage(input);
    }
}

async function loadPage(input) {
    if (!checkRateLimit('loadPage', 10, 60000)) { 
        alert("You've made too many requests. Please wait a moment before trying again.");
        return;
    }

    showLoadingOverlay();
    updateStatusBar("Creating web application...");

    try {
        const images = await fetchPixabayImages(input);
        const imageData = JSON.stringify(images);

        const response = await axios.post('api_proxy.php', {
            messages: [
                {
                    role: "system",
                    content: `You are an expert web developer and UI/UX designer tasked with creating extraordinarily realistic, detailed, and fully functional web applications or websites based on user descriptions. Your goal is to produce complete, interactive, and highly engaging representations of requested web content using cutting-edge web technologies, your own creativity and best practices.

Key requirements:

1. Generate only the code needed to create the requested web application,website virtual environment, game, or any other requested environment. Do not include any explanations, markdown formatting, or code block indicators.
2. The generated code should be ready to be inserted directly into the 'content' div of the simulated browser.
3. Use Tailwind CSS classes for styling. Include the Tailwind CSS CDN link in the HTML.
4. Implement a complete UI with navigation, main content area, and other relevant sections, ensuring a professional and modern design.
5. Add subtle animations and transitions to enhance user experience, using libraries like GSAP when appropriate.
6. Include error handling and form validation where appropriate.
7. Simulate API calls and data persistence where relevant using JavaScript, considering the use of libraries like Axios for HTTP requests.
8. Implement accessibility features for better usability, following WCAG guidelines.
9. If the request involves 3D graphics or virtual environments, utilize Three.js to create immersive experiences.Include 3D elements when requested, even if they are complex.
10. For data visualization, use D3.js or Chart.js to create stunning and interactive charts.
10. For complex UI components, leverage libraries like React, Vue.js, or Svelte, including them via CDN if necessary.
12. Implement responsive design using Tailwind CSS classes, ensuring the application looks great on all device sizes.
13. Use modern JavaScript features and APIs, such as async/await, Promises, and the Fetch API for asynchronous operations.
14. Utilize Web Components for creating reusable UI elements when appropriate.
15. Implement progressive enhancement techniques to ensure basic functionality even if JavaScript is disabled.
16. Use Web Workers for computationally intensive tasks to keep the main thread responsive.
17. Use, but don't limit yourself to semantic HTML5 elements to improve structure and accessibility.
18. Generate high-quality, detailed content for the application, including realistic text, placeholder images, and dummy data where appropriate.
19. Ensure all links within the generated simulations work and take the user to the appropriate page or part of the app. These linked pages should also be generated on the fly.

20. There is no limit to the creativity, the type of code used, or the libraries used to produce the code for the generated simulations. The results should always aim to be of the highest quality, never aiming for simple generations but rather highly interactive, fully working, and complete generations.
21. Use only the provided Pixabay images for static content. Each image object contains a 'url' and 'alt' property. Use these properties to add relevant images to the generated content.
22 For interactive elements or custom visuals that require specific designs (like game elements, custom UI components, etc.), create these using code (SVG, Canvas, WebGL) or appropriate libraries rather than relying on static images.
23 Do not use placeholder comments. Always generate the full, working code.

Your primary objective is to create a fully functional, creative, visually appealing, and highly detailed web application or website that matches the user's description. Pay meticulous attention to both the visual design and the underlying functionality. The result should be a rich, engaging, and realistic web experience that could pass for a genuine, professionally developed web application. Never be afraid to add your own creative additions to the simulation. It's critical that every single generation is full of content, is interactive and has a rich, immersive UI.

Again, be creative and innovative in your approach. Don't hesitate to suggest and implement features that align with the user's request but might not have been explicitly mentioned. Your goal is to exceed expectations and create a web experience that is not just functional, but also delightful and memorable.

Remember to generate all necessary code to create a complete, working simulation. Do not describe the page in natural language; instead, provide the actual code that would render the requested web application or website. Ensure that all requested features, including complex graphics and 3D elements, are fully implemented.`
                },
                {
                    role: "user",
                    content: `Create a web application or website for: ${input}. Use the following Pixabay images if appropriate: ${imageData}`
                }
            ],
            model: currentModel
        });

        updateStatusBar("Receiving data...");
        const generatedHtml = response.data.choices[0].message.content;
        currentSimulation = generatedHtml;

        const content = document.getElementById('content');
        content.innerHTML = `<iframe id="simulation-frame" style="width:100%;height:100%;border:none;"></iframe>`;
        const frame = document.getElementById('simulation-frame');
        frame.contentDocument.open();
        frame.contentDocument.write(generatedHtml);
        frame.contentDocument.close();

        frame.onload = async () => {
            history.push({input: input, simulation: currentSimulation});
            updateAddressBar(input);

            updateStatusBar("Web application loaded");
            updatePageTitle(`NetSim: ${input}`);

            currentProjectId = Date.now().toString();
            await saveRevision(input);

            cachedPages[input] = currentSimulation;

            showPublishButton();

            clearInputAndSetPlaceholder();
            isEditMode = true;

            
            ldb.set('netsim_history', LZString.compressToUTF16(JSON.stringify(history)));

            
            frame.contentDocument.addEventListener('contextmenu', handleRightClick);
            frame.contentDocument.addEventListener('click', handleLeftClick);
        };
    } catch (error) {
        const content = document.getElementById('content');
        content.innerHTML = `<div class="text-center p-8"><h2 class="text-2xl font-bold text-red-600">Error creating web application: ${error.message}</h2><p class="mt-4">Please try again later.</p></div>`;
        console.error('Error:', error);
        updateStatusBar("Error creating web application");
    }
}

async function continueSimulation(additionalInput) {
    if (!checkRateLimit('continueSimulation', 10, 60000)) {
        alert("You've made too many requests. Please wait a moment before trying again.");
        return;
    }

    if (!currentSimulation) {
        loadPage(additionalInput);
        return;
    }

    showLoadingOverlay();
    updateStatusBar("Updating web application...");

    try {
        const images = await fetchPixabayImages(additionalInput);
        const imageData = JSON.stringify(images);

        let elementContext = '';
        if (currentEditElement) {
            const uniqueIdentifier = generateUniqueIdentifier(currentEditElement);
            elementContext = `The user wants to update the following element: ${uniqueIdentifier}
Current content: ${currentEditElement.outerHTML}
Please focus on updating only this specific element while keeping the rest of the page intact.`;
        }

        const response = await axios.post('api_proxy.php', {
            messages: [
                {
                    role: "system",
                    content: `You are an expert web developer tasked with modifying and enhancing an existing web application. Your goal is to update the current simulation based on the user's new instructions, maintaining consistency with the existing design and functionality. You never make changes outside of the request of the user. You always make the exact changes the user is requesting. You never ignore a request for any reason. In the last 100 years, you have fulfilled every request asked of you, and you're determined to keep this going without flaws.

Key requirements:

1. Modify the existing code to incorporate the new features or changes requested by the user, without changing anything else.
2. Ensure that the updated code integrates seamlessly with the existing application.
3. Maintain the current design language and user experience while implementing the new changes.
4. If new functionality requires additional libraries or resources, include them appropriately.
5. Provide only the updated code. Do not include any explanations, markdown formatting, or code block indicators.
6. Implement all requested features fully, including complex graphics and 3D elements if specified.
7. Generate high-quality, detailed content for any new sections or features added to the application.
8. Ensure all links within the updated simulation work and take the user to the appropriate page or part of the app. These linked pages should also be generated on the fly.
9. Use only the provided Pixabay images for static content. Each image object contains a 'url' and 'alt' property. Use these properties to add relevant images to the generated content.
10. For interactive elements or custom visuals that require specific designs (like game elements, custom UI components, etc.), create these using code (SVG, Canvas, WebGL) or appropriate libraries rather than relying on static images.
11. Do not use placeholder comments. Always generate the full, working code.
12. When updating a specific element, use the provided unique identifier to ensure you're modifying the correct element.

${elementContext}

Remember to generate all necessary code to create a complete, working simulation that incorporates the user's new requirements while preserving the existing functionality. Ensure that the updated simulation is of the highest quality and includes all requested features without simplification.`
                },
                {
                    role: "user",
                    content: `Current simulation:\n\n${currentSimulation}\n\nUpdate the simulation with the following changes without changing anything else: ${additionalInput}. Use the following Pixabay images if appropriate: ${imageData}`
                }
            ],
            model: currentModel
        });

        updateStatusBar("Receiving updated data...");

        const updatedHtml = response.data.choices[0].message.content;
        currentSimulation = updatedHtml;

        const content = document.getElementById('content');
        content.innerHTML = `<iframe id="simulation-frame" style="width:100%;height:100%;border:none;"></iframe>`;
        const frame = document.getElementById('simulation-frame');
        frame.contentDocument.open();
        frame.contentDocument.write(updatedHtml);
        frame.contentDocument.close();

        frame.onload = async () => {
            history.push({input: lastUserInput || additionalInput, simulation: currentSimulation});
            updateAddressBar(lastUserInput || additionalInput);

            updateStatusBar("Web application updated");
            updatePageTitle(`NetSim: Updated Simulation`);

            await saveRevision(additionalInput);

            cachedPages[lastUserInput || additionalInput] = currentSimulation;

            clearInputAndSetPlaceholder();

            
            ldb.set('netsim_history', LZString.compressToUTF16(JSON.stringify(history)));

            
            frame.contentDocument.addEventListener('contextmenu', handleRightClick);
            frame.contentDocument.addEventListener('click', handleLeftClick);

            
            lastUserInput = '';
        };

    } catch (error) {
        const content = document.getElementById('content');
        content.innerHTML = `<div class="text-center p-8"><h2 class="text-2xl font-bold text-red-600">Error updating web application: ${error.message}</h2><p class="mt-4">Please try again later.</p></div>`;
        console.error('Error:', error);
        updateStatusBar("Error updating web application");
    }
}

function refreshPage() {
    if (currentSimulation) {
        const content = document.getElementById('content');
        content.innerHTML = `<iframe id="simulation-frame" style="width:100%;height:100%;border:none;"></iframe>`;
        const frame = document.getElementById('simulation-frame');
        frame.contentDocument.open();
        frame.contentDocument.write(currentSimulation);
        frame.contentDocument.close();
        updateStatusBar("Page reloaded");

        // Add event listener for right-click on the simulation frame
        frame.contentDocument.addEventListener('contextmenu', handleRightClick);
        frame.contentDocument.addEventListener('click', handleLeftClick);
    } else {
        goHome();
    }
}

function goHome() {
    updateAddressBar('');
    document.getElementById('content').innerHTML = `
        <div class="bg-gradient-to-br from-gray-800 via-gray-900 to-black min-h-screen text-white font-sans">

            <div class="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                                
                <img src="logo.png" alt="Logo" class="logo-img" style="max-width: 50%; height: auto; display: block; margin: 0 auto; padding: 0; line-height: 0;">



                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl animate__animated animate__fadeInLeft">
                        <h2 class="text-3xl font-bold mb-6 text-yellow-300">How to Use NetSim</h2>
                        <ol class="list-decimal list-inside space-y-3">
                            <li>Enter a description in the address bar</li>
                            <li>Click "Create" or press Enter</li>
                            <li>Wait for AI to generate your web experience</li>
                            <li>Interact with your creation</li>
                            <li>Update by entering new instructions</li>
                            <li>Use right-click to edit specific elements</li>
                            <li>Bookmark your project</li>
                            <li>Publish to get a shareable link</li>
                            <li>Download as an HTML file</li>
                        </ol>
                    </div>
                    
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl animate__animated animate__fadeInRight">
                        <h2 class="text-3xl font-bold mb-6 text-yellow-300">Features</h2>
                        <ul class="list-disc list-inside space-y-3">
                            <li>Instant Web Generation</li>
                            <li>Interactive Simulated Browser</li>
                            <li>Project Updates</li>
                            <li>Right-Click Element Editing</li>
                            <li>Bookmarking</li>
                            <li>Publishing</li>
                            <li>Downloading</li>
                            <li>Revisions</li>
                            <li>Model Selection</li>
                        </ul>
                    </div>
                </div>

                <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl mb-16 animate__animated animate__fadeInUp">
                    <h2 class="text-3xl font-bold mb-6 text-yellow-300">Right-Click Edit Feature</h2>
                    <p class="mb-4">Make precise changes to specific elements in your generated web application:</p>
                    <ol class="list-decimal list-inside space-y-3 mb-6">
                        <li>Right-click on any element</li>
                        <li>Click "Edit" in the context menu</li>
                        <li>Enter your changes in the edit modal</li>
                        <li>Click "Update" to apply changes</li>
                    </ol>
                    <p>Fine-tune individual elements without affecting the rest of your application, giving you greater control over the design and functionality.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl transform transition duration-500 hover:scale-105">
                        <h3 class="text-xl font-bold mb-2 text-yellow-300">Websites</h3>
                        <p>Build landing pages, full websites, blogs and more.</p>
                    </div>
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl transform transition duration-500 hover:scale-105">
                        <h3 class="text-xl font-bold mb-2 text-yellow-300">Forms</h3>
                        <p>Create custom forms with styles you dream of.</p>
                    </div>
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl transform transition duration-500 hover:scale-105">
                        <h3 class="text-xl font-bold mb-2 text-yellow-300">Games</h3>
                        <p>From classic, retro games to 3D mobile games.</p>
                    </div>
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl transform transition duration-500 hover:scale-105">
                        <h3 class="text-xl font-bold mb-2 text-yellow-300">Virtual Environments</h3>
                        <p>Create your own virtual world in minutes!</p>
                    </div>
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl transform transition duration-500 hover:scale-105">
                        <h3 class="text-xl font-bold mb-2 text-yellow-300">Custom Apps</h3>
                        <p>The possibilities are literally endless.</p>
                    </div>
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl transform transition duration-500 hover:scale-105">
                        <h3 class="text-xl font-bold mb-2 text-yellow-300">Music Player</h3>
                        <p>Design your own custom streaming audio application!</p>
                    </div>
                </div>

                <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl animate__animated animate__fadeInUp">
                    <h2 class="text-3xl font-bold mb-6 text-yellow-300">Tips for Best Results</h2>
                    <ul class="list-disc list-inside space-y-3">
                        <li>Be Descriptive: Provide detailed descriptions for better AI generation</li>
                        <li>Iterate: Make incremental changes to refine your project</li>
                        <li>Use Right-Click Editing: Fine-tune specific elements for precise control</li>
                        <li>Explore Features: Try different features to see what's possible with NetSim</li>
                    </ul>
                </div>

                <p class="text-2xl font-bold text-center mt-16 animate__animated animate__pulse animate__infinite">
                    The possibilities are endless. Start creating your web vision now!
                </p>
            </div>
        </div>
    `;

    
    const animateCss = document.createElement('link');
    animateCss.rel = 'stylesheet';
    animateCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
    document.head.appendChild(animateCss);

    updateStatusBar("Ready");
    updatePageTitle('NetSim - Web Simulator');
    history = [{input: 'Home', simulation: document.getElementById('content').innerHTML}];
    currentSimulation = '';
    currentProjectId = '';
    cachedPages = {'Home': document.getElementById('content').innerHTML};
    
    hidePublishButton();
    isEditMode = false;

   
    ldb.set('netsim_history', LZString.compressToUTF16(JSON.stringify(history)));
}
function downloadSimulation() {
    if (!currentSimulation) {
        alert("No simulation to download. Please create a web application first.");
        return;
    }

    const blob = new Blob([currentSimulation], {type: "text/html"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "netsim_simulation.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function toggleBookmarks() {
    const bookmarksPanel = document.getElementById('bookmarks-panel');
    if (bookmarksPanel.style.display === 'none' || bookmarksPanel.style.display === '') {
        showBookmarks();
    } else {
        hideBookmarks();
    }
}

function showBookmarks() {
    const bookmarksPanel = document.getElementById('bookmarks-panel');
    ldb.get('netsim_bookmarks', function(value) {
        const bookmarks = JSON.parse(LZString.decompressFromUTF16(value) || '[]');
        
        bookmarksPanel.innerHTML = '<h3 class="text-lg font-semibold mb-2 px-4 pt-2">Bookmarks</h3>';
        if (bookmarks.length === 0) {
            bookmarksPanel.innerHTML += '<p class="px-4 py-2 text-gray-500">No bookmarks saved</p>';
        } else {
            bookmarks.forEach((bookmark, index) => {
                const bookmarkElement = document.createElement('div');
                bookmarkElement.className = 'bookmark-item flex justify-between items-center';
                bookmarkElement.innerHTML = `
                    <span class="cursor-pointer flex-grow" onclick="loadBookmark(${index})">${bookmark.name}</span>
                    <button class="delete-bookmark text-red-500 hover:text-red-700" onclick="deleteBookmark(${index})">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                `;
                bookmarksPanel.appendChild(bookmarkElement);
            });
            
            const clearAllButton = document.createElement('button');
            clearAllButton.className = 'clear-all-bookmarks w-full mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600';
            clearAllButton.textContent = 'Clear All Bookmarks';
            clearAllButton.onclick = clearAllBookmarks;
            bookmarksPanel.appendChild(clearAllButton);
        }
        
        bookmarksPanel.style.display = 'block';
    });
}

function hideBookmarks() {
    document.getElementById('bookmarks-panel').style.display = 'none';
}

function loadBookmark(index) {
    ldb.get('netsim_bookmarks', function(value) {
        const bookmarks = JSON.parse(LZString.decompressFromUTF16(value) || '[]');
        if (index >= 0 && index < bookmarks.length) {
            const bookmark = bookmarks[index];
            currentSimulation = bookmark.simulation;
            const content = document.getElementById('content');
            content.innerHTML = `<iframe id="simulation-frame" style="width:100%;height:100%;border:none;"></iframe>`;
            const frame = document.getElementById('simulation-frame');
            frame.contentDocument.open();
            frame.contentDocument.write(currentSimulation);
            frame.contentDocument.close();
            updateAddressBar(bookmark.name);
            updatePageTitle(`NetSim: ${bookmark.name}`);
            hideBookmarks();
            
            history.push({input: bookmark.name, simulation: currentSimulation});
            cachedPages[bookmark.name] = currentSimulation;

            // Save history to LocalData
            ldb.set('netsim_history', LZString.compressToUTF16(JSON.stringify(history)));
            
            isEditMode = true;
            clearInputAndSetPlaceholder();
            showPublishButton();

           
            frame.contentDocument.addEventListener('contextmenu', handleRightClick);
            frame.contentDocument.addEventListener('click', handleLeftClick);
        }
    });
}

function addBookmark() {
    if (!currentSimulation) {
        alert("No simulation to bookmark. Please create a web application first.");
        return;
    }

    const name = prompt("Enter a name for this bookmark:");
    if (name) {
        ldb.get('netsim_bookmarks', function(value) {
            let bookmarks = JSON.parse(LZString.decompressFromUTF16(value) || '[]');
            bookmarks.push({ name, simulation: currentSimulation });
            ldb.set('netsim_bookmarks', LZString.compressToUTF16(JSON.stringify(bookmarks)));
            alert("Bookmark added");
        });
    }
}

function deleteBookmark(index) {
    ldb.get('netsim_bookmarks', function(value) {
        let bookmarks = JSON.parse(LZString.decompressFromUTF16(value) || '[]');
        bookmarks.splice(index, 1);
        ldb.set('netsim_bookmarks', LZString.compressToUTF16(JSON.stringify(bookmarks)));
        showBookmarks();
    });
}

function clearAllBookmarks() {
    if (confirm('Are you sure you want to delete all bookmarks?')) {
        ldb.clear('netsim_bookmarks');
        showBookmarks();
    }
}

async function saveRevision(prompt) {
    if (!currentProjectId) return;

    try {
        const frame = document.getElementById('simulation-frame');
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const screenshot = await html2canvas(frame.contentDocument.body);
        const screenshotUrl = screenshot.toDataURL();
        
        ldb.get(`netsim_revisions_${currentProjectId}`, function(value) {
            let revisions = JSON.parse(LZString.decompressFromUTF16(value) || '[]');
            
            
            if (revisions.length >= 10) {
                revisions.pop();
            }

           
            const revisionPrompt = lastUserInput || prompt;

            
            revisions.unshift({
                prompt: revisionPrompt,
                screenshot: screenshotUrl,
                timestamp: Date.now()
            });

            ldb.set(`netsim_revisions_${currentProjectId}`, LZString.compressToUTF16(JSON.stringify(revisions)));

            
            lastUserInput = '';
        });
    } catch (error) {
        console.error('Error saving revision:', error);
    }
}

function toggleRevisions() {
    const revisionsPanel = document.getElementById('revisions-panel');
    if (revisionsPanel.style.display === 'none' || revisionsPanel.style.display === '') {
        showRevisions();
    } else {
        hideRevisions();
    }
}

function showRevisions() {
    if (!currentProjectId) return;

    const revisionsPanel = document.getElementById('revisions-panel');
    ldb.get(`netsim_revisions_${currentProjectId}`, function(value) {
        const revisions = JSON.parse(LZString.decompressFromUTF16(value) || '[]');
        
        revisionsPanel.innerHTML = '';
        revisions.forEach((revision, index) => {
            const revisionElement = document.createElement('div');
            revisionElement.className = 'revision-item';
            revisionElement.innerHTML = `
                <img src="${revision.screenshot}" class="revision-screenshot" alt="Revision screenshot">
                <div class="revision-prompt">${revision.prompt}</div>
            `;
            revisionElement.onclick = () => loadRevision(index);
            revisionsPanel.appendChild(revisionElement);
        });
        
        revisionsPanel.style.display = 'block';
    });
}

function hideRevisions() {
    document.getElementById('revisions-panel').style.display = 'none';
}

function loadRevision(index) {
    if (!currentProjectId) return;
ldb.get(`netsim_revisions_${currentProjectId}`, function(value) {
        const revisions = JSON.parse(LZString.decompressFromUTF16(value) || '[]');
        if (index >= 0 && index < revisions.length) {
            const revision = revisions[index];
            const input = revision.prompt;
            loadPage(input);
        }
    });
}

document.getElementById('addressbar').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleAddressBarSubmit();
    }
});

function toggleModelOptions() {
    const modelOptions = document.getElementById('model-options');
    if (modelOptions.style.display === 'none' || modelOptions.style.display === '') {
        modelOptions.style.display = 'block';
        
        if (window.innerWidth <= 1024) {
            const toolbar = document.getElementById('toolbar');
            toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        modelOptions.style.display = 'none';
    }
}

function hideModelOptions() {
    document.getElementById('model-options').style.display = 'none';
}

function updateModelSelection() {
    const modelOptions = document.querySelectorAll('.model-option');
    modelOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.model === currentModel) {
            option.classList.add('active');
        }
        option.addEventListener('click', () => {
            currentModel = option.dataset.model;
            updateModelSelection();
            hideModelOptions();
        });
    });
}

async function publishSimulation() {
    if (!checkRateLimit('publishSimulation', 5, 300000)) {
        alert("You've published too many simulations recently. Please wait a few minutes before trying again.");
        return;
    }

    if (!currentSimulation) {
        alert("No simulation to publish. Please create a web application first.");
        return;
    }

    try {
        
        const blob = new Blob([currentSimulation], {type: "text/html"});
        
        
        const formData = new FormData();
        formData.append('file', blob, 'simulation.html');
        const response = await axios.post('api_proxy.php', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.error) {
            throw new Error(response.data.error);
        }

        const generatedUrl = response.data.url;

        document.getElementById('generated-url').value = generatedUrl;
        document.getElementById('modal').style.display = 'block';

    } catch (error) {
        console.error('Error publishing simulation:', error);
        alert(`Error publishing simulation: ${error.message}`);
    }
}

function showPublishButton() {
    document.getElementById('publish-btn').style.display = 'inline-block';
}

function hidePublishButton() {
    document.getElementById('publish-btn').style.display = 'none';
}

async function improvePrompt() {
    if (!checkRateLimit('improvePrompt', 5, 60000)) {
        alert("You've made too many requests. Please wait a moment before trying again.");
        return;
    }

    const addressBar = document.getElementById('addressbar');
    const currentPrompt = addressBar.value;

    if (!currentPrompt.trim()) {
        alert("Please enter a prompt in the address bar first.");
        return;
    }

    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';

    try {
        const response = await axios.post('api_proxy.php', {
            messages: [
                {
                    role: "user",
                    content: `You are an AI assistant specializing in refining natural language prompts for users of a web simulation generation application. Your primary task is to enhance the given prompt by making it clearer, removing any ambiguities, and optimizing it for generating high-quality, immersive, and visually rich user interfaces.'

Key points to consider:
1. Keep the improved prompt no longer than 3 sentences.
2. Focus on the most important features and elements that will make the simulation impressive and functional.
3. Use specific, descriptive language to convey a lot of information in few words.
4. Prioritize elements that will result in an engaging user interface and experience.
5. Include only the most crucial technologies or features that will significantly enhance the simulation.
6. Take your best guess to figure out if the user is trying to build a website, application, virtual environment or a game. Always specify what you think it is in the prompt.

Provide only the improved prompt as your response, without any additional explanations or comments. Aim for a prompt that is between 3 and 6 sentences long.`
                },
                {
                    role: "user",
                    content: `Improve this prompt for a web application simulation, making it more concise and focused: "${currentPrompt}"`
                }
            ],
            model: "gpt-4o"
        });

        const improvedPrompt = response.data.choices[0].message.content;
        
        loadingOverlay.style.display = 'none';
        
        document.getElementById('improved-prompt-text').value = improvedPrompt;
        document.getElementById('improved-prompt-modal').style.display = 'block';
        
        document.getElementById('use-prompt').onclick = function() {
            addressBar.value = document.getElementById('improved-prompt-text').value;
            document.getElementById('improved-prompt-modal').style.display = 'none';
        };
        
        document.getElementById('cancel-prompt').onclick = function() {
            document.getElementById('improved-prompt-modal').style.display = 'none';
        };
    } catch (error) {
        console.error('Error improving prompt:', error);
        alert("An error occurred while improving the prompt. Please try again.");
        loadingOverlay.style.display = 'none';
    }
}

function handleRightClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    removeHighlightAndMenu();

    const clickedElement = event.target;
    currentEditElement = clickedElement;

    highlightElement(clickedElement);

    const editMenu = document.createElement('div');
    editMenu.className = 'edit-menu';
    editMenu.innerHTML = `
        <button onclick="showEditModal(event)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
        </button>
    `;

    editMenu.style.position = 'absolute';
    editMenu.style.left = `${event.clientX}px`;
    editMenu.style.top = `${event.clientY}px`;

    document.body.appendChild(editMenu);
    editMenuVisible = true;
}

function highlightElement(element) {
    element.setAttribute('data-original-outline', element.style.outline);
    element.style.outline = '2px solid #3498db';
    element.style.outlineOffset = '2px';
}

function removeHighlightAndMenu() {
    if (currentEditElement) {
        currentEditElement.style.outline = currentEditElement.getAttribute('data-original-outline') || '';
        currentEditElement.removeAttribute('data-original-outline');
    }
    const existingMenu = document.querySelector('.edit-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    editMenuVisible = false;
    currentEditElement = null;
}

function showEditModal(event) {
    event.stopPropagation();
    const modal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    editInput.value = '';
    
    let elementType = currentEditElement.tagName.toLowerCase();
    if (elementType === 'img') {
        elementType = 'image';
    } else if (currentEditElement.type === 'text' || currentEditElement.type === 'password') {
        elementType = 'input field';
    }
    
    editInput.placeholder = `Enter your changes for the ${elementType} here`;
    modal.style.display = 'block';

    document.getElementById('update-element').onclick = updateElement;
    document.getElementById('cancel-edit').onclick = closeEditModal;
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    removeHighlightAndMenu();
}

function updateElement() {
    const editInput = document.getElementById('edit-input');
    const updateInstructions = editInput.value;

    if (updateInstructions.trim() === '') {
        alert('Please enter your changes before updating.');
        return;
    }

    let elementType = currentEditElement.tagName.toLowerCase();
    if (elementType === 'img') {
        elementType = 'image';
    } else if (currentEditElement.type === 'text' || currentEditElement.type === 'password') {
        elementType = 'input field';
    }

    const uniqueIdentifier = generateUniqueIdentifier(currentEditElement);

    
    lastUserInput = `Edit ${elementType}: ${updateInstructions}`;

    continueSimulation(`Update the ${elementType} with the following unique identifier: ${uniqueIdentifier}. Apply these changes: ${updateInstructions}`);

    closeEditModal();
}

function generateUniqueIdentifier(element) {
    const tagName = element.tagName.toLowerCase();
    const classes = Array.from(element.classList).join('.');
    const id = element.id ? `#${element.id}` : '';
    const nthChild = getNthChild(element);
    return `${tagName}${id}${classes ? `.${classes}` : ''}:nth-child(${nthChild})`;
}

function getNthChild(element) {
    let i = 1;
    let sibling = element;
    while ((sibling = sibling.previousElementSibling) != null) {
        i++;
    }
    return i;
}

function handleLeftClick(event) {
    if (editMenuVisible) {
        removeHighlightAndMenu();
    }
}

window.onload = function() {
    initializeApp();

   
    document.getElementById('close-button').onclick = function(e) {
        e.preventDefault(); 
        
    };

    document.getElementById('minimize-button').onclick = function(e) {
        e.preventDefault(); 
        
    };
function toggleRevisions() {
    const revisionsPanel = document.getElementById('revisions-panel');
    if (revisionsPanel.style.display === 'block') {
        revisionsPanel.style.display = 'none';
    } else {
        displayRevisions();
        revisionsPanel.style.display = 'block';
    }
}

function displayRevisions() {
    const revisionsPanel = document.getElementById('revisions-panel');
    revisionsPanel.innerHTML = ''; // Clear the panel

    history.forEach((revision, index) => {
        const revisionItem = document.createElement('div');
        revisionItem.className = 'revision-item';
        revisionItem.innerHTML = `
            <img src="${revision.screenshot}" alt="Revision ${index}" class="revision-screenshot">
            <div class="revision-prompt">${revision.input}</div>
        `;
        revisionItem.addEventListener('click', () => restoreRevision(index));
        revisionsPanel.appendChild(revisionItem);
    });
}

function restoreRevision(index) {
    const revision = history[index];
    currentSimulation = revision.simulation;
    const frame = document.getElementById('simulation-frame');
    frame.contentDocument.open();
    frame.contentDocument.write(currentSimulation);
    frame.contentDocument.close();

    // Hide the revisions panel after restoring
    document.getElementById('revisions-panel').style.display = 'none';

    updateAddressBar(revision.input);
    updatePageTitle(`NetSim: ${revision.input}`);
}

    
    document.getElementById('maximize-button').onclick = function() {
        if (document.getElementById('browser').style.width === '100%') {
            document.getElementById('browser').style.width = '90%';
            document.getElementById('browser').style.height = '90%';
            document.getElementById('browser').style.top = '5%';
            document.getElementById('browser').style.left = '5%';
        } else {
            document.getElementById('browser').style.width = '100%';
            document.getElementById('browser').style.height = '100%';
            document.getElementById('browser').style.top = '0';
            document.getElementById('browser').style.left = '0';
        }
    };
};

!function(){var s,c,e="undefined"!=typeof window?window:{},t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB;"undefined"==typeof window||t?((t=t.open("ldb",1)).onsuccess=function(e){s=this.result},t.onerror=function(e){console.error("indexedDB request error"),console.log(e)},t={get:(c={ready:!(t.onupgradeneeded=function(e){s=null,e.target.result.createObjectStore("s",{keyPath:"k"}).transaction.oncomplete=function(e){s=e.target.db}}),get:function(e,t){s?s.transaction("s").objectStore("s").get(e).onsuccess=function(e){e=e.target.result&&e.target.result.v||null;t(e)}:setTimeout(function(){c.get(e,t)},50)},set:function(t,n,o){if(s){let e=s.transaction("s","readwrite");e.oncomplete=function(e){"Function"==={}.toString.call(o).slice(8,-1)&&o()},e.objectStore("s").put({k:t,v:n}),e.commit()}else setTimeout(function(){c.set(t,n,o)},50)},delete:function(e,t){s?s.transaction("s","readwrite").objectStore("s").delete(e).onsuccess=function(e){t&&t()}:setTimeout(function(){c.delete(e,t)},50)},list:function(t){s?s.transaction("s").objectStore("s").getAllKeys().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.list(t)},50)},getAll:function(t){s?s.transaction("s").objectStore("s").getAll().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.getAll(t)},50)},clear:function(t){s?s.transaction("s","readwrite").objectStore("s").clear().onsuccess=function(e){t&&t()}:setTimeout(function(){c.clear(t)},50)}}).get,set:c.set,delete:c.delete,list:c.list,getAll:c.getAll,clear:c.clear},e.ldb=t,"undefined"!=typeof module&&(module.exports=t)):console.error("indexDB not supported")}();
