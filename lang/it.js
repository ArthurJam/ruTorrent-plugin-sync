theUILang.sync = {
    option: {
        title: {
            page: 'Synchronization',
            section_host: 'Host configuration',
            new: 'Adding a host',
            edit: 'Editing a host',
            delete: 'Deleting a host'
        },
        button: {
            new: 'Add',
            edit: 'Edit',
            delete: 'Delete'
        },
        label: {
            name: 'Name',
            protocol: 'Ptotocol',
            host: 'Server address',
            port: 'Server port',
            path: 'Server path',
            secure: 'Security',
            username: 'Username',
            password: 'Password',
            certificate: {
                private: 'Private key',
                public: 'Public key',
                passphrase: 'Passphrase'
            }
        },
        select: {
            protocol: {
                ftp: 'FTP',
                ftpes: 'Explicit FTP over TLS',
                ftps: 'Implicit FTP over TLS',
                sftp: 'SFTP'
            },
            secure: {
                none: 'None',
                identity: 'Username / Password',
                certificate: 'Key'
            }
        },
        message: {
            delete: 'You are about to remove the host "%name%".'
        }
    },
    task: {
        add: {
            error: 'An error occurred while programming the synchronization tasks.',
            success: '%torrent% : %count% synchronized files.'
        }
    }
};