// ==UserScript==
// @name         Datadog: Auto-Switch to Legacy Monitor Page
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A robust script to switch to the legacy view on Datadog monitor pages.
// @author       andrewf76
// @match        https://app.datadoghq.com/monitors/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Define the CSS selectors for the two buttons
    const dropdownToggleSelector = 'button.druids_form_button--is-borderless:nth-child(1)';
    const legacyPageButtonSelector = 'div.druids_dialogs_popover-menu-item-wrapper:nth-child(2) > button:nth-child(1)';

    // Define a small delay (in milliseconds) for the dropdown menu to render
    const dropdownRenderDelay = 200;

    // Flag to prevent the automation from running multiple times on the same URL
    let lastUrl = '';
    let automationRun = false;

    console.log('Datadog Auto-Legacy Script: Initializing...');

    // Function to perform the button clicks
    function clickButtonsInSequence() {
        const dropdownButton = document.querySelector(dropdownToggleSelector);

        if (dropdownButton) {
            console.log('Datadog Auto-Legacy Script: Clicking dropdown toggle button.');
            dropdownButton.click();

            setTimeout(() => {
                const legacyButton = document.querySelector(legacyPageButtonSelector);

                if (legacyButton) {
                    console.log('Datadog Auto-Legacy Script: Clicking legacy page button.');
                    legacyButton.click();
                    automationRun = true;
                    console.log('Datadog Auto-Legacy Script: Automation complete.');
                } else {
                    console.warn('Datadog Auto-Legacy Script: Legacy page button not found after dropdown opened. Automation aborted.');
                }
            }, dropdownRenderDelay);
        }
    }

    // Main function to check URL and trigger automation if needed
    function checkAndRunAutomation() {
        const currentUrl = window.location.href;

        // Only proceed if the URL has changed and matches the pattern
        const isMonitorPageWithId = currentUrl.match(/^https:\/\/app\.datadoghq\.com\/monitors\/\d+/);

        if (isMonitorPageWithId && lastUrl !== currentUrl) {
            console.log(`Datadog Auto-Legacy Script: URL changed to a monitor page with an ID. Executing automation.`);
            automationRun = false; // Reset the flag for the new page
            lastUrl = currentUrl;

            // Wait for the specific dropdown element to appear before clicking
            const checkElement = () => {
                if (automationRun) return;
                const dropdownButton = document.querySelector(dropdownToggleSelector);
                if (dropdownButton) {
                    clickButtonsInSequence();
                } else {
                    setTimeout(checkElement, 100);
                }
            };
            checkElement();
        }
    }

    // Use a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(checkAndRunAutomation);
    const config = { childList: true, subtree: true };

    // Start observing the body for DOM changes
    observer.observe(document.body, config);

    // Initial check in case the script loads after the page content is already there
    checkAndRunAutomation();

    // Listen for the popstate event, which some SPA navigations trigger
    window.addEventListener('popstate', checkAndRunAutomation);

})();
