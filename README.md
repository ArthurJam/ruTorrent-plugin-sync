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

1. Configure FTP hosts in the settings.
2. Right click on torrents list or on files list and use Sync menu.

Known issues
------------

- SFTP with passphrase (CURL seems not use --pass option)
