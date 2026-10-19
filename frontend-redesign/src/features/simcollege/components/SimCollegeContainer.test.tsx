import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimCollegeContainer } from './SimCollegeContainer';

describe('SimCollegeContainer Component', () => {
  it('renders header, canvas, event list, and toolbar controls', () => {
    render(<SimCollegeContainer />);

    expect(
      screen.getByRole('heading', { name: /SimCollege: Campus Spatial Map/i }),
    ).toBeInTheDocument();

    expect(screen.getByTestId('simcollege-canvas-container')).toBeInTheDocument();
    expect(screen.getByRole('toolbar', { name: /Map Controls/i })).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /Campus Event Schedule & Locations/i }),
    ).toBeInTheDocument();
  });

  it('updates zoom level when Zoom In and Zoom Out toolbar buttons are clicked', () => {
    render(<SimCollegeContainer />);

    const zoomInBtn = screen.getByTestId('toolbar-zoom-in');
    const zoomOutBtn = screen.getByTestId('toolbar-zoom-out');

    expect(screen.getByText('100%')).toBeInTheDocument();

    fireEvent.click(zoomInBtn);
    expect(screen.getByText('120%')).toBeInTheDocument();

    fireEvent.click(zoomOutBtn);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('selects an event pin from the map and displays the event detail popup', () => {
    render(<SimCollegeContainer />);

    const pin101 = screen.getByTestId('event-pin-101');
    expect(pin101).toBeInTheDocument();

    fireEvent.click(pin101);

    const popup = screen.getByTestId('event-detail-popup');
    expect(popup).toBeInTheDocument();
    expect(popup.textContent).toContain('Spring Hackathon 2026');

    // Confirm attendance button
    const confirmBtn = screen.getByRole('button', { name: /Confirm Attendance/i });
    fireEvent.click(confirmBtn);

    // Popup closes
    expect(screen.queryByTestId('event-detail-popup')).not.toBeInTheDocument();
  });

  it('locates an event when "Locate on Map" is clicked in the synchronized list', () => {
    render(<SimCollegeContainer />);

    const locateButtons = screen.getAllByRole('button', { name: /Locate on Map:/i });
    expect(locateButtons.length).toBeGreaterThan(0);

    fireEvent.click(locateButtons[0]);

    // Announcer reflects location
    const announcer = screen.getByTestId('spatial-announcer');
    expect(announcer.textContent).toContain('Centered map');
  });

  it('switches view modalities (Split -> Map -> List)', () => {
    render(<SimCollegeContainer />);

    // Click Map only
    const mapToggle = screen.getByTestId('modality-map');
    fireEvent.click(mapToggle);

    expect(screen.getByTestId('simcollege-canvas-container')).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: /Campus Event Schedule & Locations/i }),
    ).not.toBeInTheDocument();

    // Click List only
    const listToggle = screen.getByTestId('modality-list');
    fireEvent.click(listToggle);

    expect(screen.queryByTestId('simcollege-canvas-container')).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /Campus Event Schedule & Locations/i }),
    ).toBeInTheDocument();
  });
});
