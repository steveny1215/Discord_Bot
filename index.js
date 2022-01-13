const Discord = require('discord.js');
const bot = new Discord.Client();

const config = require('./config.json');
const ytdl = require("ytdl-core");

var version = '1.0.1';
var servers = {};   //holds the queue

bot.on('ready', () => {
    console.log('This bot is online!');
})

bot.on('message', message =>{
    
    let args = message.content.substring(config.prefix.length).split(" ");

    switch(args[0]){
        case 'play':

            function play(connection, message){
                var server = servers[message.guild.id];
                server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
                server.queue.shift();
                server.dispatcher.on("end", function(){
                    if(server.queue[0]){
                        play(connection, message);
                    }else {
                        connection.disconnect();
                    }
                })
            }


            if(!args[1]){
                message.channel.send("you need to provide a link!");
                return;
            } 
            // not checking if second argument is a link
            if(!message.member.voiceChannel){
                message.channel.send("You must be in a channel to play the bot.");
                return;
            }
            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }
            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
                play(connection, message);

            })


        break;

        case 'skip':
            var server = servers[message.guild.id];
            if (server.dispatcher) server.dispatcher.end();
            message.channel.send("Skipped song!")
        break;
        
        case 'stop':
            var server = servers[message.guild.id];
            if (message.guild.voiceConnection){
                for (var i = server.queue.length -1; i >= 0; i --){
                    server.queue.splice(i, 1);
                }

                server.dispatcher.end();
                message.channel.send("Ending the queue and will leave voice channel.")
                console.log('stopped the queue');
            }

            if (message.guild.connection) message.guild.voiceConnection.disconnect();
        break;
    }
})

bot.login(config.token)