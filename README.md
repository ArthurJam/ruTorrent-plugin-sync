ruTorrent Sync Plugin
=====================

This plugin allows you to synchronize files remotely via the interface ruTorrent.

Protocols
---------

- FTP
- FTPS (implicit / explicit)
- SFTP

Requirements
------------

- PHP
- CURL

Installation
------------

Go to ruTorrent's plugins folder and execute the following command :

```
git clone https://github.com/ArthurJam/ruTorrent-plugin-sync.git sync
```

Usage
-----

Right click on torrent list or file list and use Sync menu.

Known issues
------------

- SFTP with passphrase (CURL seems not use --pass option)
