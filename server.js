const express = require('express');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
const { notes } = require('./db/db.json');

function filterByQuery(query, notesArray) {
    let noteTextArray = [];
    let filteredResults = notesArray;
    if (query.noteText) {
        if (typeof query.noteText === 'string') {
            noteTextArray = [query.noteText];
        } else {
            noteTextArray = query.noteText;
        }
        noteTextArray.forEach(note => {
            filteredResults = filteredResults.filter(note => note.noteText.indexOf(text) !== -1);
        });
    }
    if (query.title) {
        filteredResults = filteredResults.filter(note => note.title === query.title);
    }
    if (query.text) {
        filteredResults = filteredResults.filter(note => note.text === query.text)
    }
    return filteredResults;
}

function findById(id, notesArray) {
    const result = notesArray.filter(note => note.id === id)[0];
    return result;
};

function createNewNote(body, notesArray) {
    const note = body;
    notesArray.push(note);
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify({ notes: notesArray }, null, 2)
    );
    return note;
}

function validateNote(note) {
    if (!note.title || typeof note.title !== 'string') {
        return false;
    }
    if (!note.text || typeof note.text !== 'string') {
        return false;
    }
    return true;
}

app.get('/api/notes', (req, res) => {
    let results = notes;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
    res.json(result);
});

app.delete('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    
    if (result === -1) return res.status(404).json({});

    notes.splice(result, 1);
    res.json(notes);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.post('/api/notes', (req, res) => {
    
    req.body.id = notes.length.toString();

    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted.');
    } else {
        const note = createNewNote(req.body, notes);
        res.json(note);
    }
});

app.listen(PORT, () => {
    console.log(`API Server now on port ${PORT}!`);
});