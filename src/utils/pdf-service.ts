/**
 * Converts LaTeX code to PDF using texlive.net
 * @param latexCode The LaTeX code to convert
 * @returns A promise that resolves to a Blob of the PDF
 */
export const convertLatexToPdf = async (latexCode: string): Promise<Blob> => {
    const formData = new FormData();
    formData.append('filecontents[]', latexCode);
    formData.append('filename[]', 'document.tex');
    formData.append('engine', 'pdflatex');
    formData.append('return', 'pdf');

    const response = await fetch('https://texlive.net/cgi-bin/latexcgi', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Conversion failed.');
    }

    return await response.blob();
};

/**
 * Opens the LaTeX code in Overleaf
 * @param latexCode The LaTeX code to open
 */
export const openLatexInOverleaf = (latexCode: string): void => {
    // Base64 encode the LaTeX content
    // We need to handle UTF-8 characters correctly
    const base64Latex = btoa(unescape(encodeURIComponent(latexCode)));
    const dataUrl = `data:application/x-tex;base64,${base64Latex}`;

    // Create a form to post data to Overleaf
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
};
