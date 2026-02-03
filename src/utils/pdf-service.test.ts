import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { convertLatexToPdf, openLatexInOverleaf } from './pdf-service';

describe('pdf-service', () => {
    describe('convertLatexToPdf', () => {
        beforeEach(() => {
            global.fetch = vi.fn();
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should return a blob when conversion is successful', async () => {
            const mockBlob = new Blob(['fake pdf'], { type: 'application/pdf' });
            const mockResponse = {
                ok: true,
                blob: async () => mockBlob,
            };
            (global.fetch as any).mockResolvedValue(mockResponse);

            const result = await convertLatexToPdf('latex code');

            expect(global.fetch).toHaveBeenCalledWith('https://texlive.net/cgi-bin/latexcgi', expect.any(Object));
            expect(result).toBe(mockBlob);
        });

        it('should throw an error when conversion fails', async () => {
            const mockResponse = {
                ok: false,
            };
            (global.fetch as any).mockResolvedValue(mockResponse);

            await expect(convertLatexToPdf('latex code')).rejects.toThrow('Conversion failed.');
        });
    });

    describe('openLatexInOverleaf', () => {
        let appendChildSpy: any;
        let removeChildSpy: any;
        let submitSpy: any;

        beforeEach(() => {
            appendChildSpy = vi.spyOn(document.body, 'appendChild');
            removeChildSpy = vi.spyOn(document.body, 'removeChild');
            // Mock form submit since it's not implemented in JSDOM
            HTMLFormElement.prototype.submit = vi.fn();
            submitSpy = vi.spyOn(HTMLFormElement.prototype, 'submit');
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should create a form and submit it', () => {
            openLatexInOverleaf('latex code');

            expect(appendChildSpy).toHaveBeenCalled();
            expect(submitSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();

            // Verify form properties
            const form = appendChildSpy.mock.calls[0][0] as HTMLFormElement;
            expect(form.method.toUpperCase()).toBe('POST');
            expect(form.action).toBe('https://www.overleaf.com/docs');
            expect(form.target).toBe('_blank');

            // Verify input
            const input = form.querySelector('input') as HTMLInputElement;
            expect(input.type).toBe('hidden');
            expect(input.name).toBe('snip_uri');
            expect(input.value).toContain('data:application/x-tex;base64,');
        });
    });
});
