# ITP-ICM

I made a cool little app to use facemesh (wathing codetrain) to get the corinates for the right eye, then i with a litle help from AI (and right mouse click an dlooking at the console per codetrin) took the corinates and put them in an image and then create a series of lines of eyes and the nover time by using the mod of the time create random eyes. I wanted to draw a mandlebraute set but that turned out to be a little too much a little two fast.

jeremy


# ITP-ICMhw
Homework Blog for ICM Week4

Today I have to ask a question but at this very moment I don't have any other then from my conversation with my Dauther, she was talking to me about loops, 

Julia said there are a few kinds of loops and one kind of loop she mentioned was a forever loop. I am not sure if this was taught to her as a concept or its a function.
Another concept I am having trouble with is the use of AI, I agree that having the AI program for you is bad, however I am struggling for example with the concept of using the AI to lookup and help with understanding how comands work and reflect on Aristial and his opinion of the abacus. I was about to type forever loop p5js into google but now it applies AI to its search. My own rules have been to use AI like documention so for example please show me how ot create a beep using native comands no libraries and then to rerype the code and edit it.

I also miss case statements which I remeber from pascal, and have been fustrated by this P5's crashing without the benfit of ^C I wonder if there is a browser that is more robust then chrome or edge for p5 editor?

Finally this did get me thinking about creating a function called safewhile

Safewhile alias (SWHILE) works like while but is used for development (so you can copy and paste it). It runs while two things are true, 
A) the initial logic for example mouseX>width
B) FrameCount < 100000 (or some other number)

I rlized this would not work because while in a loop the framecount may not increment.

To fix this I think I would need to create a verable that has a really weird name so that it never gets used (unless there is a defined comand ot track the number of loops you are in inside a while)

So Safewhle would look like this.


//safewhile is a universal function that should be put into all code that lets you write test code and never crash in the braoswer and loose the code you typed. YOuc an also avoid this by remebering to save your code and turn on autosave.

Function Safewhile (TStatement) /TStatemetn means true statement that passes into when called)
         let Beginer42 =1 //name my child picked for discord which is not likely to conflict with other code in other programs.
         While (Beginer42 < 1000 && TSstatment) {
         Beginer42++ //increase number by 1
         //at this point I relize the code is done and I need to do more reearch to see how I can pass an an entire code block into a function.
         ]

I also now wonder who onSe creates an alais of a function name.

I feel like its cheating because I should research this before asking the question, but how Coudl I complete  SWHILE in terms of a code block being pased into a function so the sytax is identical to while?

Also I now relize a seccond qustion is if there is a better apporch to do the same thing.

I aslo make the obersatin that at least for me the mixing of capital and lowercase in system constants like mouseX makes me crazy why did they not just use all caps?

=Jeremy




# ITP-ICMhw
Homework Blog for ICM Week

Had a little fun coding, from last class I realized I needed to add comments to code. I think I enjoyed not commenting my code, but alas comments and spelling errors return.
I relized i miss tab complete because of spelling. I played with sound calls I found from openAI. I spent too much time on that and not enough of the idea of the project. THough there was a clear relainship between draw calls and tone when they can overlap inside a draw function

# ITP-ICMhw
Homework Blog for ICM

This reminds me of "finger carmack@id.com" intresting fact finger took down the whole internet decades ago. I enjoy computer because they are a platform that lets you not only create but ittrate forver. They also help me somewhat with spelling.

---

# Week 13: Final Projects

## Project 1: P5JS.AI - AI-Powered Creative Coding Environment

### What is it?

**P5JS.AI** is a web application that combines the p5.js web editor with an AI coding assistant, creating a powerful creative coding environment similar to Cursor or Windsurf, but specifically designed for p5.js sketches.

