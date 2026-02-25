/**
 * 🎓 CampusConnect - Main Application Scripts
 * Premium UI Package 2026
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check for Flash Messages from server
    const successMsg = document.getElementById('flashSuccessMsg')?.value;
    const errorMsg = document.getElementById('flashErrorMsg')?.value;

    if (successMsg) showToast(successMsg, 'success');
    if (errorMsg) showToast(errorMsg, 'error');

    // Initialize Tooltips/Popovers if any (Bootstrap)

    // Global Button Loading State Handler
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function () {
            const btn = this.querySelector('button[type="submit"]');
            if (btn && !btn.classList.contains('no-loader')) {
                btn.classList.add('btn-loading');
            }
        });
    });

    // ⌘K / Ctrl+K Keyboard Shortcut → Focus Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        });
    }
});

/**
 * Custom Toast Notification System
 * @param {string} msg - The message to display
 * @param {string} type - 'success', 'error', 'info'
 */
function showToast(msg, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill'
    };

    // Build icon
    const icon = document.createElement('i');
    icon.className = `bi ${icons[type] || icons.info} toast-icon`;

    // Build message content (textContent to prevent XSS)
    const content = document.createElement('div');
    content.className = 'toast-content';
    content.textContent = msg;

    // Build close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    const closeIcon = document.createElement('i');
    closeIcon.className = 'bi bi-x';
    closeBtn.appendChild(closeIcon);
    closeBtn.addEventListener('click', function () {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    });

    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    // Auto remove after 5s
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

/**
 * Generate and Download .ics file for an event
 */
function downloadICS(title, desc, dateStr, timeStr, venue) {
    // Basic .ics format
    // dateStr example: "Tue, Feb 17, 2026"
    // timeStr example: "1:30 PM"

    const start = new Date(`${dateStr} ${timeStr}`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusConnect//Event Manager//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${title}`,
        `DESCRIPTION:${desc.replace(/\n/g, '\\n')}`,
        `LOCATION:${venue}`,
        `DTSTART:${formatDate(start)}`,
        `DTEND:${formatDate(end)}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);

    showToast('Event added to prep-list! (ICS Downloaded)', 'success');
}

/**
 * Generate QR Code using a public API
 */
function generateQRCode(containerId, url) {
    const container = document.getElementById(containerId);
    if (!container || !url) return;

    const qrWrapper = document.createElement('div');
    qrWrapper.className = 'qr-container';
    const qrImg = document.createElement('img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
    qrImg.alt = 'Registration QR Code';
    qrWrapper.appendChild(qrImg);

    container.innerHTML = ''; // Clear container
    container.appendChild(qrWrapper);
}


