'use strict';

const Eris = require('eris');
const fs = require('fs');
const CommandManager = require('./src/CommandManager');
const Commands = require('./src/Commands');
const SongPlayer = require('./src/SongPlayer');

global.App = {};

App.Config = JSON.parse(fs.readFileSync('config.cf', 'utf8'));
App.Client = new Eris.Client(App.Config.dcToken);
App.CommandManager = new CommandManager();
App.SongPlayer = new SongPlayer();

Commands();
App.Client.connect();