- **Live Demo:** [p5jsai.netlify.app](https://p5jsai.netlify.app)
- **Code:** [github.com/xelsed/p5ai](https://github.com/xelsed/p5ai)

### What does it do?

P5JS.AI provides a split-pane interface where:
- **Left panel:** The full p5.js web editor (embedded)
- **Right panel:** An AI assistant powered by the Cascade API

The AI can see your code and help you:
- Generate new p5.js sketches from descriptions
- Debug errors in your code
- Explain how code works
- Suggest creative modifications
- Apply code changes directly to the editor

### How does it work computationally?

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────────────┐    ┌──────────────────────────┐   │
│  │  P5EditorFrame   │    │     CascadePanel         │   │
│  │  (iframe embed)  │◄──►│  (AI Chat Interface)     │   │
│  └──────────────────┘    └──────────────────────────┘   │
│            │                        │                    │
│            │                        ▼                    │
│            │              ┌──────────────────┐          │
│            │              │   Cascade API    │          │
│            │              │  (AI Backend)    │          │
│            │              └──────────────────┘          │
└────────────┼────────────────────────────────────────────┘
             ▼
    ┌──────────────────┐
    │  p5.js Editor    │
    │  (editor.p5js.org)│
    └──────────────────┘
```

**Key Technologies:**
- **React 18** - UI framework with hooks for state management
- **TypeScript** - Type safety for better code quality
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **react-resizable-panels** - Split-pane layout with drag-to-resize
- **Cascade API** - AI language model integration

### What was my process?

1. **Problem identification:** The p5.js web editor is great, but lacks AI assistance. Tools like Cursor and Windsurf show how powerful AI-assisted coding can be.

2. **Design decision:** Rather than modifying the p5.js editor source code, I chose to embed it in an iframe alongside an AI panel. This keeps the editor fully functional while adding AI capabilities.

3. **Implementation:**
   - Set up React + TypeScript + Vite project
   - Created resizable split-pane layout
   - Embedded p5.js editor as an iframe
   - Built AI chat interface with message history
   - Integrated Cascade API for AI responses

4. **Deployment:** Configured for Netlify with automatic deploys

---

## Project 2: HWPipeline - Automated Homework Tracker

### What is it?

**HWPipeline** is an AI-powered web application that automatically scrapes, extracts, and organizes homework assignments from ITP course wiki pages on GitHub.

- **Live Demo:** [hwpipeline-production.up.railway.app](https://hwpipeline-production.up.railway.app)
- **Code:** [github.com/xelsed/HWPIPELINE](https://github.com/xelsed/HWPIPELINE)

### What does it do?

HWPipeline solves a real problem: keeping track of homework across multiple ITP courses and sections. It:

1. **Scrapes** homework pages from GitHub wiki (ITPNYU/ICM-2025-Media, etc.)
2. **Uses AI** to extract structured assignment data (title, description, due date, week number)
3. **Normalizes** the data into a consistent format
4. **Displays** assignments in a searchable, filterable dashboard
5. **Exports** to calendar (ICS format) for integration with Google Calendar

### How does it work computationally?

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SCRAPE    │────>│   EXTRACT   │────>│  NORMALIZE  │
│  (requests  │     │  (OpenAI    │     │  (Python)   │
│   + BS4)    │     │   GPT-4)    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────┐
│                     FLASK WEB APP                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Dashboard  │  │ Assignments │  │  Calendar   │     │
│  │             │  │   Table     │  │    View     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                           │                             │
│                           ▼                             │
│                    ┌─────────────┐                      │
│                    │  SQLite DB  │                      │
│                    └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

**Key Technologies:**
- **Flask** - Python web framework
- **Flask-SocketIO** - Real-time WebSocket updates during pipeline runs
- **OpenAI GPT-4** - AI extraction of structured data from unstructured wiki text
- **BeautifulSoup4** - HTML parsing for web scraping
- **SQLite** - Lightweight database for assignments storage
- **Gunicorn + Eventlet** - Production WSGI server

### The AI Pipeline (5 Steps)

1. **SCRAPE:** Fetches HTML from GitHub wiki pages using `requests`. Uses AI to identify which links lead to homework pages.

2. **DISCOVER:** AI analyzes page structure to find the pattern of homework entries (looks for weeks, assignments, due dates).

3. **EXTRACT:** For each section's homework page, GPT-4 extracts assignment titles, descriptions, week numbers, due dates, and instructor names.

4. **NORMALIZE:** Python code standardizes the data with consistent date formats, week number validation, and deduplication.

5. **STORE:** Saves to SQLite database with proper indexing.

The app uses Socket.IO to stream progress updates to the browser during pipeline execution - you can watch each step complete in real-time!

### What was my process?

1. **Problem:** I was manually checking 7+ different wiki pages each week for homework across ICM sections. This was tedious and error-prone.

2. **Solution design:** Build an automated pipeline that scrapes all sections automatically, uses AI to understand unstructured wiki content, and presents everything in one unified dashboard.

3. **Iterative development:**
   - Started with basic scraping
   - Added AI extraction (the hard part - wiki formats vary!)
   - Built web dashboard with Flask
   - Added real-time progress with Socket.IO
   - Added calendar export
   - Deployed to Railway

4. **AI prompt engineering:** The trickiest part was getting GPT-4 to reliably extract assignments from varied wiki formats. Each instructor formats their page differently!

---

## Computational Concepts Used

Both projects demonstrate key ICM concepts:
- **APIs:** OpenAI API, Cascade API, GitHub API
- **Data structures:** JSON, databases, structured data extraction
- **Web development:** React, Flask, HTTP requests
- **Automation:** Web scraping, AI-powered data extraction
- **Real-time communication:** WebSockets for live updates

=Jeremy
