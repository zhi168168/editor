class Logger {
    static logs = [];
    
    static log(type, ...args) {
        const timestamp = new Date().toISOString();
        this.logs.push({
            timestamp,
            type,
            message: args.join(' ')
        });
        console.log(`[${type}]`, ...args);
    }
    
    static download() {
        const logText = this.logs.map(log => 
            `[${log.timestamp}] [${log.type}] ${log.message}`
        ).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `editor-logs-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
} 