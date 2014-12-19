theUILang.sync = {
    option: {
        title: {
            page: 'Synchronisation',
            section_host: 'Configuration des hôtes',
            new: 'Ajouter un hôte',
            edit: 'Modifier un hôte',
            delete: 'Supprimer un hôte'
        },
        button: {
            new: 'Ajouter',
            edit: 'Modifier',
            delete: 'Supprimer'
        },
        label: {
            name: 'Nom',
            protocol: 'Protocole',
            host: 'Adresse du serveur',
            port: 'Port du serveur',
            path: 'Dossier sur le serveur',
            secure: 'Sécurité',
            username: 'Utilisateur',
            password: 'Mot de passe',
            certificate: {
                private: 'Clé privée',
                public: 'Clé publique',
                passphrase: 'Phrase secrète'
            }
        },
        select: {
            protocol: {
                ftp: 'FTP',
                ftpes: 'FTP explicite sur TLS',
                ftps: 'FTP implicite sur TLS',
                sftp: 'SFTP'
            },
            secure: {
                none: 'Aucune',
                identity: 'Utilisateur / Mot de passe',
                certificate: 'Clé'
            }
        },
        message: {
            delete: 'Vous êtes sur le point de supprimer l\'hôte "%name%".'
        }
    },
    task: {
        add: {
            error: 'Une erreur s\'est produite lors de la programmation des tâches de synchronisation.',
            success: '%torrent% : %count% fichiers synchronisés.'
        }
    }
};