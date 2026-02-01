export default function Footer() {
    return (
        <footer className="text-center py-8 mt-12 text-gray-500 text-sm">
            <div className="flex items-center justify-center space-x-4 md:space-x-6 flex-wrap gap-y-2">
                <a href="mailto:sqmtalk7@gmail.com" className="hover:text-cyan-accent transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ height: '1.2em', width: '1.2em' }}>
                        <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                        <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                    </svg>
                    <span>sqmtalk7@gmail.com</span>
                </a>
                <a href="https://www.threads.net/@sqm.talk" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-accent transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" fill="currentColor">
                        <path d="M336.5 80.4c0-2.3-1.9-4.2-4.2-4.2h-39.3c-13.4 0-26.1 5.3-35.4 14.6L122.9 225.1 63.5 165.7c-9.3-9.3-22-14.6-35.4-14.6H13.5c-2.3 0-4.2 1.9-4.2 4.2v39.3c0 13.4 5.3 26.1 14.6 35.4l84.6 84.6c1.1 1.1 2.3 2.1 3.6 3.1l-84.6 84.6c-9.3-9.3-14.6 22-14.6 35.4v39.3c0 2.3 1.9 4.2 4.2 4.2h39.3c13.4 0 26.1-5.3 35.4-14.6l59.4-59.4 134.5 134.5c9.3 9.3 22 14.6 35.4 14.6h39.3c2.3 0 4.2-1.9 4.2-4.2V323.8c0-13.4-5.3-26.1-14.6-35.4l-84.6-84.6c-1.1-1.1-2.3-2.1-3.6-3.1l84.6-84.6c9.3-9.3 14.6-22 14.6-35.4V80.4zm-62.3-15L238.6 101c-3.1 3.1-3.1 8.2 0 11.3l84.6 84.6c3.1 3.1 8.2 3.1 11.3 0l35.4-35.4c3.1-3.1 3.1-8.2 0-11.3L334.2 84.2c-3.1-3.1-8.2-3.1-11.3 0L274.2 65.4zM122.9 286.9L38.3 431.5c-3.1 3.1-8.2 3.1-11.3 0L.3 404.9c-3.1-3.1-3.1-8.2 0-11.3L84.9 309c3.1-3.1 8.2-3.1 11.3 0l26.7 26.7c3.1 3.1 3.1 8.2 0 11.3zm212.3 15.7l-35.4 35.4c-3.1 3.1-8.2 3.1-11.3 0L153.9 203.3c-3.1-3.1-3.1-8.2 0-11.3l35.4-35.4c3.1-3.1 8.2-3.1 11.3 0l134.5 134.5c3.1 3.1 3.1 8.2 0 11.3z" />
                    </svg>
                    <span>@sqm.talk</span>
                </a>
            </div>
            <p className="mt-4">資料來源：內政部實價登錄</p>
            <p className="mt-2">版權所有 © 2025 平米內參. 保留一切權利.</p>
        </footer>
    );
}
