/*jslint node: true, plusplus: true, white: true*/

"use strict";

var startTime = new Date().getTime();

var express = require('express'),
    path = require('path'),
    storage = require('node-persist'),
    shortId = require('shortid'),
    bodyParser = require('body-parser'),
    xss = require('xss'),
    APP_PORT = 3000;

var Sanitizer = (function () {
    return {
        sanitizeString: function (s) {
            if (typeof s !== 'string') {
                return '';
            }
            return xss(s);
        },
        sanitizetBoolean: function (b) {
            return !!b;
        }
    };
}());

var Note = function (title, color, items, creationDate) {
    function sanitizeItem(item) {
        return {
            id: item.id,
            label: Sanitizer.sanitizeString(item.label),
            isDone: Sanitizer.sanitizetBoolean(item.isDone)
        };
    }

    function sanitizeItems(items) {
        var result = [],
            i;
        if (items instanceof Array) {
            for (i = 0; i < items.length; i++) {
                result.push(sanitizeItem(items[i]));
            }
        }
        return result;
    }

    this.title = Sanitizer.sanitizeString(title);
    this.color = Note.COLOR.sanitize(color);
    this.items = sanitizeItems(items);
    var now = new Date().getTime();
    this.creationDate = creationDate || now;
};


Note.COLOR = {
    yellow: 'yellow',
    green: 'green',
    blue: 'blue',
    red: 'red'
};

Note.COLOR.DEFAULT = Note.COLOR.yellow;

Note.COLOR.sanitize = function (color) {
    return Note.COLOR[color] || Note.COLOR.DEFAULT;
};

Note.prototype.setColor = function (color) {
    this.color = Note.COLOR.sanitize(color);
};

Note.prototype.addNewItem = function (id) {
    var newItem = {
        id: id,
        label: '',
        isDone: false
    };
    this.items.push(newItem);
    return newItem;
};

Note.prototype.updateItemLabel = function (i, value) {
    if (0 <= i && i < this.items.length) {
        this.items[i].label = Sanitizer.sanitizeString(value);
    }
};

Note.prototype.setTitle = function (title) {
    this.title = Sanitizer.sanitizeString(title);
};

var db = (function () {
    var NOTE_KEY = 'note';

    function getItemIndexById(id, arr) {
        var i,
            isFound = false;
        for (i = 0; i < arr.length && !isFound; i++) {
            if (arr[i].id === id) {
                isFound = true;
            }
        }
        if (isFound) {
            return [i - 1];
        } else {
            return -1;
        }
    }

    function updateNote(note) {
        storage.setItem(NOTE_KEY, note);
    }

    return {
        init: function () {
            storage.initSync({
                //logging: true,
                dir: 'db/'
            });
            console.log('Database initialized');
        },
        createNote: function (note) {
            var i,
                err;
            try {
                if (note instanceof Note) {
                    for (i = 0; i < note.items.length; i++) {
                        note.items[i].id = shortId.generate();
                    }
                    storage.setItem(NOTE_KEY, note);
                    console.log('Note created.');
                } else {
                    err = "The parameter is not an instance of Note!";
                    console.error(err);
                    throw new Error(err);
                }
            } catch (e) {
                console.error(e);
                throw new Error('Error while creating the note!');
            }
        },
        getNote: function () {
            try {
                var note = storage.getItem(NOTE_KEY);
                if (note) {
                    return new Note(note.title, note.color, note.items, note.creationDate);
                } else {
                    return null;
                }
            } catch (e) {
                console.error(e);
                throw new Error('Error while retrieving the note!');
            }
        },
        clear: function () {
            try {
                storage.clear();
                console.log('Database cleared');
            } catch (e) {
                console.error(e);
                throw new Error('Error in clearing the database!');
            }
        },
        updateTitle: function (title) {
            try {
                var note = db.getNote();
                note.setTitle(title);
                updateNote(note);
                console.log('Title updated');
            } catch (e) {
                console.error(e);
                throw new Error('Couldn\'t update the title.');
            }
        },
        updateColor: function (color) {
            try {
                var note = db.getNote();
                note.setColor(color);
                updateNote(note);
                console.log('Title updated');
            } catch (e) {
                console.error(e);
                throw new Error('Couldn\'t update the color.');
            }
        },
        updateItemIsDone: function (itemId, isDone) {
            var note = db.getNote(),
                itemIdx;
            if (note && note.items) {
                itemIdx = getItemIndexById(itemId, note.items);
                if (itemIdx >= 0) {
                    note.items[itemIdx].isDone = (isDone === 'true');
                    updateNote(note);
                    console.log('Item status updated to ' + (note.items[itemIdx].isDone ? 'done' : 'not done'));
                    return note.items[itemIdx];
                } else {
                    throw new Error('The item with id "' + itemId + '" couldn\'t be found.');
                }
            } else {
                throw new Error('No note could be found in the database!');
            }
        },
        deleteItem: function (itemId) {
            var note = db.getNote(),
                itemIdx;
            if (note && note.items) {
                itemIdx = getItemIndexById(itemId, note.items);
                if (itemIdx >= 0) {
                    note.items.splice(itemIdx, 1);
                    updateNote(note);
                    console.log('Item deleted');
                } else {
                    throw new Error('The item with id "' + itemId + '" couldn\'t be found.');
                }
            } else {
                throw new Error('No note could be found in the database!');
            }
        },
        getNewItem: function () {
            try {
                var note = db.getNote(),
                    newItem = note.addNewItem(shortId.generate());
                updateNote(note);
                console.log('New item created');
                return newItem;
            } catch (e) {
                console.error(e);
                throw new Error('Error while creating a new item!');
            }
        },
        updateItem: function (itemId, value) {
            var note = db.getNote(),
                itemIdx;
            if (note && note.items) {
                itemIdx = getItemIndexById(itemId, note.items);
                if (itemIdx >= 0) {
                    note.updateItemLabel(itemIdx, value);
                    updateNote(note);
                    console.log('Item label updated');
                } else {
                    throw new Error('The item with id "' + itemId + '" couldn\'t be found.');
                }
            } else {
                throw new Error('No note could be found in the database!');
            }
        }
    };
}());

