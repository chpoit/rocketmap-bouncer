# rocketmap-bouncer
This is a nodejs reverse-proxy type-thing that allows you to add accounts to your rocketmap map, preventing unwanted people from using it.

## Compatibility,
Should work on windows, you'll have to use something else than screen to keep it running however

## Quickstart

### Apache
Change your apache config to redirect to the port rocketmap-bouncer uses. (default: 4800) instead of the rocketmap port (defaults to 5000)

Change those lines:
````
ProxyPass / http://127.0.0.1:5000/
ProxyPassReverse / http://127.0.0.1:5000/
````
for (replace 4800 with whatever port you are using)
````
ProxyPass / http://127.0.0.1:4800/
ProxyPassReverse / http://127.0.0.1:4800/
````

### nginx
Change your nginx config to redirect to the port rocketmap-bouncer uses. (default: 4800)
(thats a TODO, obviously)

### rocketmap-bouncer

In the command line run: 
````cmd
cd /
git clone https://github.com/chpoit/rocketmap-bouncer.git
npm run build
````
To start it run: 
````cmd
screen -S rocketmap-bouncer
npm run start
ctrl+A, ctrl+D # To exit screen
````
Or directly:
````cmd
screen -d -m -S rocketmap-bouncer npm run start
````


If you dont want to clone the repo, download the server.js from the releases tab, put it on your server and run
````cmd
screen -d -m -S rocketmap-bouncer node /path/to/your/server.js
````

## Command line arguments
`--config-path "path to config file"`: this is where you put your config file,
by default the config loaded is in "/RocketMap/config/bouncer-config.ini" (assumes your rocketmap is installed on /)

## Config

Here is the base config:

```` ini
#

#Required config
bouncer-db-host:                #host running the mysql DB, required     
bouncer-db-port: 3306           #mysql port, defaults to 3306      
bouncer-db-name:                #name of the database, required
bouncer-db-user:                #Username that can read the DB, required
bouncer-db-pass:                #Password of the user that can read the DB, required


#Optionnal Config
#bouncer-admin: email@email.email  #This is the default user being created
#bouncer-admin-password: password #Make it good
#bouncer-port: 4800 #The port your apache/nginx config needs to point to, defaults to 4800
#bouncer-target: localhost #host address of the server running rocketmap, defaults to localhost
#bouncer-target-port: 5000 #port on which rocketmap runs, defaults to 5000
#bouncer-session-secret: any string really # this is the secret that wil be used to create the sessions for the users, set to a random string or leave empty. Do not use '#''s in the string, anytihng after will be treated as a comment. Try to have it be really long, you can use a password generator Example: "XCt%AJIZbAHT^6mS4jo9"
#bouncer-no-special-code: false # default: false, disables the need to have a code to create an account
#bouncer-locale: en # language various things, defaults to en, support fr and en right now.
````

In theory, you could put it in the same config file as rocketmap, however, rocketmap panics when there are unknown items in the config.
If you become able to add extra stuff in the rocketmap conf, here are those that rocketmap-bouncer supports:
```` ini
db-host:                #host running the mysql DB, required     
db-port:                #mysql port, defaults to 3306      
db-name:                #name of the database
db-user:                #Username that can read the DB
db-pass:                #Password of the user that cna read the DB
locale:                 #language of various things
````
> CAUTION: If you have **bouncer-db-host** and **db-host**, **bouncer-db-host** will take priority, the same is true for any of the rocketmap config rocketmap-bouncer supports.

> You cannot use the same port for rocketmap and the bouncer.


## Environment variables

Currently, there is one supported environment variable, `ignore`, if it is set to true, anyone will be allowed to use the map and no account confirmation will be done. you can set it to anything truthy or falsy and it will also work.


