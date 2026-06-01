import ssh2 from 'ssh2';
import type { Connection, AuthContext } from 'ssh2';
import { readFileSync } from 'fs';
import { render } from 'ink';
import React from 'react';
import { Writable } from 'stream'; 
import App from './app.js'; 

const { Server } = ssh2;
const PORT = 2222;

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
    const str = chunk.toString('utf8').replace(/\r?\n/g, '\r\n');
    this.sshStream.write(str);
    callback();
  }
}

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
      let stdout: InkStdout; // Declare stdout here so resize can access it

      session.on('pty', (accept, reject, info) => {
        rows = info.rows;
        cols = info.cols;
        accept();
      });

      // THE RESPONSIVENESS FIX
      session.on('window-change', (accept, reject, info) => {
        rows = info.rows;
        cols = info.cols;
        if (stdout) {
          stdout.columns = cols;
          stdout.rows = rows;
          stdout.emit('resize'); // Manually tell Ink to re-render
        }
        if (accept) accept();
      });

      session.on('shell', (accept, reject) => {
        const stream = accept();
        
        // THE SCROLLING FIX: Removed alt-buffer, kept hidden cursor
        stream.write('\x1b[?25l');

        stdout = new InkStdout(stream, cols, rows);

        const stdin = stream as any;
        stdin.isTTY = true;
        stdin.setRawMode = () => {};
        if (!stdin.ref) stdin.ref = () => {};
        if (!stdin.unref) stdin.unref = () => {};
        
        const { unmount } = render(React.createElement(App), {
          stdout: stdout as any,
          stdin: stdin,
          exitOnCtrlC: false 
        });

        stream.on('data', (data: Buffer) => {
          const input = data.toString().trim().toLowerCase();
          if (input === 'q' || data.toString() === '\x03') {
            unmount();
            stream.write('\x1b[?25h'); // Restore cursor on exit
            stream.exit(0);
            stream.end();
          }
        });

        stream.on('close', () => {
          unmount();
          stream.write('\x1b[?25h');
          console.log('Stream closed');
        });
      });
    });
  });

  client.on('end', () => console.log('Client disconnected'));
  
  client.on('error', (err: Error) => {
    console.log('Client connection dropped cleanly.');
  }); 
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SSH Portfolio listening on port ${PORT}...`);
});