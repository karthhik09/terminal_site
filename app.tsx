import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import figlet from 'figlet';
import { ASCII_FACE } from './ascii.js'; 

// THEMES
const THEMES = {
  solarized: {
    name: 'Solarized Dark',
    primary: '#93a1a1',      
    accent: '#2aa198',       
    dim: '#586e75',          
    title: '#268bd2',       
    subtitle: '#b58900',    
    prompt: '#859900',       
    error: '#dc322f',        
    bg: 'black',
    cursor: '▊',
    border: 'cyan',
  },
  tokyonight: {
    name: 'Tokyo Night',
    primary: '#c0caf5',      
    accent: '#7aa2f7',       
    dim: '#565f89',          
    title: '#bb9af7',        
    subtitle: '#7dcfff',     
    prompt: '#9ece6a',      
    error: '#f7768e',       
    bg: 'black',
    cursor: '▊',
    border: 'blue',
  },
  matrix: {
    name: 'Matrix',
    primary: '#00FF41',      
    accent: '#008F11',       
    dim: '#003B00',          
    title: '#008F11',
    subtitle: '#00FF41',
    prompt: '#008F11',
    error: 'redBright',
    bg: 'black',
    cursor: '▊',
    border: 'greenBright',
  },
  nord: {
    name: 'Nord',
    primary: '#ECEFF4',     
    accent: '#88C0D0',       
    dim: '#4C566A',          
    title: '#5E81AC',        
    subtitle: '#81A1C1',     
    prompt: '#A3BE8C',       
    error: '#BF616A',        
    bg: 'black',
    cursor: '▊',
    border: 'blue',
  },
} as const;

type ThemeKey = keyof typeof THEMES;
type Theme = typeof THEMES[ThemeKey];

//Intro DATA
const rawIntro = "I'm a CS student at VIT-AP University and a full stack developer seamlessly navigating between React interfaces with Spring Boot architectures. I'm currently exploring DevOps and cloud infrastructure (frequently working with AWS, Docker, and K3s). Moreover, diving deep into ransomware analysis and encryption. Beyond the terminal, I'm exploring and learning beyound what I already know.";

// COMMANDS DATA
const DATA = {
  whoami: 'Karthik N - CS undergrad, loves to explore and build cool stuff.',

  projects: [
    {
      name: 'ToDo - Task Manager',
      desc: [
        'Architected a REST API (React/Spring Boot/MySQL) with Redis & API rate limiting.',
        'Migrated to AWS, deploying the frontend to a K3s Kubernetes cluster for resilient orchestration.',
        'Scaled backend using an ASG with Dockerised instances, managed by an ALB with AWS ACM SSL routing.'
      ],
      tech: ['Spring Boot', 'React', 'Redis', 'AWS', 'K3s'],
      link: 'github.com/karthhik09/ToDo_Backend',
    },
    {
      name: 'Delivery Agent Incentive Optimiser',
      desc: [
        'Built a synthetic data warehouse (40K orders) with a full ETL pipeline.',
        'Clustered 700 agents into 9 personas via K Means and trained per cluster Decision Tree & Naive Bayes classifiers.',
        'Developed an incentive optimiser to recommend minimum multipliers, successfully cutting unnecessary business spend.'
      ],
      tech: ['Python', 'Scikit-learn', 'Pandas'],
      link: 'github.com/karthhik09/Food_Delivery_Incentive',
    },
    {
      name: 'Vitra - VIT AP Campus Mitra',
      desc: [
        'Built a domain specific Q&A chatbot using DIET based intent classification and entity extraction.',
        'Achieved 88% accuracy (0.9 precision) by optimising configs, rules, and test stories.',
        'Deployed on Raspberry Pi with dynamic faculty data loading via Python scripting.'
      ],
      tech: ['Rasa', 'Python', 'Raspberry Pi'],
    }
  ],

  skills: {
    'Languages & DBs': ['Java', 'Python', 'JS', 'R', 'MySQL', 'Redis', 'MongoDB'],
    'Frameworks & Libs': ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn', 'Rasa'],
    'Tools & Platforms': ['Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'n8n'],
    'Hardware & IoT': ['Raspberry Pi', 'ESP32'],
  },

  education: [
    {
      degree: 'B.Tech - Computer Science & Engineering',
      school: 'VIT-AP University',
      year: '2023 - 2027',
      gpa: '8.31 / 10',
    },
  ],

  leadership: [
    {
      role: 'Treasurer',
      org: 'Institution of Engineers (India) Student Chapter, VIT-AP',
      period: 'August 2024 - Present',
      impact: [
        'Contributed to the success of 11 technical events, resulting in a 25% increase in chapter membership.',
        'Led a dedicated team of 12, overseeing logistics, marketing, and outreach for smooth execution.'
      ],
    },
    {
      role: 'Student Organiser',
      org: 'VLaunchpad 2026',
      period: 'April 2026',
      impact: [
        'Coordinated participant logistics and successfully secured registrations for the national startup challenge.',
        'Led a team of 5 member volunteers to streamline on ground operations, outreach, and event logistics.'
      ],
    },
    {
      role: 'Volunteer',
      org: 'NASA Space Apps Challenge, VIT-AP',
      period: 'October 2024',
      impact: [
        'Coordinated an international hackathon with 100+ participants over 2 days.',
        'Provided technical mentorship and strategic guidance to teams, enhancing collaboration and outcomes.'
      ],
    }
  ],

  contact: {
    email: 'karthiknandeti@gmail.com',
    github: 'github.com/karthhik09',
    linkedin: 'linkedin.com/in/karthikn09',
    ssh: 'ssh ssh.karthikn.tech',
  },
};

// DYNAMIC ASCII REVEAL COMPONENT (Only for Face)
const AnimatedAscii = ({ text, color, charset }: { text: string; color: string; charset: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let iteration = 0;
    const maxIterations = 20; 

    const interval = setInterval(() => {
      let newText = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '\n' || char === '\r' || char === ' ') {
          newText += char;
        } else if (Math.random() < (iteration / maxIterations)) {
          newText += char; 
        } else {
          newText += charset[Math.floor(Math.random() * charset.length)];
        }
      }
      setDisplayedText(newText);
      iteration++;

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayedText(text); 
      }
    }, 10); 
    return () => clearInterval(interval);
  }, [text, charset]);

  return <Text color={color}>{displayedText}</Text>;
};

