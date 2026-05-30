import ssh2 from 'ssh2';
import type { Connection, AuthContext } from 'ssh2';
import { readFileSync } from 'fs';
import { render } from 'ink';
import React from 'react';
import { Writable } from 'stream'; // Import standard Node streams
import App from './app.js'; 

const { Server } = ssh2;
const PORT = 2222;

// --- THE TRANSLATOR STREAM ---
// This acts as a bridge between Ink's rendering engine and the SSH socket.
// It intercepts every frame Ink draws, fixes the newlines to prevent
// the "staircase" formatting issue, and sends it to the user.
class InkStdout extends Writable {
  isTTY = true;
  columns: number;
  rows: number;

  constructor(private sshStream: any, columns: number, rows: number) {
    super();
    this.columns = columns;
    this.rows = rows;
  }

  _write(chunk: any, encoding: string, callback: () => void) {
    // Convert Ink's buffer to a string and safely enforce \r\n (Carriage Return + Newline)
    const str = chunk.toString('utf8').replace(/\r?\n/g, '\r\n');
    this.sshStream.write(str);
    callback();
  }
}
// -----------------------------

const server = new Server({
  hostKeys: [readFileSync('host_key')]
});

server.on('connection', (client: Connection) => {
  console.log('Client connected!');
  
  client.on('authentication', (ctx: AuthContext) => {
    ctx.accept(); 
  });

  client.on('ready', () => {
    client.on('session', (accept, reject) => {
      const session = accept();
      
      let rows = 24;
      let cols = 80;

      session.on('pty', (accept, reject, info) => {
        rows = info.rows;
        cols = info.cols;
        accept();
      });

      // Handle terminal resizing dynamically
      session.on('window-change', (accept, reject, info) => {
        rows = info.rows;
        cols = info.cols;
        if (accept) accept();
      });

      session.on('shell', (accept, reject) => {
        const stream = accept();
        
        // 1. Route output through our Translator Stream
        const stdout = new InkStdout(stream, cols, rows);

        // 2. Setup Stdin with dummy methods so Ink doesn't crash when reading keys
        const stdin = stream as any;
        stdin.isTTY = true;
        stdin.setRawMode = () => {};
        if (!stdin.ref) stdin.ref = () => {};
        if (!stdin.unref) stdin.unref = () => {};
        
        // Render the app using our isolated streams
        const { unmount } = render(React.createElement(App), {
          stdout: stdout as any,
          stdin: stdin,
          exitOnCtrlC: false 
        });

        stream.on('data', (data: Buffer) => {
          const input = data.toString().trim().toLowerCase();
          if (input === 'q' || data.toString() === '\x03') {
            unmount();
            stream.exit(0);
            stream.end();
          }
        });

        stream.on('close', () => {
          unmount();
          console.log('Stream closed');
        });
      });
    });
  });

  client.on('end', () => console.log('Client disconnected'));
  
  // Prevent the server from crashing if a client forcefully closes their terminal
  client.on('error', (err: Error) => {
    console.log('Client connection dropped cleanly.');
  }); 
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SSH Portfolio listening on port ${PORT}...`);
});