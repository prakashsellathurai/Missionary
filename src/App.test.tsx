import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as pdfService from './utils/pdf-service';
import userEvent from '@testing-library/user-event';

// Mock the pdf-service module
vi.mock('./utils/pdf-service', () => ({
    convertLatexToPdf: vi.fn(),
    openLatexInOverleaf: vi.fn(),
}));

// Mock URL.createObjectURL and revokeObjectURL
window.URL.createObjectURL = vi.fn(() => 'mock-url');
window.URL.revokeObjectURL = vi.fn();

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<App />);
        expect(screen.getByText('Missionary')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/\\documentclass/)).toBeInTheDocument();
        expect(screen.getByText('Convert to PDF')).toBeInTheDocument();
        expect(screen.getByText('Open in Overleaf')).toBeInTheDocument();
    });

    it('shows error when input is empty and buttons are clicked', async () => {
        render(<App />);

        const convertBtn = screen.getByText('Convert to PDF');
        fireEvent.click(convertBtn);
        expect(await screen.findByText('Please enter some LaTeX code.')).toBeInTheDocument();

        const overleafBtn = screen.getByText('Open in Overleaf');
        fireEvent.click(overleafBtn);
        // Error message should stick or re-appear (it's the same message)
        expect(screen.getByText('Please enter some LaTeX code.')).toBeInTheDocument();
    });

    it('calls convertLatexToPdf when convert button is clicked', async () => {
        const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
        (pdfService.convertLatexToPdf as any).mockResolvedValue(mockBlob);

        render(<App />);
        const textarea = screen.getByPlaceholderText(/\\documentclass/);
        await userEvent.type(textarea, 'test latex');

        const convertBtn = screen.getByText('Convert to PDF');
        fireEvent.click(convertBtn);

        expect(screen.getByText('Converting...')).toBeInTheDocument();

        await waitFor(() => {
            expect(pdfService.convertLatexToPdf).toHaveBeenCalledWith('test latex');
        });

        // Should reset button text
        await waitFor(() => {
            expect(screen.getByText('Convert to PDF')).toBeInTheDocument();
        });
    });

    it('shows error when conversion fails', async () => {
        (pdfService.convertLatexToPdf as any).mockRejectedValue(new Error('API Error'));

        render(<App />);
        const textarea = screen.getByPlaceholderText(/\\documentclass/);
        await userEvent.type(textarea, 'test latex');

        const convertBtn = screen.getByText('Convert to PDF');
        fireEvent.click(convertBtn);

        await waitFor(() => {
            expect(screen.getByText('API Error')).toBeInTheDocument();
        });
    });

    it('calls openLatexInOverleaf when overleaf button is clicked', async () => {
        render(<App />);
        const textarea = screen.getByPlaceholderText(/\\documentclass/);
        await userEvent.type(textarea, 'test latex');

        const overleafBtn = screen.getByText('Open in Overleaf');
        fireEvent.click(overleafBtn);

        expect(pdfService.openLatexInOverleaf).toHaveBeenCalledWith('test latex');
    });
});