var messenger = (function () {
    function send(res, data, statusCode) {
        res.status(statusCode).send(data);
    }

    return {
        sendMessage: function (res, data) {
            send(res, data, 200);
        },
        sendError: function (res, data, statusCode) {
            send(res, data, statusCode || 500);
        }
    };
}());

db.init();

if (process.argv[2] === 'init') {
    db.clear();

    db.createNote(new Note('TODO list', Note.COLOR.yellow, [
        {
            label: 'Buy beer',
            isDone: false
        },
        {
            label: 'Clean the room',
            isDone: false
        },
        {
            label: 'Call the plumber',
            isDone: true
        },
        {
            label: 'Throw the garbage out',
            isDone: false
        },
        {
            label: 'Feed the dog',
            isDone: true
        },
        {
            label: 'Buy a car',
            isDone: false
        },
        {
            label: 'Visit the Taj Mahal',
            isDone: false
        },
        {
            label: 'See the Northern Lights',
            isDone: false
        },
        {
            label: 'Fly over the Great Barrier Reef',
            isDone: false
        },
        {
            label: 'Read "JavaScript - The Good Parts"',
            isDone: true
        },
        {
            label: 'Read "Learning JavaScript Design Patterns"',
            isDone: false
        },
        {
            label: 'Read "CSS: The Definitive Guide"',
            isDone: false
        },
        {
            label: 'Watch the Gotfather',
            isDone: false
        },
        {
            label: 'Watch The Equalizer',
            isDone: false
        },
        {
            label: 'Watch Star Wars',
            isDone: false
        }
    ]));
} else if (process.argv[2] === 'fresh') {
    db.clear();
    db.createNote(new Note());
}

if (!db.getNote()) {
    console.log('No note could be found in the database, autocreating...');
    db.createNote(new Note());
}

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'web')));

app.get('/note/get', function (req, res) {
    try {
        var result = db.getNote(),
            errorMessage;
        if (!result) {
            errorMessage = 'No note could be found in the database.';
            console.error(errorMessage);
            messenger.sendError(res, errorMessage, 404);
        } else {
            messenger.sendMessage(res, result);
        }
    } catch (e) {
        console.error(e.message);
        messenger.sendError(res, 'Couldn\'t get the note. Please check back later.');
    }
});

app.post('/note/updateColor', function (req, res) {
    try {
        db.updateColor(req.body.color);
        messenger.sendMessage(res);
    } catch (e) {
        console.error(e);
        messenger.sendError(res, 'Couldn\'t update the color.');
    }
});

app.post('/note/:id/updateItemIsDone', function (req, res) {
    try {
        var item = db.updateItemIsDone(req.params.id, req.body.isDone);
        messenger.sendMessage(res, item);
    } catch (e) {
        console.error(e);
        messenger.sendError(res, 'Couldn\'t update the item.');
    }
});

app.post('/note/:id/delete', function (req, res) {
    try {
        db.deleteItem(req.params.id);
        messenger.sendMessage(res);
    } catch (e) {
        console.error(e);
        messenger.sendError(res, 'An error occurred when deleting the item.');
    }
});

app.get('/note/newItem', function (req, res) {
    try {
        var newItem = db.getNewItem();
        messenger.sendMessage(res, newItem);
    } catch (e) {
        console.error(e);
        messenger.sendError(res, 'Couldn\'t create a new item. What a shame.');
    }
});

app.post('/note/updateTitle', function (req, res) {
    try {
        db.updateTitle(req.body.value);
        messenger.sendMessage(res);
    } catch (e) {
        console.error(e);
        messenger.sendError(res, 'Error while updating the title.');
    }
});

app.post('/note/:id/updateItem', function (req, res) {
    try {
        db.updateItem(req.params.id, req.body.value);
        messenger.sendMessage(res);
    } catch (e) {
        console.error(e);
        messenger.sendError(res, 'Cound\'t update the item.');
    }
});

app.listen(APP_PORT);

console.log('Server startup in ' + (new Date().getTime() - startTime) + 'ms');
console.log('Server running on http://localhost:' + APP_PORT);
