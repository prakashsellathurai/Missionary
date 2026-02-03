import { convertLatexToPdf } from './utils/pdf-service';

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type === 'CONVERT_TO_PDF') {
        (async () => {
            try {
                const blob = await convertLatexToPdf(request.latexCode);

                // Convert Blob to Data URL (base64) so it can be sent back to content script
                const reader = new FileReader();
                reader.onloadend = () => {
                    sendResponse({ success: true, dataUrl: reader.result });
                };
                reader.onerror = () => {
                    sendResponse({ success: false, error: 'Failed to read blob' });
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error('Background script error:', error);
                sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
            }
        })();
        return true; // Will respond asynchronously
    }
});