// CUSTOM THEMED INPUT & CURSOR
function ThemedInput({ value, onChange, onSubmit, theme, active }: { value: string, onChange: (v: string) => void, onSubmit: (v: string) => void, theme: Theme, active: boolean }) {

  useInput((char, key) => {
    if (!active || key.ctrl || key.meta || key.upArrow || key.downArrow) return;
    if (key.return) {
      onSubmit(value);
    } else if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
    } else if (char) {
      onChange(value + char);
    }
  });

  return (
    <Text color={theme.primary}>
      {value}
      {/* The cursor is now a solid, unchanging block */}
      <Text color={theme.primary}>{active ? theme.cursor : ' '}</Text>
    </Text>
  );
}

// OUTPUT RENDERER
function RenderOutput({ cmd, theme }: { cmd: string; theme: Theme }) {
  const parts = cmd.trim().split(/\s+/);
  const command = parts[0].toLowerCase();

  if (command === 'whoami') {
    return (
      <Box flexDirection="column" marginTop={1}>
        <Text>{DATA.whoami}</Text>
      </Box>
    );
  }

  if (command === 'projects') {
    return (
      <Box flexDirection="column">
        {DATA.projects.map((p, i) => (
          <Box key={i} flexDirection="column" marginTop={1}>
            <Text color={theme.accent} bold>▸ {p.name}</Text>
            {p.desc.map((line, idx) => (
              <Text key={idx}>  • {line}</Text>
            ))}
            <Text>  Stack : {p.tech.join(' · ')}</Text>
            <Text>  Link  : {p.link}</Text>
          </Box>
        ))}
      </Box>
    );
  }

  if (command === 'skills') {
    return (
      <Box flexDirection="column">
        {Object.entries(DATA.skills).map(([cat, items]) => (
          <Box key={cat} marginTop={1} flexDirection="column">
            <Text color={theme.accent} bold>  {cat.toUpperCase()}</Text>
            <Text>  {'  ' + items.join('  ·  ')}</Text>
          </Box>
        ))}
      </Box>
    );
  }

  if (command === 'education') {
    return (
      <Box flexDirection="column">
        {DATA.education.map((e, i) => (
          <Box key={i} flexDirection="column" marginTop={1}>
            <Text color={theme.accent} bold>▸ {e.degree}</Text>
            <Text>  {e.school}  •  {e.year}  •  GPA {e.gpa}</Text>
          </Box>
        ))}
      </Box>
    );
  }

  if (command === 'leadership') {
    return (
      <Box flexDirection="column">
        {DATA.leadership.map((l, i) => (
          <Box key={i} flexDirection="column" marginTop={1}>
            <Text color={theme.accent} bold>▸ {l.role}</Text>
            <Text>  {l.org}  —  {l.period}</Text>
            {l.impact.map((line, idx) => (
              <Text key={idx}>  • {line}</Text>
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  if (command === 'contact') {
    const c = DATA.contact;
    return (
      <Box flexDirection="column" marginTop={1}>
        <Text><Text color={theme.accent} bold>  Email    : </Text>{c.email}</Text>
        <Text><Text color={theme.accent} bold>  GitHub   : </Text>{c.github}</Text>
        <Text><Text color={theme.accent} bold>  LinkedIn : </Text>{c.linkedin}</Text>
        <Text><Text color={theme.accent} bold>  SSH      : </Text>{c.ssh}</Text>
      </Box>
    );
  }

  if (command === 'help') {
    return (
      <Box flexDirection="column" marginTop={1}>
        <Text color={theme.subtitle} bold>Available commands:</Text>
        <Box flexDirection="column" marginTop={1} marginBottom={1}>
          <Text><Text color={theme.primary}>  whoami      </Text> - One liner about me</Text>
          <Text><Text color={theme.primary}>  projects    </Text> - Things I've built</Text>
          <Text><Text color={theme.primary}>  skills      </Text> - Tech stack & tools</Text>
          <Text><Text color={theme.primary}>  education   </Text> - Academic background</Text>
          <Text><Text color={theme.primary}>  leadership  </Text> - Roles & impact</Text>
          <Text><Text color={theme.primary}>  contact     </Text> - Get in touch</Text>
          <Text><Text color={theme.primary}>  clear       </Text> - Clear the screen</Text>
          <Text><Text color={theme.primary}>  help        </Text> - Show this message</Text>
          <Text><Text color={theme.primary}>  ctrl + t    </Text> - Switch colour theme</Text>
          <Text>                themes: solarized | tokyonight | matrix | nord</Text>
        </Box>

        <Text color={theme.subtitle} bold>Navigation:</Text>
        <Box flexDirection="column" marginTop={1}>
          <Text><Text color={theme.primary}>  Up/Down arrows  </Text> - Navigate command history</Text>
          <Text><Text color={theme.primary}>  Ctrl+C / [q]    </Text> - Exit</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box marginTop={1}>
      <Text color="red">command not found: </Text>
      <Text color={theme.primary}>{command}</Text>
      <Text>  (type </Text>
      <Text color={theme.primary}>help</Text>
      <Text> for available commands)</Text>
    </Box>
  );
}

// BOOT SEQUENCE COMPONENT
const BootSequence = ({ onComplete, color }: { onComplete: () => void, color: string }) => {
  const [text, setText] = useState('');
  const fullText = "securely connecting ssh.karthikn.tech...\naccess granted. welcome.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [fullText, onComplete]);

  return <Text color={color}>{text}</Text>;
};

// MAIN APP COMPONENT
export default function App() {
  const { exit } = useApp();
  const [booting, setBooting] = useState(true);
  
  const themeKeys = Object.keys(THEMES) as ThemeKey[];
  const [themeIndex, setThemeIndex] = useState<number>(1);
  const currentTheme = THEMES[themeKeys[themeIndex]];

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ cmd: string; output: React.ReactNode }[]>([]);
  
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [figletName, setFigletName] = useState('');

  // Fetch Larry 3D Name on mount
  useEffect(() => {
    figlet.text('Karthik N', { font: 'Larry 3D' as any }, (err, result) => {
      if (!err && result) setFigletName(result);
      else setFigletName('KARTHIK N');
    });
  }, []);

  useInput((char, key) => {
    // Ctrl+T to swap themes
    if (key.ctrl && char === 't') {
      setThemeIndex((prev) => (prev + 1) % themeKeys.length);
      return;
    }
    // Ctrl+C to quit
    if (key.ctrl && char === 'c') {
      exit();
      return;
    }
    
    // UP ARROW: Scroll back in history
    if (key.upArrow) {
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(newIndex);
      if (newIndex >= 0) setInput(commandHistory[newIndex]);
      return;
    }
    
    // DOWN ARROW: Scroll forward / return to blank input
    if (key.downArrow) {
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInput(newIndex >= 0 ? commandHistory[newIndex] : '');
      return;
    }
  });

  const handleCommand = (value: string) => {
    const cmd = value.trim();
    if (!cmd) return;

    // SAVE THE COMMAND AND RESET THE SCROLL INDEX
    setCommandHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);

    if (cmd.toLowerCase() === 'clear') {
      setHistory([]);
      return;
    }
    if (cmd.toLowerCase() === 'exit') {
      exit();
      return;
    }

    setHistory((prev) => [...prev, { cmd, output: <RenderOutput cmd={cmd} theme={currentTheme} /> }]);
  };

  if (booting) {
    return <BootSequence onComplete={() => setBooting(false)} color={currentTheme.primary} />;
  }

  return (
    <Box borderStyle="round" borderColor={currentTheme.dim} flexDirection="column" padding={2}>
      
      {/* --- TOP SECTION: STRICT LEFT & RIGHT LAYOUT --- */}
      {/* REMOVED flexWrap="wrap" so the text never stacks underneath the face */}
      <Box flexDirection="row" marginBottom={1}>
        
        {/* LEFT COLUMN (ASCII Face) */}
        {/* flexShrink={0} ensures the terminal never tries to squish your ASCII art */}
        <Box marginRight={5} flexShrink={0}>
          <AnimatedAscii text={ASCII_FACE} color={currentTheme.primary} charset=".: " />
        </Box>

        {/* RIGHT COLUMN (Name, Bio, Commands) */}
        {/* flexGrow={1} allows it to fill space. 
            flexShrink={1} allows it to narrow dynamically on small screens. 
            maxWidth={80} keeps it clean and compact on large screens. */}
        <Box flexDirection="column" flexGrow={1} flexShrink={1} maxWidth={80}>
          
          {/* Name Banner */}
          <Box marginTop={1}>
            {figletName ? (
               <Text color={currentTheme.primary} bold>{figletName}</Text>
            ) : (
               <Text color={currentTheme.primary}>Loading...</Text>
            )}
          </Box>
          
          {/* Bio */}
          <Box marginTop={1} marginBottom={1}>
            <Text color={currentTheme.primary}>
              {rawIntro}
            </Text>
          </Box>

          {/* Commands */}
          <Box flexDirection="column">
            <Text color={currentTheme.accent} bold>Explore the commands below to learn more</Text>
            <Box flexDirection="column" marginTop={1}>
              <Text><Text color={currentTheme.primary}>  whoami    </Text> - One liner about me</Text>
              <Text><Text color={currentTheme.primary}>  projects  </Text> - Things I've built</Text>
              <Text><Text color={currentTheme.primary}>  skills    </Text> - My tech stack</Text>
              <Text><Text color={currentTheme.primary}>  education </Text> - Academic background</Text>
              <Text><Text color={currentTheme.primary}>  leadership</Text> - Roles and impact</Text>
              <Text><Text color={currentTheme.primary}>  contact   </Text> - Links</Text>
              <Text><Text color={currentTheme.primary}>  clear     </Text> - Clears the screen</Text>
              <Text><Text color={currentTheme.primary}>  help      </Text> - Show available commands</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* --- BOTTOM SECTION: HISTORY AND ACTIVE PROMPT --- */}
      <Box flexDirection="column">
        
        {history.map((entry, i) => (
          <Box 
            flexDirection="column" 
            key={i} 
            marginBottom={1}
            borderStyle="round"
            borderColor={currentTheme.dim}
            paddingX={1}
          >

            <Box>
              <Text color={currentTheme.accent} bold>❯ </Text>
              <Text color={currentTheme.title} bold>{entry.cmd}</Text>
            </Box>
            
            {/* The Output */}
            {entry.output}
          </Box>
        ))}

        <Box>
          <Text color={currentTheme.accent} bold>
            {'[guest@karthikn ~]❯ '}
          </Text>
          <ThemedInput
            value={input}
            onChange={setInput}
            onSubmit={(val) => {
               handleCommand(val);
               setInput('');
            }}
            theme={currentTheme}
            active={true}
          />
        </Box>

        <Box marginTop={1}>
          <Text dimColor>Theme: {currentTheme.name} | Press Ctrl+T to change theme | Up/Down arrows to navigate history | [q] or Ctrl+C to quit</Text>
        </Box>

      </Box>
    </Box>
  );
}