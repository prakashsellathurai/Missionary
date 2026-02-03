
// Logic to handle LaTeX to PDF conversion
const convertToPdf = async (latexCode: string, button: HTMLButtonElement) => {
    const originalText = button.innerText;
    button.innerText = 'Converting...';
    button.disabled = true;

    try {
        const encodedLatex = encodeURIComponent(latexCode);
        const url = `https://latexonline.cc/compile?text=${encodedLatex}&force=true`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Conversion failed.');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'document.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        button.innerText = 'Downloaded!';
    } catch (err) {
        console.error('Missionary Extension Error:', err);
        button.innerText = 'Error';
    } finally {
        setTimeout(() => {
            button.innerText = originalText;
            button.disabled = false;
        }, 3000);
    }
};

const createConvertButton = (codeBlock: HTMLElement) => {
    const button = document.createElement('button');
    button.innerText = 'PDF';
    // Style the button to look consistent but distinct
    Object.assign(button.style, {
        position: 'absolute',
        top: '10px',
        right: '50px', // Positioned to the left of the copy button usually
        zIndex: '100',
        padding: '2px 8px',
        fontSize: '12px',
        backgroundColor: '#10a37f',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        opacity: '0.9'
    });

    button.onmouseover = () => { button.style.opacity = '1'; };
    button.onmouseout = () => { button.style.opacity = '0.9'; };

    button.onclick = (e) => {
        e.stopPropagation();
        const codeText = codeBlock.textContent || '';
        convertToPdf(codeText, button);
    };

    return button;
};

const openInOverleaf = (latexCode: string) => {
    try {
        const base64Latex = btoa(unescape(encodeURIComponent(latexCode)));
        const dataUrl = `data:application/x-tex;base64,${base64Latex}`;

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://www.overleaf.com/docs';
        form.target = '_blank';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'snip_uri';
        input.value = dataUrl;

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    } catch (err) {
        console.error('Missionary Extension: Overleaf Error', err);
    }
};

const createOverleafButton = (codeBlock: HTMLElement) => {
    const button = document.createElement('button');
    button.innerText = 'Overleaf';
    Object.assign(button.style, {
        position: 'absolute',
        top: '10px',
        right: '100px', // Positioned to the left of the PDF button
        zIndex: '100',
        padding: '2px 8px',
        fontSize: '12px',
        backgroundColor: '#47ba5d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        opacity: '0.9'
    });

    button.onmouseover = () => { button.style.opacity = '1'; };
    button.onmouseout = () => { button.style.opacity = '0.9'; };

    button.onclick = (e) => {
        e.stopPropagation();
        const codeText = codeBlock.textContent || '';
        openInOverleaf(codeText);
    };

    return button;
};

const processCodeBlocks = () => {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((codeElement) => {
        // Cast to HTMLElement to access className and dataset
        const el = codeElement as HTMLElement;
        const preElement = el.parentElement;

        if (!preElement || preElement.dataset.missionaryProcessed) {
            return;
        }

        // Check for common LaTeX classes or content indicators
        const isLatex = el.classList.contains('language-latex') ||
            el.classList.contains('language-tex') ||
            el.textContent?.includes('\\documentclass') ||
            el.textContent?.includes('\\begin{document}');

        if (isLatex) {
            const pdfButton = createConvertButton(el);
            const overleafButton = createOverleafButton(el);

            // Append to the pre element (container) so it's positioned relative to the code block
            // Often ChatGPT puts code in a wrapper. We might need to adjust positioning.
            // Usually pre is relative.
            if (getComputedStyle(preElement).position === 'static') {
                preElement.style.position = 'relative';
            }
            preElement.appendChild(pdfButton);
            preElement.appendChild(overleafButton);
            preElement.dataset.missionaryProcessed = 'true';
        }
    });
};

// Observer to handle dynamic content loading
const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            shouldProcess = true;
            break;
        }
    }

    if (shouldProcess) {
        processCodeBlocks();
    }
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial processing
processCodeBlocks();

console.log('Missionary: Content script loaded and observing for LaTeX blocks.');
