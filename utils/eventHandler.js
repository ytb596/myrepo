// Event handler utility
const fs = require('fs');
const path = require('path');

// Store loaded event modules
const eventModules = [];

/**
 * Initialize the event handler
 * @param {Client} client Discord client
 */
function init(client) {
    console.log('Initializing event handler...');
    loadEvents(client);
    console.log('Event handler initialized!');
}

/**
 * Load all event modules
 * @param {Client} client Discord client
 */
function loadEvents(client) {
    const utilitiesPath = path.join(__dirname, '..', 'modules', 'utilities');
    const utilityFiles = fs.readdirSync(utilitiesPath).filter(file => file.endsWith('.js'));
    
    console.log(`Found ${utilityFiles.length} utility files to load.`);
    
    // Unregister existing event handlers
    unregisterEvents(client);
    
    // Load each utility file
    for (const file of utilityFiles) {
        try {
            const filePath = path.join(utilitiesPath, file);
            
            // Clear cache to ensure we get fresh module
            delete require.cache[require.resolve(filePath)];
            
            const eventModule = require(filePath);
            
            if (!eventModule.events || !Array.isArray(eventModule.events)) {
                console.warn(`Utility file ${file} doesn't have an events array, skipping.`);
                continue;
            }
            
            // Register each event in the module
            eventModule.events.forEach(event => {
                if (!event.name || !event.execute) {
                    console.warn(`Invalid event structure in ${file}, skipping.`);
                    return;
                }
                
                // Register event handler
                client.on(event.name, (...args) => event.execute(client, ...args));
                
                // Store the registered event for cleanup
                eventModules.push({
                    name: event.name,
                    handler: event.execute,
                    file
                });
                
                console.log(`Registered event: ${event.name} from ${file}`);
            });
        } catch (error) {
            console.error(`Error loading utility file ${file}:`, error);
        }
    }
    
    console.log(`Successfully loaded ${eventModules.length} events!`);
}

/**
 * Unregister all events
 * @param {Client} client Discord client
 */
function unregisterEvents(client) {
    if (client) {
        eventModules.forEach(event => {
            try {
                client.removeListener(event.name, event.handler);
                console.log(`Unregistered event: ${event.name} from ${event.file}`);
            } catch (error) {
                console.error(`Error unregistering event ${event.name}:`, error);
            }
        });
    }
    
    // Clear the event modules array
    eventModules.length = 0;
}

module.exports = {
    init,
    loadEvents,
    unregisterEvents
};
